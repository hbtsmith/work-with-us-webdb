import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ApplicationService } from '../../services/applicationService';
import { prisma } from '../../database/client';
import { cleanupTestData, generateUniqueId } from '../setup';
import { i18n } from '../../i18n/i18n';

describe('ApplicationService', () => {
  let applicationService: ApplicationService;
  let position: any;
  let job: any;
  let questions: any[];
  
  beforeEach(async () => {
    // Configure i18n for tests
    i18n.setLocale('pt_BR');
    applicationService = new ApplicationService();
    
    // Create test position
    const uniqueId = generateUniqueId();
    position = await prisma.position.create({
      data: {
        title: `Test Developer ${uniqueId}`,
        level: 'Mid-level',
        salaryRange: 'R$ 5.000 - R$ 8.000',
      },
    });
    
    // Create test job with questions
    job = await prisma.job.create({
      data: {
        title: 'Test Job',
        description: 'Test description',
        slug: `test-job-${uniqueId}`,
        positionId: position.id,
        isActive: true,
        questions: {
          create: [
            {
              label: 'What is your name?',
              type: 'SHORT_TEXT',
              isRequired: true,
              order: 1,
            },
            {
              label: 'Describe your experience',
              type: 'LONG_TEXT',
              isRequired: true,
              order: 2,
            },
            {
              label: 'Select your skills',
              type: 'MULTIPLE_CHOICE',
              isRequired: true,
              order: 3,
            },
            {
              label: 'What is your level?',
              type: 'SINGLE_CHOICE',
              isRequired: false,
              order: 4,
            },
          ],
        },
      },
      include: { 
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      },
    });
    
    // Create question options for multiple choice and single choice questions
    const multipleChoiceQuestion = job.questions.find(q => q.type === 'MULTIPLE_CHOICE');
    const singleChoiceQuestion = job.questions.find(q => q.type === 'SINGLE_CHOICE');
    
    await prisma.questionOption.createMany({
      data: [
        {
          questionId: multipleChoiceQuestion.id,
          label: 'JavaScript',
          orderIndex: 0,
        },
        {
          questionId: multipleChoiceQuestion.id,
          label: 'TypeScript',
          orderIndex: 1,
        },
        {
          questionId: singleChoiceQuestion.id,
          label: 'Junior',
          orderIndex: 0,
        },
        {
          questionId: singleChoiceQuestion.id,
          label: 'Mid',
          orderIndex: 1,
        },
        {
          questionId: singleChoiceQuestion.id,
          label: 'Senior',
          orderIndex: 2,
        },
      ],
    });
    
    // Refresh questions with options
    questions = await prisma.question.findMany({
      where: { jobId: job.id },
      include: {
        options: {
          orderBy: { orderIndex: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
  });
  
  afterEach(async () => {
    await cleanupTestData();
  });
  
  describe('submitApplication', () => {
    it('should submit application with all required answers', async () => {
      // Arrange
      const multipleChoiceQuestion = questions.find(q => q.type === 'MULTIPLE_CHOICE');
      const singleChoiceQuestion = questions.find(q => q.type === 'SINGLE_CHOICE');
      
      const answers = [
        { questionId: questions[0].id, textValue: i18n.t('test.data.answer_name') },
        { questionId: questions[1].id, textValue: i18n.t('test.data.answer_experience') },
        { questionId: multipleChoiceQuestion.id, questionOptionId: multipleChoiceQuestion.options[0].id },
        { questionId: singleChoiceQuestion.id, questionOptionId: singleChoiceQuestion.options[2].id },
      ];
      
      // Act
      const result = await applicationService.submitApplication(job.id, answers);
      
      // Assert
      expect(result.jobId).toBe(job.id);
      expect(result.answers).toHaveLength(4);
      expect(result.answers[0].textValue).toBe(i18n.t('test.data.answer_name'));
      expect(result.answers[1].textValue).toBe(i18n.t('test.data.answer_experience'));
      expect(result.answers[2].questionOptionId).toBe(multipleChoiceQuestion.options[0].id);
      expect(result.answers[3].questionOptionId).toBe(singleChoiceQuestion.options[2].id);
    });
    
    it('should submit application without optional answers', async () => {
      // Arrange
      const multipleChoiceQuestion = questions.find(q => q.type === 'MULTIPLE_CHOICE');
      
      const answers = [
        { questionId: questions[0].id, textValue: i18n.t('test.data.answer_name') },
        { questionId: questions[1].id, textValue: i18n.t('test.data.answer_experience') },
        { questionId: multipleChoiceQuestion.id, questionOptionId: multipleChoiceQuestion.options[0].id },
        // Optional question not answered
      ];
      
      // Act
      const result = await applicationService.submitApplication(job.id, answers);
      
      // Assert
      expect(result.jobId).toBe(job.id);
      expect(result.answers).toHaveLength(3);
    });
    
    it('should throw error when required question is not answered', async () => {
      // Arrange
      const multipleChoiceQuestion = questions.find(q => q.type === 'MULTIPLE_CHOICE');
      
      const answers = [
        { questionId: questions[0].id, textValue: i18n.t('test.data.answer_name') },
        // Missing required question
        { questionId: multipleChoiceQuestion.id, questionOptionId: multipleChoiceQuestion.options[0].id },
      ];
      
      // Act & Assert
      await expect(
        applicationService.submitApplication(job.id, answers)
      ).rejects.toThrow(i18n.t('errors.application.required_question', { question: i18n.t('test.data.question_label_experience') }));
    });
    
    it('should throw error for inactive job', async () => {
      // Arrange
      await prisma.job.update({
        where: { id: job.id },
        data: { isActive: false },
      });
      
      const multipleChoiceQuestion = questions.find(q => q.type === 'MULTIPLE_CHOICE');
      
      const answers = [
        { questionId: questions[0].id, textValue: i18n.t('test.data.answer_name') },
        { questionId: questions[1].id, textValue: i18n.t('test.data.answer_experience') },
        { questionId: multipleChoiceQuestion.id, questionOptionId: multipleChoiceQuestion.options[0].id },
      ];
      
      // Act & Assert
      await expect(
        applicationService.submitApplication(job.id, answers)
      ).rejects.toThrow(i18n.t('errors.job.not_found_or_inactive'));
    });
    
    it('should handle resume upload when required', async () => {
      // Arrange
      await prisma.job.update({
        where: { id: job.id },
        data: { requiresResume: true },
      });
      
      const multipleChoiceQuestion = questions.find(q => q.type === 'MULTIPLE_CHOICE');
      
      const answers = [
        { questionId: questions[0].id, textValue: i18n.t('test.data.answer_name') },
        { questionId: questions[1].id, textValue: i18n.t('test.data.answer_experience') },
        { questionId: multipleChoiceQuestion.id, questionOptionId: multipleChoiceQuestion.options[0].id },
      ];
      
      const resumeFile = {
        buffer: Buffer.from('fake pdf content'),
        filename: 'resume.pdf',
        size: 1024,
      };
      
      // Act
      const result = await applicationService.submitApplication(job.id, answers, resumeFile);
      
      // Assert
      expect(result.resumeUrl).toBeDefined();
      expect(result.resumeUrl).toContain('.pdf');
    });
    
    it('should throw error when resume is required but not provided', async () => {
      // Arrange
      await prisma.job.update({
        where: { id: job.id },
        data: { requiresResume: true },
      });
      
      const multipleChoiceQuestion = questions.find(q => q.type === 'MULTIPLE_CHOICE');
      
      const answers = [
        { questionId: questions[0].id, textValue: i18n.t('test.data.answer_name') },
        { questionId: questions[1].id, textValue: i18n.t('test.data.answer_experience') },
        { questionId: multipleChoiceQuestion.id, questionOptionId: multipleChoiceQuestion.options[0].id },
      ];
      
      // Act & Assert
      await expect(
        applicationService.submitApplication(job.id, answers)
      ).rejects.toThrow(i18n.t('errors.application.resume_required'));
    });
    
    it('should throw error for invalid file type', async () => {
      // Arrange
      await prisma.job.update({
        where: { id: job.id },
        data: { requiresResume: true },
      });
      
      const multipleChoiceQuestion = questions.find(q => q.type === 'MULTIPLE_CHOICE');
      
      const answers = [
        { questionId: questions[0].id, textValue: i18n.t('test.data.answer_name') },
        { questionId: questions[1].id, textValue: i18n.t('test.data.answer_experience') },
        { questionId: multipleChoiceQuestion.id, questionOptionId: multipleChoiceQuestion.options[0].id },
      ];
      
      const resumeFile = {
        buffer: Buffer.from('fake content'),
        filename: 'resume.txt',
        size: 1024,
      };
      
      // Act & Assert
      await expect(
        applicationService.submitApplication(job.id, answers, resumeFile)
      ).rejects.toThrow(i18n.t('errors.general.invalid_file_type'));
    });
    
    it('should throw error for file too large', async () => {
      // Arrange
      await prisma.job.update({
        where: { id: job.id },
        data: { requiresResume: true },
      });
      
      const multipleChoiceQuestion = questions.find(q => q.type === 'MULTIPLE_CHOICE');
      
      const answers = [
        { questionId: questions[0].id, textValue: i18n.t('test.data.answer_name') },
        { questionId: questions[1].id, textValue: i18n.t('test.data.answer_experience') },
        { questionId: multipleChoiceQuestion.id, questionOptionId: multipleChoiceQuestion.options[0].id },
      ];
      
      const resumeFile = {
        buffer: Buffer.alloc(6 * 1024 * 1024), // 6MB
        filename: 'resume.pdf',
        size: 6 * 1024 * 1024,
      };
      
      // Act & Assert
      await expect(
        applicationService.submitApplication(job.id, answers, resumeFile)
      ).rejects.toThrow(i18n.t('errors.general.file_too_large'));
    });
  });
  
  describe('getApplications', () => {
    it('should return paginated applications', async () => {
      // Arrange
      const applications: any[] = [];
      for (let i = 1; i <= 3; i++) {
        const application = await prisma.application.create({
          data: {
            jobId: job.id,
            answers: {
              create: [
                {
                  questionId: questions[0].id,
                  textValue: `Applicant ${i}`,
                },
              ],
            },
          },
        });
        applications.push(application);
      }
      
      // Act
      const result = await applicationService.getApplications({
        page: 1,
        limit: 2,
      });
      
      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
    });
    
    it('should filter applications by job', async () => {
      // Arrange
      const anotherJob = await prisma.job.create({
        data: {
          title: 'Another Job',
          description: 'Another description',
          slug: 'another-job',
          positionId: position.id,
        },
      });
      
      await prisma.application.create({
        data: { jobId: job.id },
      });
      
      await prisma.application.create({
        data: { jobId: anotherJob.id },
      });
      
      // Act
      const result = await applicationService.getApplications({}, job.id);
      
      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].jobId).toBe(job.id);
    });
  });
  
  describe('getApplicationById', () => {
    it('should return application by id', async () => {
      // Arrange
      const application = await prisma.application.create({
        data: {
          jobId: job.id,
          answers: {
            create: [
              {
                questionId: questions[0].id,
                textValue: i18n.t('test.data.answer_name'),
              },
            ],
          },
        },
        include: {
          answers: {
            include: { question: true },
          },
        },
      });
      
      // Act
      const result = await applicationService.getApplicationById(application.id);
      
      // Assert
      expect(result.id).toBe(application.id);
      expect(result.jobId).toBe(job.id);
      expect(result.answers).toHaveLength(1);
      expect(result.answers[0].textValue).toBe(i18n.t('test.data.answer_name'));
    });
    
    it('should throw error for non-existent application', async () => {
      // Act & Assert
      await expect(
        applicationService.getApplicationById('non-existent-id')
      ).rejects.toThrow(i18n.t('errors.application.not_found'));
    });
  });
  
  describe('deleteApplication', () => {
    it('should delete application', async () => {
      // Arrange
      const application = await prisma.application.create({
        data: {
          jobId: job.id,
          answers: {
            create: [
              {
                questionId: questions[0].id,
                textValue: i18n.t('test.data.answer_name'),
              },
            ],
          },
        },
      });
      
      // Act
      const result = await applicationService.deleteApplication(application.id);
      
      // Assert
      expect(result.id).toBe(application.id);
      
      // Verify application is deleted
      const deletedApplication = await prisma.application.findUnique({
        where: { id: application.id },
      });
      expect(deletedApplication).toBeNull();
    });
  });
  
  describe('getApplicationStats', () => {
    it('should return application statistics', async () => {
      // Arrange
      const anotherJob = await prisma.job.create({
        data: {
          title: 'Another Job',
          description: 'Another description',
          slug: 'another-job',
          positionId: position.id,
        },
      });
      
      // Create applications
      await prisma.application.create({ data: { jobId: job.id } });
      await prisma.application.create({ data: { jobId: job.id } });
      await prisma.application.create({ data: { jobId: anotherJob.id } });
      
      // Act
      const result = await applicationService.getApplicationStats();
      
      // Assert
      expect(result.totalApplications).toBe(3);
      expect(result.applicationsByJob).toHaveLength(2);
      expect(result.recentApplications).toHaveLength(3);
      expect(result.applicationsByJob[0]._count.applications).toBe(2);
    });
  });
});