import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JobController } from '../../controllers/jobController';
import { JobService } from '../../services/jobService';
import { i18n } from '../../i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

// Mock do JobService
vi.mock('../../services/jobService');

// Mock do ErrorHandler
vi.mock('../../handlers/ErrorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn()
  }
}));

describe('JobController', () => {
  let jobController: JobController;
  let mockJobService: any;
    let mockErrorHandler: any;
  let mockRequest: any;
  let mockReply: any;

  beforeEach(async () => {
    // Configure i18n for tests
    i18n.setLocale('pt_BR');
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Import and setup ErrorHandler mock
    const { ErrorHandler } = await import('../../handlers/ErrorHandler');
    mockErrorHandler = ErrorHandler;
    
    // Create controller
    jobController = new JobController();
    
    // Mock JobService
    mockJobService = {
      createJob: vi.fn(),
      getJobs: vi.fn(),
      getJobById: vi.fn(),
      getJobBySlug: vi.fn(),
      updateJob: vi.fn(),
      deleteJob: vi.fn(),
      toggleJobStatus: vi.fn(),
      createJobQuestion: vi.fn(),
      updateJobQuestion: vi.fn(),
      deleteJobQuestion: vi.fn(),
    };
    
    // Replace the service instance
    (jobController as any).jobService = mockJobService;
    
    // Mock request and reply
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    
    mockReply = {
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createJob', () => {
    it('should create job successfully', async () => {
      // Arrange
      const jobData = {
        title: 'Desenvolvedor Frontend',
        description: 'Vaga para desenvolvedor frontend',
        slug: 'desenvolvedor-frontend',
        positionId: 'position-123',
        isActive: true,
      };
      const createdJob = {
        id: 'job-123',
        ...jobData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockRequest.body = jobData;
      mockJobService.createJob.mockResolvedValue(createdJob);
      
      // Act
      await jobController.createJob(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.createJob).toHaveBeenCalledWith(jobData);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: createdJob,
        message: i18n.t('success.job.created'),
      });
    });

    it('should handle creation failure', async () => {
      // Arrange
      const jobData = {
        title: '',
        description: 'Vaga para desenvolvedor frontend',
        slug: 'desenvolvedor-frontend',
        positionId: 'position-123',
      };
      const errorMessage = i18n.t('errors.job.create_failed');
      
      mockRequest.body = jobData;
      mockJobService.createJob.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await jobController.createJob(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.createJob).toHaveBeenCalledWith(jobData);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('getJobs', () => {
    it('should get jobs successfully', async () => {
      // Arrange
      const query = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      const result = {
        data: [
          {
            id: 'job-1',
            title: 'Desenvolvedor Frontend',
            description: 'Vaga para desenvolvedor frontend',
            slug: 'desenvolvedor-frontend',
            isActive: true,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };
      
      mockRequest.query = query;
      mockJobService.getJobs.mockResolvedValue(result);
      
      // Act
      await jobController.getJobs(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.getJobs).toHaveBeenCalledWith(query);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        ...result,
      });
    });

    it('should handle fetch failure', async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      const errorMessage = i18n.t('errors.job.fetch_failed');
      
      mockRequest.query = query;
      mockJobService.getJobs.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await jobController.getJobs(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.getJobs).toHaveBeenCalledWith(query);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('getJobById', () => {
    it('should get job by id successfully', async () => {
      // Arrange
      const jobId = 'job-123';
      const job = {
        id: jobId,
        title: 'Desenvolvedor Frontend',
        description: 'Vaga para desenvolvedor frontend',
        slug: 'desenvolvedor-frontend',
        isActive: true,
      };
      
      mockRequest.params = { id: jobId };
      mockJobService.getJobById.mockResolvedValue(job);
      
      // Act
      await jobController.getJobById(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.getJobById).toHaveBeenCalledWith(jobId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: job,
      });
    });

    it('should handle job not found', async () => {
      // Arrange
      const jobId = 'job-123';
      const errorMessage = i18n.t('errors.job.not_found');
      
      mockRequest.params = { id: jobId };
      mockJobService.getJobById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await jobController.getJobById(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.getJobById).toHaveBeenCalledWith(jobId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('getJobBySlug', () => {
    it('should get job by slug successfully', async () => {
      // Arrange
      const slug = 'desenvolvedor-frontend';
      const job = {
        id: 'job-123',
        title: 'Desenvolvedor Frontend',
        description: 'Vaga para desenvolvedor frontend',
        slug: slug,
        isActive: true,
      };
      
      mockRequest.params = { slug };
      mockJobService.getJobBySlug.mockResolvedValue(job);
      
      // Act
      await jobController.getJobBySlug(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.getJobBySlug).toHaveBeenCalledWith(slug);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: job,
      });
    });

    it('should handle job not found by slug', async () => {
      // Arrange
      const slug = 'vaga-inexistente';
      const errorMessage = i18n.t('errors.job.not_found');
      
      mockRequest.params = { slug };
      mockJobService.getJobBySlug.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await jobController.getJobBySlug(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.getJobBySlug).toHaveBeenCalledWith(slug);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('updateJob', () => {
    it('should update job successfully', async () => {
      // Arrange
      const jobId = 'job-123';
      const updateData = {
        title: 'Desenvolvedor Full Stack',
        description: 'Vaga para desenvolvedor full stack',
      };
      const updatedJob = {
        id: jobId,
        title: 'Desenvolvedor Full Stack',
        description: 'Vaga para desenvolvedor full stack',
        slug: 'desenvolvedor-full-stack',
        isActive: true,
      };
      
      mockRequest.params = { id: jobId };
      mockRequest.body = updateData;
      mockJobService.updateJob.mockResolvedValue(updatedJob);
      
      // Act
      await jobController.updateJob(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.updateJob).toHaveBeenCalledWith(jobId, updateData);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: updatedJob,
        message: i18n.t('success.job.updated'),
      });
    });

    it('should handle update failure', async () => {
      // Arrange
      const jobId = 'job-123';
      const updateData = { title: '' };
      const errorMessage = i18n.t('errors.job.create_failed');
      
      mockRequest.params = { id: jobId };
      mockRequest.body = updateData;
      mockJobService.updateJob.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await jobController.updateJob(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.updateJob).toHaveBeenCalledWith(jobId, updateData);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('deleteJob', () => {
    it('should delete job successfully', async () => {
      // Arrange
      const jobId = 'job-123';
      
      mockRequest.params = { id: jobId };
      mockJobService.deleteJob.mockResolvedValue(undefined);
      
      // Act
      await jobController.deleteJob(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.deleteJob).toHaveBeenCalledWith(jobId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: i18n.t('success.job.deleted'),
      });
    });

    it('should handle delete failure', async () => {
      // Arrange
      const jobId = 'job-123';
      const errorMessage = i18n.t('errors.job.not_found');
      
      mockRequest.params = { id: jobId };
      mockJobService.deleteJob.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await jobController.deleteJob(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.deleteJob).toHaveBeenCalledWith(jobId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('toggleJobStatus', () => {
    it('should toggle job status successfully', async () => {
      // Arrange
      const jobId = 'job-123';
      const toggledJob = {
        id: jobId,
        title: 'Desenvolvedor Frontend',
        isActive: false,
      };
      
      mockRequest.params = { id: jobId };
      mockJobService.toggleJobStatus.mockResolvedValue(toggledJob);
      
      // Act
      await jobController.toggleJobStatus(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.toggleJobStatus).toHaveBeenCalledWith(jobId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: toggledJob,
        message: i18n.t('success.job.deactivated'),
      });
    });

    it('should handle toggle failure', async () => {
      // Arrange
      const jobId = 'job-123';
      const errorMessage = i18n.t('errors.job.not_found');
      
      mockRequest.params = { id: jobId };
      mockJobService.toggleJobStatus.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await jobController.toggleJobStatus(mockRequest, mockReply);
      
      // Assert
      expect(mockJobService.toggleJobStatus).toHaveBeenCalledWith(jobId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });
});
