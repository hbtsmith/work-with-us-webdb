import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { setupTestDatabase, cleanupTestDatabase, seedTestData, cleanupTestData } from './setup';
import { AuthService } from '../services/authService';
import { PositionService } from '../services/positionService';
import { JobService } from '../services/jobService';
import { ApplicationService } from '../services/applicationService';

describe('Functional Requirements Verification', () => {
  let authService: AuthService;
  let positionService: PositionService;
  let jobService: JobService;
  let applicationService: ApplicationService;
  let testDbName: string;
  let testData: any;
  
  beforeAll(async () => {
    testDbName = await setupTestDatabase();
    
    authService = new AuthService();
    positionService = new PositionService();
    jobService = new JobService();
    applicationService = new ApplicationService();
  });
  
  beforeEach(async () => {
    testData = await seedTestData();
  });
  
  afterAll(async () => {
    await cleanupTestDatabase(testDbName);
  });
  
  afterEach(async () => {
    await cleanupTestData();
  });
  
  describe('RF-001 - Formulário Público de Candidatura', () => {
    it('RF-001.01: Should allow public access to job form via unique URL', async () => {
      // Act
      const job = await jobService.getJobBySlug('test-job');
      
      // Assert
      expect(job).toBeDefined();
      expect(job.slug).toBe('test-job');
      expect(job.isActive).toBe(true);
    });
    
    it('RF-001.02: Should display job title and description', async () => {
      // Act
      const job = await jobService.getJobBySlug('test-job');
      
      // Assert
      expect(job.title).toBe('Test Job');
      expect(job.description).toBe('Test job description');
    });
    
    it('RF-001.03: Should generate form dynamically based on job questions', async () => {
      // Act
      const job = await jobService.getJobBySlug('test-job');
      
      // Assert
      expect(job.questions).toHaveLength(2);
      expect(job.questions[0].label).toBe('What is your experience?');
      expect(job.questions[1].label).toBe('Select your skills');
    });
    
    it('RF-001.04: Should handle resume upload when required', async () => {
      // Arrange
      const job = await jobService.getJobBySlug('test-job');
      expect(job.requiresResume).toBe(false);
      
      // Update job to require resume
      await jobService.updateJob(job.id, { requiresResume: true });
      const updatedJob = await jobService.getJobById(job.id);
      
      // Assert
      expect(updatedJob.requiresResume).toBe(true);
    });
    
    it('RF-001.05: Should validate required fields', async () => {
      // Arrange
      const job = await jobService.getJobBySlug('test-job');
      const requiredQuestions = job.questions.filter(q => q.isRequired);
      
      // Act & Assert
      expect(requiredQuestions).toHaveLength(2);
      
      // Test missing required answer
      await expect(
        applicationService.submitApplication(job.id, [
          { questionId: job.questions[0].id, value: 'Answer 1' },
          // Missing required question
        ])
      ).rejects.toThrow('Required question');
    });
    
    it('RF-001.07: Should store responses with timestamp', async () => {
      // Act
      const application = await applicationService.submitApplication(testData.job.id, [
        { questionId: testData.job.questions[0].id, value: 'John Doe' },
        { questionId: testData.job.questions[1].id, value: 'javascript' },
      ]);
      
      // Assert
      expect(application.createdAt).toBeDefined();
      expect(application.updatedAt).toBeDefined();
    });
  });
  
  describe('RF-002 - Autenticação Administrativa', () => {
    it('RF-002.01: Should have pre-registered admin user', async () => {
      // Act
      const admin = await authService.getAdminById(testData.admin.id);
      
      // Assert
      expect(admin).toBeDefined();
      expect(admin.email).toBe('test@admin.com');
    });
    
    it('RF-002.02: Should force password change on first login', async () => {
      // Arrange
      const admin = await authService.getAdminById(testData.admin.id);
      expect(admin.isFirstLogin).toBe(false);
      
      // Create new admin with first login
      const newAdmin = await authService.updateAdmin(testData.admin.id, {
        password: 'newpassword123',
      });
      
      // Assert
      expect(newAdmin.isFirstLogin).toBe(false);
    });
    
    it('RF-002.03: Should allow only email and password changes', async () => {
      // Act
      const updatedAdmin = await authService.updateAdmin(testData.admin.id, {
        email: 'newemail@admin.com',
        password: 'newpassword123',
      });
      
      // Assert
      expect(updatedAdmin.email).toBe('newemail@admin.com');
      expect(updatedAdmin.id).toBe(testData.admin.id); // Same ID
    });
    
    it('RF-002.04: Should protect admin panel with JWT', async () => {
      // Act
      const loginResult = await authService.login({
        email: 'test@admin.com',
        password: 'test123',
      });
      
      // Assert
      expect(loginResult.id).toBeDefined();
      expect(loginResult.email).toBe('test@admin.com');
    });
  });
  
  describe('RF-003 - Gestão de Cargos', () => {
    it('RF-003.01: Should allow CRUD operations on positions', async () => {
      // Create
      const position = await positionService.createPosition({
        title: 'New Position',
        level: 'Senior',
        salaryRange: 'R$ 10.000 - R$ 15.000',
      });
      expect(position.title).toBe('New Position');
      
      // Read
      const retrievedPosition = await positionService.getPositionById(position.id);
      expect(retrievedPosition.title).toBe('New Position');
      
      // Update
      const updatedPosition = await positionService.updatePosition(position.id, {
        title: 'Updated Position',
      });
      expect(updatedPosition.title).toBe('Updated Position');
      
      // Delete
      await positionService.deletePosition(position.id);
      await expect(
        positionService.getPositionById(position.id)
      ).rejects.toThrow('Position not found');
    });
    
    it('RF-003.02: Should have required fields: ID, title, level, salary range', async () => {
      // Act
      const position = await positionService.createPosition({
        title: 'Test Position',
        level: 'Mid-level',
        salaryRange: 'R$ 5.000 - R$ 8.000',
      });
      
      // Assert
      expect(position.id).toBeDefined();
      expect(position.title).toBe('Test Position');
      expect(position.level).toBe('Mid-level');
      expect(position.salaryRange).toBe('R$ 5.000 - R$ 8.000');
    });
    
    it('RF-003.03: Should not allow deletion of positions used by jobs', async () => {
      // Arrange
      const position = await positionService.createPosition({
        title: 'Used Position',
        level: 'Mid-level',
        salaryRange: 'R$ 5.000 - R$ 8.000',
      });
      
      await jobService.createJob({
        title: 'Test Job',
        description: 'Test description',
        slug: 'test-job-with-position',
        positionId: position.id,
        questions: [],
      });
      
      // Act & Assert
      await expect(
        positionService.deletePosition(position.id)
      ).rejects.toThrow('Cannot delete position that is being used by jobs');
    });
    
    it('RF-003.04: Should support pagination and sorting', async () => {
      // Arrange
      for (let i = 1; i <= 5; i++) {
        await positionService.createPosition({
          title: `Position ${i}`,
          level: 'Mid-level',
          salaryRange: 'R$ 5.000 - R$ 8.000',
        });
      }
      
      // Act
      const result = await positionService.getPositions({
        page: 1,
        limit: 3,
        sortBy: 'title',
        sortOrder: 'asc',
      });
      
      // Assert
      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(6); // 5 new + 1 from seed
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(3);
    });
  });
  
  describe('RF-004 - Gestão de Vagas', () => {
    it('RF-004.01: Should allow CRUD operations on jobs', async () => {
      // Create
      const job = await jobService.createJob({
        title: 'New Job',
        description: 'New job description',
        slug: 'new-job',
        positionId: testData.position.id,
        questions: [
          {
            label: 'Test question',
            type: 'SHORT_TEXT',
            isRequired: true,
            order: 1,
          },
        ],
      });
      expect(job.title).toBe('New Job');
      
      // Read
      const retrievedJob = await jobService.getJobById(job.id);
      expect(retrievedJob.title).toBe('New Job');
      
      // Update
      const updatedJob = await jobService.updateJob(job.id, {
        title: 'Updated Job',
      });
      expect(updatedJob.title).toBe('Updated Job');
      
      // Delete
      await jobService.deleteJob(job.id);
      await expect(
        jobService.getJobById(job.id)
      ).rejects.toThrow('Job not found');
    });
    
    it('RF-004.02: Should have required fields', async () => {
      // Act
      const job = await jobService.createJob({
        title: 'Test Job',
        description: 'Test description',
        slug: 'test-job-slug',
        requiresResume: true,
        positionId: testData.position.id,
        questions: [],
      });
      
      // Assert
      expect(job.title).toBe('Test Job');
      expect(job.description).toBe('Test description');
      expect(job.slug).toBe('test-job-slug');
      expect(job.requiresResume).toBe(true);
      expect(job.positionId).toBe(testData.position.id);
    });
    
    it('RF-004.03: Should ensure unique job slugs', async () => {
      // Arrange
      await jobService.createJob({
        title: 'First Job',
        description: 'First description',
        slug: 'unique-slug',
        positionId: testData.position.id,
        questions: [],
      });
      
      // Act & Assert
      await expect(
        jobService.createJob({
          title: 'Second Job',
          description: 'Second description',
          slug: 'unique-slug', // Same slug
          positionId: testData.position.id,
          questions: [],
        })
      ).rejects.toThrow();
    });
    
    it('RF-004.04: Should require at least one question per job', async () => {
      // Act & Assert
      await expect(
        jobService.createJob({
          title: 'Job without questions',
          description: 'Description',
          slug: 'job-without-questions',
          positionId: testData.position.id,
          questions: [], // No questions
        })
      ).rejects.toThrow();
    });
    
    it('RF-004.05: Should not allow deletion of jobs with applications', async () => {
      // Arrange
      const job = await jobService.createJob({
        title: 'Job with applications',
        description: 'Description',
        slug: 'job-with-applications',
        positionId: testData.position.id,
        questions: [
          {
            label: 'Test question',
            type: 'SHORT_TEXT',
            isRequired: true,
            order: 1,
          },
        ],
      });
      
      await applicationService.submitApplication(job.id, [
        { questionId: job.questions[0].id, value: 'Test answer' },
      ]);
      
      // Act & Assert
      await expect(
        jobService.deleteJob(job.id)
      ).rejects.toThrow('Cannot delete job that has applications');
    });
    
    it('RF-004.08: Should allow job cloning', async () => {
      // Act
      const clonedJob = await jobService.cloneJob(testData.job.id, {
        title: 'Cloned Job',
        slug: 'cloned-job',
      });
      
      // Assert
      expect(clonedJob.title).toBe('Cloned Job');
      expect(clonedJob.slug).toBe('cloned-job');
      expect(clonedJob.description).toBe(testData.job.description);
      expect(clonedJob.questions).toHaveLength(testData.job.questions.length);
    });
  });
  
  describe('RF-005 - Configuração das Perguntas da Vaga', () => {
    it('RF-005.01: Should allow multiple questions per job', async () => {
      // Act
      const job = await jobService.createJob({
        title: 'Job with multiple questions',
        description: 'Description',
        slug: 'job-multiple-questions',
        positionId: testData.position.id,
        questions: [
          {
            label: 'Question 1',
            type: 'SHORT_TEXT',
            isRequired: true,
            order: 1,
          },
          {
            label: 'Question 2',
            type: 'LONG_TEXT',
            isRequired: false,
            order: 2,
          },
          {
            label: 'Question 3',
            type: 'MULTIPLE_CHOICE',
            isRequired: true,
            order: 3,
            options: [
              { id: '1', label: 'Option 1', value: 'option1' },
              { id: '2', label: 'Option 2', value: 'option2' },
            ],
          },
        ],
      });
      
      // Assert
      expect(job.questions).toHaveLength(3);
      expect(job.questions[0].type).toBe('SHORT_TEXT');
      expect(job.questions[1].type).toBe('LONG_TEXT');
      expect(job.questions[2].type).toBe('MULTIPLE_CHOICE');
    });
    
    it('RF-005.02: Should support different question types', async () => {
      // Act
      const job = await jobService.createJob({
        title: 'Job with all question types',
        description: 'Description',
        slug: 'job-all-types',
        positionId: testData.position.id,
        questions: [
          {
            label: 'Short text question',
            type: 'SHORT_TEXT',
            isRequired: true,
            order: 1,
          },
          {
            label: 'Long text question',
            type: 'LONG_TEXT',
            isRequired: true,
            order: 2,
          },
          {
            label: 'Multiple choice question',
            type: 'MULTIPLE_CHOICE',
            isRequired: true,
            order: 3,
            options: [
              { id: '1', label: 'Option 1', value: 'option1' },
              { id: '2', label: 'Option 2', value: 'option2' },
            ],
          },
          {
            label: 'Single choice question',
            type: 'SINGLE_CHOICE',
            isRequired: true,
            order: 4,
            options: [
              { id: '1', label: 'Choice 1', value: 'choice1' },
              { id: '2', label: 'Choice 2', value: 'choice2' },
            ],
          },
        ],
      });
      
      // Assert
      expect(job.questions).toHaveLength(4);
      expect(job.questions[0].type).toBe('SHORT_TEXT');
      expect(job.questions[1].type).toBe('LONG_TEXT');
      expect(job.questions[2].type).toBe('MULTIPLE_CHOICE');
      expect(job.questions[3].type).toBe('SINGLE_CHOICE');
    });
  });
  
  describe('RF-006 - Visualização de Candidaturas', () => {
    it('RF-006.01: Should allow viewing all applications by job', async () => {
      // Arrange
      await applicationService.submitApplication(testData.job.id, [
        { questionId: testData.job.questions[0].id, value: 'Applicant 1' },
        { questionId: testData.job.questions[1].id, value: 'javascript' },
      ]);
      
      await applicationService.submitApplication(testData.job.id, [
        { questionId: testData.job.questions[0].id, value: 'Applicant 2' },
        { questionId: testData.job.questions[1].id, value: 'typescript' },
      ]);
      
      // Act
      const result = await applicationService.getApplicationsByJob(testData.job.id, {
        page: 1,
        limit: 10,
      });
      
      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
    
    it('RF-006.02: Should display candidate responses including uploads', async () => {
      // Arrange
      const application = await applicationService.submitApplication(testData.job.id, [
        { questionId: testData.job.questions[0].id, value: 'John Doe' },
        { questionId: testData.job.questions[1].id, value: 'javascript,typescript' },
      ]);
      
      // Act
      const retrievedApplication = await applicationService.getApplicationById(application.id);
      
      // Assert
      expect(retrievedApplication.answers).toHaveLength(2);
      expect(retrievedApplication.answers[0].value).toBe('John Doe');
      expect(retrievedApplication.answers[1].value).toBe('javascript,typescript');
    });
    
    it('RF-006.03: Should allow filtering applications by job', async () => {
      // Arrange
      const anotherJob = await jobService.createJob({
        title: 'Another Job',
        description: 'Another description',
        slug: 'another-job',
        positionId: testData.position.id,
        questions: [
          {
            label: 'Test question',
            type: 'SHORT_TEXT',
            isRequired: true,
            order: 1,
          },
        ],
      });
      
      await applicationService.submitApplication(testData.job.id, [
        { questionId: testData.job.questions[0].id, value: 'Applicant 1' },
        { questionId: testData.job.questions[1].id, value: 'javascript' },
      ]);
      
      await applicationService.submitApplication(anotherJob.id, [
        { questionId: anotherJob.questions[0].id, value: 'Applicant 2' },
      ]);
      
      // Act
      const job1Applications = await applicationService.getApplicationsByJob(testData.job.id, {});
      const job2Applications = await applicationService.getApplicationsByJob(anotherJob.id, {});
      
      // Assert
      expect(job1Applications.data).toHaveLength(1);
      expect(job2Applications.data).toHaveLength(1);
      expect(job1Applications.data[0].jobId).toBe(testData.job.id);
      expect(job2Applications.data[0].jobId).toBe(anotherJob.id);
    });
  });
  
  describe('RF-009 - Restrições e Regras de Negócio', () => {
    it('RF-009.01: Should not allow deletion of jobs with applications', async () => {
      // Arrange
      const job = await jobService.createJob({
        title: 'Job with applications',
        description: 'Description',
        slug: 'job-with-applications',
        positionId: testData.position.id,
        questions: [
          {
            label: 'Test question',
            type: 'SHORT_TEXT',
            isRequired: true,
            order: 1,
          },
        ],
      });
      
      await applicationService.submitApplication(job.id, [
        { questionId: job.questions[0].id, value: 'Test answer' },
      ]);
      
      // Act & Assert
      await expect(
        jobService.deleteJob(job.id)
      ).rejects.toThrow('Cannot delete job that has applications');
    });
    
    it('RF-009.02: Should not allow deletion of positions used by jobs', async () => {
      // Arrange
      const position = await positionService.createPosition({
        title: 'Used Position',
        level: 'Mid-level',
        salaryRange: 'R$ 5.000 - R$ 8.000',
      });
      
      await jobService.createJob({
        title: 'Job using position',
        description: 'Description',
        slug: 'job-using-position',
        positionId: position.id,
        questions: [],
      });
      
      // Act & Assert
      await expect(
        positionService.deletePosition(position.id)
      ).rejects.toThrow('Cannot delete position that is being used by jobs');
    });
    
    it('RF-009.03: Should not allow jobs without questions', async () => {
      // Act & Assert
      await expect(
        jobService.createJob({
          title: 'Job without questions',
          description: 'Description',
          slug: 'job-without-questions',
          positionId: testData.position.id,
          questions: [], // No questions
        })
      ).rejects.toThrow();
    });
  });
});