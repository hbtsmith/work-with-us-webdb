import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AdminController } from '../../controllers/adminController';
import { ApplicationService } from '../../services/applicationService';
import { JobService } from '../../services/jobService';
import { PositionService } from '../../services/positionService';
import { i18n } from '../../i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

// Mock dos services
vi.mock('../../services/applicationService');

// Mock do ErrorHandler
vi.mock('../../handlers/ErrorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn()
  }
}));
vi.mock('../../services/jobService');
vi.mock('../../services/positionService');

describe('AdminController', () => {
  let adminController: AdminController;
  let mockApplicationService: any;
  let mockJobService: any;
  let mockPositionService: any;
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
    adminController = new AdminController();
    
    // Mock ApplicationService
    mockApplicationService = {
      getApplicationStats: vi.fn(),
    };
    
    // Mock JobService
    mockJobService = {
      getJobs: vi.fn(),
    };
    
    // Mock PositionService
    mockPositionService = {
      getAllPositions: vi.fn(),
    };
    
    // Replace the service instances
    (adminController as any).applicationService = mockApplicationService;
    (adminController as any).jobService = mockJobService;
    (adminController as any).positionService = mockPositionService;
    
    // Mock request and reply
    mockRequest = {};
    mockReply = {
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardData', () => {
    it('should get dashboard data successfully', async () => {
      // Arrange
      const applicationStats = {
        total: 25,
        thisMonth: 5,
        thisWeek: 2,
        pending: 3,
      };
      const recentJobs = [
        {
          id: 'job-1',
          title: 'Desenvolvedor Frontend',
          description: 'Vaga para desenvolvedor frontend',
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: 'job-2',
          title: 'Desenvolvedor Backend',
          description: 'Vaga para desenvolvedor backend',
          isActive: true,
          createdAt: new Date(),
        },
      ];
      const positions = [
        {
          id: 'position-1',
          title: 'Desenvolvedor Frontend',
          level: 'Pleno',
          salaryRange: 'R$ 5.000 - R$ 8.000',
        },
        {
          id: 'position-2',
          title: 'Desenvolvedor Backend',
          level: 'Sênior',
          salaryRange: 'R$ 8.000 - R$ 12.000',
        },
      ];
      
      mockApplicationService.getApplicationStats.mockResolvedValue(applicationStats);
      mockJobService.getJobs.mockResolvedValue({
        data: recentJobs,
        pagination: { page: 1, limit: 5, total: 2, totalPages: 1 },
      });
      mockPositionService.getAllPositions.mockResolvedValue(positions);
      
      // Act
      await adminController.getDashboardData(mockRequest, mockReply);
      
      // Assert
      expect(mockApplicationService.getApplicationStats).toHaveBeenCalled();
      expect(mockJobService.getJobs).toHaveBeenCalledWith({ page: 1, limit: 5 });
      expect(mockPositionService.getAllPositions).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: {
          totalJobs: 2,
          totalApplications: 0,
          totalPositions: 2,
          recentApplications: [],
          jobStats: {
            active: 2,
            inactive: 0,
          },
        },
        message: i18n.t('success.dashboard.data_loaded'),
      });
    });

    it('should handle dashboard data fetch failure', async () => {
      // Arrange
      const errorMessage = i18n.t('errors.admin.dashboard_failed');
      
      mockApplicationService.getApplicationStats.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await adminController.getDashboardData(mockRequest, mockReply);
      
      // Assert
      expect(mockApplicationService.getApplicationStats).toHaveBeenCalled();
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });

    it('should handle partial data failure gracefully', async () => {
      // Arrange
      const applicationStats = {
        total: 25,
        thisMonth: 5,
        thisWeek: 2,
        pending: 3,
      };
      const errorMessage = i18n.t('errors.admin.jobs_fetch_failed');
      
      mockApplicationService.getApplicationStats.mockResolvedValue(applicationStats);
      mockJobService.getJobs.mockRejectedValue(new Error(errorMessage));
      mockPositionService.getAllPositions.mockResolvedValue([]);
      
      // Act
      await adminController.getDashboardData(mockRequest, mockReply);
      
      // Assert
      expect(mockApplicationService.getApplicationStats).toHaveBeenCalled();
      expect(mockJobService.getJobs).toHaveBeenCalledWith({ page: 1, limit: 5 });
      expect(mockPositionService.getAllPositions).toHaveBeenCalled();
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('getApplicationStats', () => {
    it('should get application stats successfully', async () => {
      // Arrange
      const stats = {
        total: 25,
        thisMonth: 5,
        thisWeek: 2,
        pending: 3,
        byJob: [
          {
            jobId: 'job-1',
            jobTitle: 'Desenvolvedor Frontend',
            count: 10,
          },
          {
            jobId: 'job-2',
            jobTitle: 'Desenvolvedor Backend',
            count: 15,
          },
        ],
      };
      
      mockApplicationService.getApplicationStats.mockResolvedValue(stats);
      
      // Act
      await adminController.getApplicationStats(mockRequest, mockReply);
      
      // Assert
      expect(mockApplicationService.getApplicationStats).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: stats,
        message: i18n.t('success.dashboard.stats_loaded'),
      });
    });

    it('should handle application stats failure', async () => {
      // Arrange
      const errorMessage = i18n.t('errors.admin.stats_failed');
      
      mockApplicationService.getApplicationStats.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await adminController.getApplicationStats(mockRequest, mockReply);
      
      // Assert
      expect(mockApplicationService.getApplicationStats).toHaveBeenCalled();
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });

    it('should handle empty stats gracefully', async () => {
      // Arrange
      const stats = {
        total: 0,
        thisMonth: 0,
        thisWeek: 0,
        pending: 0,
        byJob: [],
      };
      
      mockApplicationService.getApplicationStats.mockResolvedValue(stats);
      
      // Act
      await adminController.getApplicationStats(mockRequest, mockReply);
      
      // Assert
      expect(mockApplicationService.getApplicationStats).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: stats,
        message: i18n.t('success.dashboard.stats_loaded'),
      });
    });
  });
});
