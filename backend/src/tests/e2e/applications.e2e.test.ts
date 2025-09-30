import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanupTestData, createTestAdmin, loginAndGetToken, createTestJob, createTestJobWithQuestions, createTestJobWithAllQuestionTypes, createTestPositions } from '../setup';
import { buildTestApp } from '../../server';
import { i18n } from '../../i18n/i18n';
import FormData from 'form-data';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

describe('Applications E2E Tests', () => {
  let app: any;
  let adminToken: string;
  let jobId: string;
  let questionIds: any;

  beforeEach(async () => {
    app = await buildTestApp();
    await cleanupTestData();
    await createTestAdmin();
    adminToken = await loginAndGetToken(app);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Application HTTP End-to-End Tests', () => {
    it('should submit application successfully without resume via HTTP', async () => {
      // Arrange - Create test job with questions
      const { position } = await createTestJob();
      const { job, question1, question2, question3 } = await createTestJobWithQuestions(app, adminToken, position.id);
      
      jobId = job.id;
      questionIds = { shortText: question1.id, multipleChoice: question2.id, longText: question3.id };

      const answers = [
        {
          questionId: question1.id,
          value: 'João Silva',
        },
        {
          questionId: question2.id,
          value: 'JavaScript',
        },
        {
          questionId: question3.id,
          value: 'Tenho 3 anos de experiência com React e TypeScript.',
        },
      ];

      // Act - Test HTTP route end-to-end
      const response = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${job.slug}`,
        payload: { 
          answers,
          recaptchaToken: 'test-recaptcha-token'
        },
      });

      // Assert
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.jobId).toBe(jobId);
      expect(body.data.answers).toHaveLength(3);
      expect(body.data.answers[0].textValue).toBe('João Silva');
      expect(body.data.answers[1].textValue).toBe('JavaScript');
      expect(body.data.answers[2].textValue).toBe('Tenho 3 anos de experiência com React e TypeScript.');
    });

    it('should submit application successfully with resume via HTTP', async () => {
      // Arrange - Create test job with questions and require resume
      const { position } = await createTestJob();
      const { job, shortText, longText, multipleChoice, singleChoice } = await createTestJobWithAllQuestionTypes(app, adminToken, position.id);
      jobId = job.id;

      // Update job to require resume via HTTP
      const updateResponse = await app.inject({
        method: 'PUT',
        url: `/api/jobs/${jobId}`,
        payload: { requiresResume: true },
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      expect(updateResponse.statusCode).toBe(200);

      const answers = [
        {
          questionId: shortText.id,
          value: 'Maria Santos',
        },
        {
          questionId: longText.id,
          value: 'Tenho 5 anos de experiência com React, Node.js e TypeScript.',
        },
        {
          questionId: multipleChoice.id,
          value: 'JavaScript,TypeScript,React',
        },
        {
          questionId: singleChoice.id,
          value: 'advanced',
        },
      ];

      // Create a real PDF buffer for testing
      const testPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test Resume) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF');

      // Create form data for multipart request
      const formData = new FormData();
      formData.append('answers', JSON.stringify(answers));
      formData.append('recaptchaToken', 'test-recaptcha-token');
      formData.append('resume', testPdfBuffer, {
        filename: 'test-resume.pdf',
        contentType: 'application/pdf'
      });

      // Act - Test HTTP route end-to-end with real PDF upload
      const response = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${job.slug}`,
        payload: formData,
        headers: formData.getHeaders(),
      });

      // Assert
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.jobId).toBe(jobId);
      expect(body.data.answers).toHaveLength(4);
      expect(body.data.answers[0].textValue).toBe('Maria Santos');
      expect(body.data.answers[1].textValue).toBe('Tenho 5 anos de experiência com React, Node.js e TypeScript.');
      expect(body.data.answers[2].textValue).toBe('JavaScript,TypeScript,React');
      expect(body.data.answers[3].textValue).toBe('advanced');
    });

    it('should fail with non-existent job via HTTP', async () => {
      // Act - Test HTTP route with non-existent job slug
      const response = await app.inject({
        method: 'POST',
        url: '/api/applications/submit/slug-inexistente',
        payload: { 
          answers: JSON.stringify([{
            questionId: 'clh1234567890123456789012',
            value: 'João Silva',
          }]),
          recaptchaToken: 'test-recaptcha-token'
        },
      });

      // Assert
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    it('should fail with invalid answers via HTTP', async () => {
      // Arrange - Create test job with questions
      const { position } = await createTestJob();
      const { job, shortText } = await createTestJobWithAllQuestionTypes(app, adminToken, position.id);
      jobId = job.id;

      const answers = [
        {
          questionId: shortText.id,
          // Missing textValue
        },
      ];

      // Act - Test HTTP route with invalid answers
      const response = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${job.slug}`,
        payload: { answers },
      });

      // Assert
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });
  });

  describe('Application Retrieval HTTP End-to-End Tests', () => {
    it('should get applications with pagination via HTTP', async () => {
      // Arrange - Create test job with questions
      const { position } = await createTestJob();
      const { job, shortText, longText, multipleChoice, singleChoice } = await createTestJobWithAllQuestionTypes(app, adminToken, position.id);
      jobId = job.id;

      // Create first application
      const application1Response = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${job.slug}`,
        payload: {
          answers: [
            { questionId: shortText.id, value: 'João Silva' },
            { questionId: longText.id, value: 'Tenho 3 anos de experiência com React.' },
            { questionId: multipleChoice.id, value: 'JavaScript,TypeScript,React' },
            { questionId: singleChoice.id, value: 'advanced' },
          ],
          recaptchaToken: 'test-recaptcha-token'
        },
      });
      
      expect(application1Response.statusCode).toBe(201);

      // Create second application
      const application2Response = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${job.slug}`,
        payload: {
          answers: [
            { questionId: shortText.id, value: 'Maria Santos' },
            { questionId: longText.id, value: 'Tenho 5 anos de experiência com React.' },
            { questionId: multipleChoice.id, value: 'JavaScript,Node.js,Python' },
            { questionId: singleChoice.id, value: 'expert' },
          ],
          recaptchaToken: 'test-recaptcha-token'
        },
      });
      expect(application2Response.statusCode).toBe(201);

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'GET',
        url: '/api/applications?page=1&limit=10',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.pagination.total).toBe(2);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(10);
    });

    it('should get applications with job filter via HTTP', async () => {
      // Arrange - Create test job with questions
      const { position } = await createTestJob();
      const { job, shortText, longText, multipleChoice, singleChoice } = await createTestJobWithAllQuestionTypes(app, adminToken, position.id);
      jobId = job.id;

      // Create application for this job
      const applicationResponse = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${job.slug}`,
        payload: {
          answers: [
            { questionId: shortText.id, value: 'João Silva' },
            { questionId: longText.id, value: 'Tenho 3 anos de experiência com React.' },
            { questionId: multipleChoice.id, value: 'JavaScript,TypeScript,React' },
            { questionId: singleChoice.id, value: 'advanced' },
          ],
          recaptchaToken: 'test-recaptcha-token'
        },
      });
      expect(applicationResponse.statusCode).toBe(201);

      // Create another job and application with different position to avoid slug conflict
      const positions = await createTestPositions();
      const anotherPosition = positions[1]; // Use second position
      
      // Create second job manually with different slug
      const anotherJobData = {
        title: 'Vaga com Todos os Tipos de Questões 2',
        description: 'Vaga para testar todos os tipos de questões - segunda vaga',
        slug: 'vaga-todos-tipos-questoes-2',
        requiresResume: false,
        positionId: anotherPosition.id,
        isActive: true,
      };
      
      const anotherJobResponse = await app.inject({
        method: 'POST',
        url: '/api/jobs',
        payload: anotherJobData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      const anotherJob = JSON.parse(anotherJobResponse.body).data;
      
      // Create questions for the second job
      const anotherShortTextData = {
        label: 'Qual sua pretensão salarial?',
        type: 'SHORT_TEXT',
        isRequired: true,
        order: 1,
      };
      
      const anotherLongTextData = {
        label: 'Descreva um projeto que você desenvolveu recentemente',
        type: 'LONG_TEXT',
        isRequired: true,
        order: 2,
      };
      
      const anotherMultipleChoiceData = {
        label: 'Quais tecnologias você tem experiência? (selecione todas)',
        type: 'MULTIPLE_CHOICE',
        isRequired: true,
        order: 3,
        options: [
          { id: 'opt1', label: 'JavaScript', value: 'javascript' },
          { id: 'opt2', label: 'TypeScript', value: 'typescript' },
          { id: 'opt3', label: 'React', value: 'react' },
          { id: 'opt4', label: 'Node.js', value: 'nodejs' },
        ],
      };
      
      const anotherSingleChoiceData = {
        label: 'Qual seu nível de experiência?',
        type: 'SINGLE_CHOICE',
        isRequired: true,
        order: 4,
        options: [
          { id: 'opt1', label: 'Iniciante', value: 'beginner' },
          { id: 'opt2', label: 'Intermediário', value: 'intermediate' },
          { id: 'opt3', label: 'Avançado', value: 'advanced' },
          { id: 'opt4', label: 'Especialista', value: 'expert' },
        ],
      };
      
      // Create questions for second job
      const anotherShortTextResponse = await app.inject({
        method: 'POST',
        url: `/api/jobs/${anotherJob.id}/questions`,
        payload: anotherShortTextData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      const anotherShortText = JSON.parse(anotherShortTextResponse.body).data;
      
      const anotherLongTextResponse = await app.inject({
        method: 'POST',
        url: `/api/jobs/${anotherJob.id}/questions`,
        payload: anotherLongTextData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      const anotherLongText = JSON.parse(anotherLongTextResponse.body).data;
      
      const anotherMultipleChoiceResponse = await app.inject({
        method: 'POST',
        url: `/api/jobs/${anotherJob.id}/questions`,
        payload: anotherMultipleChoiceData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      const anotherMultipleChoice = JSON.parse(anotherMultipleChoiceResponse.body).data;
      
      const anotherSingleChoiceResponse = await app.inject({
        method: 'POST',
        url: `/api/jobs/${anotherJob.id}/questions`,
        payload: anotherSingleChoiceData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      const anotherSingleChoice = JSON.parse(anotherSingleChoiceResponse.body).data;
      const anotherApplicationResponse = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${anotherJob.slug}`,
        payload: {
          answers: [
            { questionId: anotherShortText.id, value: 'Pedro Costa' },
            { questionId: anotherLongText.id, value: 'Tenho 5 anos de experiência com Node.js.' },
            { questionId: anotherMultipleChoice.id, value: 'Node.js,Python,Java' },
            { questionId: anotherSingleChoice.id, value: 'expert' },
          ],
          recaptchaToken: 'test-recaptcha-token'
        },
      });
      
      expect(anotherApplicationResponse.statusCode).toBe(201);

      // Act - Filter by specific job via HTTP
      const response = await app.inject({
        method: 'GET',
        url: `/api/applications/job/${jobId}?page=1&limit=10`,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });


      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].jobId).toBe(jobId);
    });

    it('should get application by id successfully via HTTP', async () => {
      // Arrange - Create test job with questions and application
      const { position } = await createTestJob();
      const { job, shortText, longText, multipleChoice, singleChoice } = await createTestJobWithAllQuestionTypes(app, adminToken, position.id);
      jobId = job.id;

      const applicationResponse = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${job.slug}`,
        payload: {
          answers: [
            { questionId: shortText.id, value: 'João Silva' },
            { questionId: longText.id, value: 'Tenho 3 anos de experiência com React.' },
            { questionId: multipleChoice.id, value: 'JavaScript,TypeScript,React' },
            { questionId: singleChoice.id, value: 'advanced' },
          ],
          recaptchaToken: 'test-recaptcha-token'
        },
      });
      expect(applicationResponse.statusCode).toBe(201);
      const application = JSON.parse(applicationResponse.body).data;

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'GET',
        url: `/api/applications/${application.id}`,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(application.id);
      expect(body.data.jobId).toBe(jobId);
      expect(body.data.answers).toHaveLength(4);
    });

    it('should fail with non-existent application via HTTP', async () => {
      // Act - Test HTTP route with non-existent application
      const response = await app.inject({
        method: 'GET',
        url: '/api/applications/clh1234567890123456789012',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      // Assert
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    it('should delete application successfully via HTTP', async () => {
      // Arrange - Create test job with questions and application
      const { position } = await createTestJob();
      const { job, shortText, longText, multipleChoice, singleChoice } = await createTestJobWithAllQuestionTypes(app, adminToken, position.id);
      jobId = job.id;

      const applicationResponse = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${job.slug}`,
        payload: {
          answers: [
            { questionId: shortText.id, value: 'João Silva' },
            { questionId: longText.id, value: 'Tenho 3 anos de experiência com React.' },
            { questionId: multipleChoice.id, value: 'JavaScript,TypeScript,React' },
            { questionId: singleChoice.id, value: 'advanced' },
          ],
          recaptchaToken: 'test-recaptcha-token'
        },
      });
      expect(applicationResponse.statusCode).toBe(201);
      const application = JSON.parse(applicationResponse.body).data;

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/applications/${application.id}`,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);

      // Verify application was deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/applications/${application.id}`,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('should fail delete with non-existent application via HTTP', async () => {
      // Act - Test HTTP route with non-existent application
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/applications/clh1234567890123456789012',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      // Assert
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });
  });

  describe('Application with Questions HTTP End-to-End Tests', () => {

    it('should submit application with text questions via HTTP', async () => {
      // Arrange - Create test job with questions
      const { position } = await createTestJob();
      const { job, shortText, longText, multipleChoice, singleChoice } = await createTestJobWithAllQuestionTypes(app, adminToken, position.id);
      jobId = job.id;

      const answers = [
        {
          questionId: shortText.id,
          value: 'Ana Silva',
        },
        {
          questionId: longText.id,
          value: 'Tenho 4 anos de experiência com React, Vue.js e TypeScript. Trabalhei em projetos grandes e pequenos, sempre focando na qualidade do código e experiência do usuário.',
        },
        {
          questionId: multipleChoice.id,
          value: 'JavaScript,TypeScript,React',
        },
        {
          questionId: singleChoice.id,
          value: 'advanced',
        },
      ];

      // Act - Test HTTP route end-to-end
      const response = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${job.slug}`,
        payload: { 
          answers,
          recaptchaToken: 'test-recaptcha-token'
        },
      });

      // Assert
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.jobId).toBe(jobId);
      expect(body.data.answers).toHaveLength(4);
      expect(body.data.answers[0].textValue).toBe('Ana Silva');
      expect(body.data.answers[1].textValue).toBe('Tenho 4 anos de experiência com React, Vue.js e TypeScript. Trabalhei em projetos grandes e pequenos, sempre focando na qualidade do código e experiência do usuário.');
    });

    it('should submit application with choice questions via HTTP', async () => {
      // Arrange - Create test job with questions
      const { position } = await createTestJob();
      const { job, shortText, longText, multipleChoice, singleChoice } = await createTestJobWithAllQuestionTypes(app, adminToken, position.id);
      jobId = job.id;

      const answers = [
        {
          questionId: shortText.id,
          value: 'Carlos Santos',
        },
        {
          questionId: longText.id,
          value: 'Tenho 6 anos de experiência com desenvolvimento web.',
        },
        {
          questionId: multipleChoice.id,
          value: 'JavaScript,TypeScript,React',
        },
        {
          questionId: singleChoice.id,
          value: 'beginner',
        },
      ];

      // Act - Test HTTP route end-to-end
      const response = await app.inject({
        method: 'POST',
        url: `/api/applications/submit/${job.slug}`,
        payload: { 
          answers,
          recaptchaToken: 'test-recaptcha-token'
        },
      });

      // Assert
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.jobId).toBe(jobId);
      expect(body.data.answers).toHaveLength(4);
      expect(body.data.answers[0].textValue).toBe('Carlos Santos');
      expect(body.data.answers[1].textValue).toBe('Tenho 6 anos de experiência com desenvolvimento web.');
      expect(body.data.answers[2].textValue).toBe('JavaScript,TypeScript,React');
      expect(body.data.answers[3].textValue).toBe('beginner');
    });
  });

  describe('Application Edge Cases HTTP End-to-End Tests', () => {
    it('should handle empty applications list via HTTP', async () => {
      // Act - Test HTTP route
      const response = await app.inject({
        method: 'GET',
        url: '/api/applications?page=1&limit=10',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(0);
      expect(body.pagination.total).toBe(0);
    });

    it('should handle pagination correctly via HTTP', async () => {
      // Arrange - Create test job with questions
      const { position } = await createTestJob();
      const { job, shortText, longText, multipleChoice, singleChoice } = await createTestJobWithAllQuestionTypes(app, adminToken, position.id);
      jobId = job.id;

      // Create multiple applications
      for (let i = 1; i <= 5; i++) {
        const response = await app.inject({
          method: 'POST',
          url: `/api/applications/submit/${job.slug}`,
          payload: {
            answers: [
              { questionId: shortText.id, value: `Applicant ${i}` },
              { questionId: longText.id, value: `Tenho ${i} anos de experiência com desenvolvimento.` },
              { questionId: multipleChoice.id, value: 'JavaScript,TypeScript,React' },
              { questionId: singleChoice.id, value: 'intermediate' },
            ],
            recaptchaToken: 'test-recaptcha-token'
          },
        });
        expect(response.statusCode).toBe(201);
      }

      // Act - Get first page via HTTP
      const response = await app.inject({
        method: 'GET',
        url: '/api/applications?page=1&limit=2',
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.pagination.total).toBe(5);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(2);
    });
  });
});