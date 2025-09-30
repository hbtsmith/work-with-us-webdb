import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JobService } from '../../services/jobService';
import { prisma } from '../../database/client';
import { cleanupTestData, generateUniqueId } from '../setup';
import { i18n } from '../../i18n/i18n';

describe('JobService', () => {
  let jobService: JobService;
  let position: any;
  
  beforeEach(async () => {
    // Configure i18n for tests
    i18n.setLocale('pt_BR');
    jobService = new JobService();
    
    // Create test position
    position = await prisma.position.create({
      data: {
        title: i18n.t('test.data.position_title'),
        level: i18n.t('test.data.position_level'),
        salaryRange: i18n.t('test.data.position_salary'),
      },
    });
  });
  
  afterEach(async () => {
    await cleanupTestData();
  });
  
  describe('createJob', () => {
    it('should create a job without questions', async () => {
      // Arrange
      const uniqueId = generateUniqueId();
      const jobData = {
        title: i18n.t('test.data.frontend_title'),
        description: i18n.t('test.data.frontend_description'),
        slug: `frontend-developer-${uniqueId}`,
        requiresResume: true,
        positionId: position.id,
      };
      
      // Act
      const result = await jobService.createJob(jobData);
      
      // Assert
      expect(result.title).toBe(i18n.t('test.data.frontend_title'));
      expect(result.slug).toBe(`frontend-developer-${uniqueId}`);
      expect(result.requiresResume).toBe(true);
      expect(result.questions).toHaveLength(0);
    });
  });
  
  describe('getJobBySlug', () => {
    it('should return active job by slug', async () => {
      // Arrange
      const uniqueId = generateUniqueId();
      const job = await prisma.job.create({
        data: {
          title: i18n.t('test.data.job_title'),
          description: i18n.t('test.data.job_description'),
          slug: `test-job-${uniqueId}`,
          positionId: position.id,
          isActive: true,
        },
      });
      
      // Act
      const result = await jobService.getJobBySlug(`test-job-${uniqueId}`);
      
      // Assert
      expect(result.id).toBe(job.id);
      expect(result.title).toBe(i18n.t('test.data.job_title'));
    });
    
    it('should throw error for inactive job', async () => {
      // Arrange
      await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
          isActive: false,
        },
      });
      
      // Act & Assert
      await expect(
        jobService.getJobBySlug('test-job')
      ).rejects.toThrow(i18n.t('errors.job.not_found_or_inactive'));
    });
    
    it('should throw error for non-existent job', async () => {
      // Act & Assert
      await expect(
        jobService.getJobBySlug('non-existent-slug')
      ).rejects.toThrow(i18n.t('errors.job.not_found_or_inactive'));
    });
  });
  
  describe('updateJob', () => {
    it('should update job when no applications exist', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Original Title',
          description: 'Original description',
          slug: 'original-slug',
          positionId: position.id,
        },
      });
      
      // Act
      const result = await jobService.updateJob(job.id, {
        title: 'Updated Title',
        description: 'Updated description',
      });
      
      // Assert
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated description');
      expect(result.slug).toBe('original-slug'); // Unchanged
    });
    
    it('should throw error when job has applications', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
        },
      });
      
      await prisma.application.create({
        data: {
          jobId: job.id,
        },
      });
      
      // Act & Assert
      await expect(
        jobService.updateJob(job.id, {
          title: 'Updated Title',
        })
      ).rejects.toThrow(i18n.t('errors.job.has_applications'));
    });
  });
  
  describe('deleteJob', () => {
    it('should delete job when no applications exist', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
        },
      });
      
      // Act
      const result = await jobService.deleteJob(job.id);
      
      // Assert
      expect(result.id).toBe(job.id);
      
      // Verify job is deleted
      const deletedJob = await prisma.job.findUnique({
        where: { id: job.id },
      });
      expect(deletedJob).toBeNull();
    });
    
    it('should throw error when job has applications', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
        },
      });
      
      await prisma.application.create({
        data: {
          jobId: job.id,
        },
      });
      
      // Act & Assert
      await expect(
        jobService.deleteJob(job.id)
      ).rejects.toThrow(i18n.t('errors.job.has_applications'));
    });
  });
  
  describe('cloneJob', () => {
    it('should clone job with all questions', async () => {
      // Arrange
      const originalJob = await prisma.job.create({
        data: {
          title: i18n.t('test.data.original_title'),
          description: i18n.t('test.data.original_description'),
          slug: 'original-job',
          positionId: position.id,
          questions: {
            create: [
              {
                label: i18n.t('test.data.question_label'),
                type: 'SHORT_TEXT',
                isRequired: true,
                order: 1,
              },
            ],
          },
        },
        include: { questions: true },
      });
      
      // Act
      const result = await jobService.cloneJob(originalJob.id, {
        title: 'Cloned Job',
        slug: 'cloned-job',
      });
      
      // Assert
      expect(result.title).toBe('Cloned Job');
      expect(result.slug).toBe('cloned-job');
      expect(result.description).toBe(i18n.t('test.data.original_description'));
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].label).toBe(i18n.t('test.data.question_label'));
    });
  });
  
  describe('toggleJobStatus', () => {
    it('should toggle job status from active to inactive', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
          isActive: true,
        },
      });
      
      // Act
      const result = await jobService.toggleJobStatus(job.id);
      
      // Assert
      expect(result.isActive).toBe(false);
    });
    
    it('should toggle job status from inactive to active', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
          isActive: false,
        },
      });
      
      // Act
      const result = await jobService.toggleJobStatus(job.id);
      
      // Assert
      expect(result.isActive).toBe(true);
    });
  });

  // Question management tests
  describe('createJobQuestion', () => {
    it('should create a question for an existing job', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
        },
      });

      const questionData = {
        label: i18n.t('test.data.question_label_react'),
        type: 'SHORT_TEXT' as const,
        isRequired: true,
        order: 1,
      };

      // Act
      const result = await jobService.createJobQuestion(job.id, questionData);

      // Assert
      expect(result.label).toBe(i18n.t('test.data.question_label_react'));
      expect(result.type).toBe('SHORT_TEXT');
      expect(result.isRequired).toBe(true);
      expect(result.order).toBe(1);
      expect(result.jobId).toBe(job.id);
    });

    it('should throw error when job does not exist', async () => {
      // Arrange
      const questionData = {
        label: i18n.t('test.data.question_label_react'),
        type: 'SHORT_TEXT' as const,
        isRequired: true,
        order: 1,
      };

      // Act & Assert
      await expect(
        jobService.createJobQuestion('non-existent-id', questionData)
      ).rejects.toThrow(i18n.t('errors.job.not_found'));
    });
  });

  describe('updateJobQuestion', () => {
    it('should update a question without answers', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
        },
      });

      const question = await prisma.question.create({
        data: {
          label: 'Original Question',
          type: 'SHORT_TEXT',
          isRequired: true,
          order: 1,
          jobId: job.id,
        },
      });

      const updateData = {
        label: i18n.t('test.data.question_label_react'),
        type: 'LONG_TEXT' as const,
        isRequired: false,
        order: 2,
      };

      // Act
      const result = await jobService.updateJobQuestion(job.id, question.id, updateData);

      // Assert
      expect(result.label).toBe(i18n.t('test.data.question_label_react'));
      expect(result.type).toBe('LONG_TEXT');
      expect(result.isRequired).toBe(false);
      expect(result.order).toBe(2);
    });

    it('should throw error when question has answers', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
        },
      });

      const question = await prisma.question.create({
        data: {
          label: 'Original Question',
          type: 'SHORT_TEXT',
          isRequired: true,
          order: 1,
          jobId: job.id,
        },
      });

      const application = await prisma.application.create({
        data: {
          jobId: job.id,
        },
      });

      await prisma.answer.create({
        data: {
          textValue: 'Test answer',
          applicationId: application.id,
          questionId: question.id,
        },
      });

      const updateData = {
        label: 'Updated Question',
      };

      // Act & Assert
      await expect(
        jobService.updateJobQuestion(job.id, question.id, updateData)
      ).rejects.toThrow(i18n.t('errors.question.has_answers'));
    });
  });

  describe('deleteJobQuestion', () => {
    it('should delete a question without answers', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
        },
      });

      const question = await prisma.question.create({
        data: {
          label: 'Test Question',
          type: 'SHORT_TEXT',
          isRequired: true,
          order: 1,
          jobId: job.id,
        },
      });

      // Act
      const result = await jobService.deleteJobQuestion(job.id, question.id);

      // Assert
      expect(result.id).toBe(question.id);

      // Verify question is deleted
      const deletedQuestion = await prisma.question.findUnique({
        where: { id: question.id },
      });
      expect(deletedQuestion).toBeNull();
    });

    it('should throw error when question has answers', async () => {
      // Arrange
      const job = await prisma.job.create({
        data: {
          title: 'Test Job',
          description: 'Test description',
          slug: 'test-job',
          positionId: position.id,
        },
      });

      const question = await prisma.question.create({
        data: {
          label: 'Test Question',
          type: 'SHORT_TEXT',
          isRequired: true,
          order: 1,
          jobId: job.id,
        },
      });

      const application = await prisma.application.create({
        data: {
          jobId: job.id,
        },
      });

      await prisma.answer.create({
        data: {
          textValue: 'Test answer',
          applicationId: application.id,
          questionId: question.id,
        },
      });

      // Act & Assert
      await expect(
        jobService.deleteJobQuestion(job.id, question.id)
      ).rejects.toThrow(i18n.t('errors.question.has_answers'));
    });
  });
});