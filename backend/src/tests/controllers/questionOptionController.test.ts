import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QuestionOptionController } from '../../controllers/questionOptionController';
import { QuestionOptionService } from '../../services/questionOptionService';
import { i18n } from '../../i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

// Mock do QuestionOptionService
vi.mock('../../services/questionOptionService');

// Mock do ErrorHandler
vi.mock('../../handlers/ErrorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn()
  }
}));

describe('QuestionOptionController', () => {
  let questionOptionController: QuestionOptionController;
  let mockQuestionOptionService: any;
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
    questionOptionController = new QuestionOptionController();
    
    // Mock QuestionOptionService
    mockQuestionOptionService = {
      createQuestionOption: vi.fn(),
      getQuestionOptions: vi.fn(),
      getQuestionOptionById: vi.fn(),
      updateQuestionOption: vi.fn(),
      deleteQuestionOption: vi.fn(),
      reorderQuestionOptions: vi.fn(),
      toggleQuestionOptionStatus: vi.fn(),
    };
    
    // Replace the service instance
    (questionOptionController as any).questionOptionService = mockQuestionOptionService;
    
    // Mock request and reply
    mockRequest = {
      body: {},
      params: {},
    };
    
    mockReply = {
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createQuestionOption', () => {
    it('should create question option successfully', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionData = {
        label: 'JavaScript',
        orderIndex: 0,
      };
      const createdOption = {
        id: 'option-123',
        questionId,
        ...optionData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockRequest.params = { questionId };
      mockRequest.body = optionData;
      mockQuestionOptionService.createQuestionOption.mockResolvedValue(createdOption);
      
      // Act
      await questionOptionController.createQuestionOption(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.createQuestionOption).toHaveBeenCalledWith(questionId, optionData);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: createdOption,
        message: i18n.t('success.question_option.created'),
      });
    });

    it('should handle creation failure', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionData = {
        label: '',
        orderIndex: 0,
      };
      const errorMessage = i18n.t('errors.questionOption.label_required');
      
      mockRequest.params = { questionId };
      mockRequest.body = optionData;
      mockQuestionOptionService.createQuestionOption.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await questionOptionController.createQuestionOption(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.createQuestionOption).toHaveBeenCalledWith(questionId, optionData);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('getQuestionOptions', () => {
    it('should get question options successfully', async () => {
      // Arrange
      const questionId = 'question-123';
      const options = [
        {
          id: 'option-1',
          questionId,
          label: 'JavaScript',
          orderIndex: 0,
          isActive: true,
        },
        {
          id: 'option-2',
          questionId,
          label: 'TypeScript',
          orderIndex: 1,
          isActive: true,
        },
      ];
      
      mockRequest.params = { questionId };
      mockQuestionOptionService.getQuestionOptions.mockResolvedValue(options);
      
      // Act
      await questionOptionController.getQuestionOptions(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.getQuestionOptions).toHaveBeenCalledWith(questionId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: options,
      });
    });

    it('should handle fetch failure', async () => {
      // Arrange
      const questionId = 'question-123';
      const errorMessage = i18n.t('errors.questionOption.fetch_failed');
      
      mockRequest.params = { questionId };
      mockQuestionOptionService.getQuestionOptions.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await questionOptionController.getQuestionOptions(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.getQuestionOptions).toHaveBeenCalledWith(questionId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('getQuestionOptionById', () => {
    it('should get question option by id successfully', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionId = 'option-123';
      const option = {
        id: optionId,
        questionId,
        label: 'JavaScript',
        orderIndex: 0,
        isActive: true,
      };
      
      mockRequest.params = { questionId, optionId };
      mockQuestionOptionService.getQuestionOptionById.mockResolvedValue(option);
      
      // Act
      await questionOptionController.getQuestionOptionById(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.getQuestionOptionById).toHaveBeenCalledWith(questionId, optionId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: option,
      });
    });

    it('should handle option not found', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionId = 'option-123';
      const errorMessage = i18n.t('errors.questionOption.not_found');
      
      mockRequest.params = { questionId, optionId };
      mockQuestionOptionService.getQuestionOptionById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await questionOptionController.getQuestionOptionById(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.getQuestionOptionById).toHaveBeenCalledWith(questionId, optionId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('updateQuestionOption', () => {
    it('should update question option successfully', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionId = 'option-123';
      const updateData = {
        label: 'JavaScript ES6+',
        orderIndex: 1,
      };
      const updatedOption = {
        id: optionId,
        questionId,
        ...updateData,
        isActive: true,
      };
      
      mockRequest.params = { questionId, optionId };
      mockRequest.body = updateData;
      mockQuestionOptionService.updateQuestionOption.mockResolvedValue(updatedOption);
      
      // Act
      await questionOptionController.updateQuestionOption(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.updateQuestionOption).toHaveBeenCalledWith(questionId, optionId, updateData);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: updatedOption,
        message: i18n.t('success.question_option.updated'),
      });
    });

    it('should handle update failure', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionId = 'option-123';
      const updateData = { label: '' };
      const errorMessage = i18n.t('errors.questionOption.label_required');
      
      mockRequest.params = { questionId, optionId };
      mockRequest.body = updateData;
      mockQuestionOptionService.updateQuestionOption.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await questionOptionController.updateQuestionOption(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.updateQuestionOption).toHaveBeenCalledWith(questionId, optionId, updateData);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('deleteQuestionOption', () => {
    it('should delete question option successfully', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionId = 'option-123';
      
      mockRequest.params = { questionId, optionId };
      mockQuestionOptionService.deleteQuestionOption.mockResolvedValue(undefined);
      
      // Act
      await questionOptionController.deleteQuestionOption(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.deleteQuestionOption).toHaveBeenCalledWith(questionId, optionId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: i18n.t('success.question_option.deleted'),
      });
    });

    it('should handle delete failure with existing answers', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionId = 'option-123';
      const errorMessage = i18n.t('errors.questionOption.has_answers');
      
      mockRequest.params = { questionId, optionId };
      mockQuestionOptionService.deleteQuestionOption.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await questionOptionController.deleteQuestionOption(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.deleteQuestionOption).toHaveBeenCalledWith(questionId, optionId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('reorderQuestionOptions', () => {
    it('should reorder question options successfully', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionIds = ['option-2', 'option-1', 'option-3'];
      
      mockRequest.params = { questionId };
      mockRequest.body = { optionIds };
      mockQuestionOptionService.reorderQuestionOptions.mockResolvedValue(undefined);
      
      // Act
      await questionOptionController.reorderQuestionOptions(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.reorderQuestionOptions).toHaveBeenCalledWith(questionId, { optionIds });
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: i18n.t('success.question_option.reordered'),
      });
    });

    it('should handle reorder failure', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionIds = ['option-2', 'option-1'];
      const errorMessage = i18n.t('errors.questionOption.reorder_failed');
      
      mockRequest.params = { questionId };
      mockRequest.body = { optionIds };
      mockQuestionOptionService.reorderQuestionOptions.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await questionOptionController.reorderQuestionOptions(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.reorderQuestionOptions).toHaveBeenCalledWith(questionId, { optionIds });
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('toggleQuestionOptionStatus', () => {
    it('should toggle question option status successfully', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionId = 'option-123';
      const toggledOption = {
        id: optionId,
        questionId,
        label: 'JavaScript',
        isActive: false,
      };
      
      mockRequest.params = { questionId, optionId };
      mockQuestionOptionService.toggleQuestionOptionStatus.mockResolvedValue(toggledOption);
      
      // Act
      await questionOptionController.toggleQuestionOptionStatus(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.toggleQuestionOptionStatus).toHaveBeenCalledWith(questionId, optionId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: toggledOption,
        message: i18n.t('success.question_option.status_toggled'),
      });
    });

    it('should handle toggle failure', async () => {
      // Arrange
      const questionId = 'question-123';
      const optionId = 'option-123';
      const errorMessage = i18n.t('errors.questionOption.not_found');
      
      mockRequest.params = { questionId, optionId };
      mockQuestionOptionService.toggleQuestionOptionStatus.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await questionOptionController.toggleQuestionOptionStatus(mockRequest, mockReply);
      
      // Assert
      expect(mockQuestionOptionService.toggleQuestionOptionStatus).toHaveBeenCalledWith(questionId, optionId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });
});
