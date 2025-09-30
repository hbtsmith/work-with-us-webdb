import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PositionController } from '../../controllers/positionController';
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

// Mock do PositionService
vi.mock('../../services/positionService');

// Mock do ErrorHandler
vi.mock('../../handlers/ErrorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn()
  }
}));

describe('PositionController', () => {
  let positionController: PositionController;
  let mockPositionService: any;
  let mockRequest: any;
  let mockReply: any;
  let mockErrorHandler: any;

  beforeEach(async () => {
    // Configure i18n for tests
    i18n.setLocale('pt_BR');
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Import and setup ErrorHandler mock
    const { ErrorHandler } = await import('../../handlers/ErrorHandler');
    mockErrorHandler = ErrorHandler;
    
    // Create controller
    positionController = new PositionController();
    
    // Mock PositionService
    mockPositionService = {
      createPosition: vi.fn(),
      getPositions: vi.fn(),
      getPositionById: vi.fn(),
      updatePosition: vi.fn(),
      deletePosition: vi.fn(),
      getAllPositions: vi.fn(),
    };
    
    // Replace the service instance
    (positionController as any).positionService = mockPositionService;
    
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

  describe('createPosition', () => {
    it('should create position successfully', async () => {
      // Arrange
      const positionData = {
        title: 'Desenvolvedor Frontend',
        level: 'Pleno',
        salaryRange: 'R$ 5.000 - R$ 8.000',
      };
      const createdPosition = {
        id: 'position-123',
        ...positionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockRequest.body = positionData;
      mockPositionService.createPosition.mockResolvedValue(createdPosition);
      
      // Act
      await positionController.createPosition(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.createPosition).toHaveBeenCalledWith(positionData);
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: createdPosition,
        message: i18n.t('success.position.created'),
      });
    });

    it('should handle creation failure', async () => {
      // Arrange
      const positionData = {
        title: '',
        level: 'Pleno',
        salaryRange: 'R$ 5.000 - R$ 8.000',
      };
      const errorMessage = i18n.t('errors.position.create_failed');
      
      mockRequest.body = positionData;
      mockPositionService.createPosition.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await positionController.createPosition(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.createPosition).toHaveBeenCalledWith(positionData);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('getPositions', () => {
    it('should get positions successfully', async () => {
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
            id: 'position-1',
            title: 'Desenvolvedor Frontend',
            level: 'Pleno',
            salaryRange: 'R$ 5.000 - R$ 8.000',
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
      mockPositionService.getPositions.mockResolvedValue(result);
      
      // Act
      await positionController.getPositions(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.getPositions).toHaveBeenCalledWith(query);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        ...result,
      });
    });

    it('should handle fetch failure', async () => {
      // Arrange
      const query = { page: 1, limit: 10 };
      const errorMessage = i18n.t('errors.position.fetch_failed');
      
      mockRequest.query = query;
      mockPositionService.getPositions.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await positionController.getPositions(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.getPositions).toHaveBeenCalledWith(query);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('getPositionById', () => {
    it('should get position by id successfully', async () => {
      // Arrange
      const positionId = 'position-123';
      const position = {
        id: positionId,
        title: 'Desenvolvedor Frontend',
        level: 'Pleno',
        salaryRange: 'R$ 5.000 - R$ 8.000',
      };
      
      mockRequest.params = { id: positionId };
      mockPositionService.getPositionById.mockResolvedValue(position);
      
      // Act
      await positionController.getPositionById(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.getPositionById).toHaveBeenCalledWith(positionId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: position,
      });
    });

    it('should handle position not found', async () => {
      // Arrange
      const positionId = 'position-123';
      const errorMessage = i18n.t('errors.position.not_found');
      
      mockRequest.params = { id: positionId };
      mockPositionService.getPositionById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await positionController.getPositionById(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.getPositionById).toHaveBeenCalledWith(positionId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('updatePosition', () => {
    it('should update position successfully', async () => {
      // Arrange
      const positionId = 'position-123';
      const updateData = {
        title: 'Desenvolvedor Full Stack',
        level: 'Sênior',
      };
      const updatedPosition = {
        id: positionId,
        title: 'Desenvolvedor Full Stack',
        level: 'Sênior',
        salaryRange: 'R$ 8.000 - R$ 12.000',
      };
      
      mockRequest.params = { id: positionId };
      mockRequest.body = updateData;
      mockPositionService.updatePosition.mockResolvedValue(updatedPosition);
      
      // Act
      await positionController.updatePosition(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.updatePosition).toHaveBeenCalledWith(positionId, updateData);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: updatedPosition,
        message: i18n.t('success.position.updated'),
      });
    });

    it('should handle update failure with conflict', async () => {
      // Arrange
      const positionId = 'position-123';
      const updateData = { title: 'New Title' };
      const errorMessage = i18n.t('errors.position.in_use');
      
      mockRequest.params = { id: positionId };
      mockRequest.body = updateData;
      mockPositionService.updatePosition.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await positionController.updatePosition(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.updatePosition).toHaveBeenCalledWith(positionId, updateData);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });

    it('should handle update failure with validation error', async () => {
      // Arrange
      const positionId = 'position-123';
      const updateData = { title: '' };
      const errorMessage = i18n.t('errors.position.create_failed');
      
      mockRequest.params = { id: positionId };
      mockRequest.body = updateData;
      mockPositionService.updatePosition.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await positionController.updatePosition(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.updatePosition).toHaveBeenCalledWith(positionId, updateData);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('deletePosition', () => {
    it('should delete position successfully', async () => {
      // Arrange
      const positionId = 'position-123';
      
      mockRequest.params = { id: positionId };
      mockPositionService.deletePosition.mockResolvedValue(undefined);
      
      // Act
      await positionController.deletePosition(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.deletePosition).toHaveBeenCalledWith(positionId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: i18n.t('success.position.deleted'),
      });
    });

    it('should handle delete failure with conflict', async () => {
      // Arrange
      const positionId = 'position-123';
      const errorMessage = i18n.t('errors.position.in_use');
      
      mockRequest.params = { id: positionId };
      mockPositionService.deletePosition.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await positionController.deletePosition(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.deletePosition).toHaveBeenCalledWith(positionId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });

    it('should handle delete failure with validation error', async () => {
      // Arrange
      const positionId = 'position-123';
      const errorMessage = i18n.t('errors.position.not_found');
      
      mockRequest.params = { id: positionId };
      mockPositionService.deletePosition.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await positionController.deletePosition(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.deletePosition).toHaveBeenCalledWith(positionId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('getAllPositions', () => {
    it('should get all positions successfully', async () => {
      // Arrange
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
      
      mockPositionService.getAllPositions.mockResolvedValue(positions);
      
      // Act
      await positionController.getAllPositions(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.getAllPositions).toHaveBeenCalled();
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: positions,
      });
    });

    it('should handle fetch all failure', async () => {
      // Arrange
      const errorMessage = i18n.t('errors.position.fetch_failed');
      
      mockPositionService.getAllPositions.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await positionController.getAllPositions(mockRequest, mockReply);
      
      // Assert
      expect(mockPositionService.getAllPositions).toHaveBeenCalled();
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });
});
