import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuestionOptionService } from '../../services/questionOptionService';
import { TestDataSetupService, TestDataSetup } from './test-data-setup';
import { prisma } from '../../database/client';
import { cleanupTestData } from '../setup';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

describe('Question Options E2E Tests', () => {
  let questionOptionService: QuestionOptionService;
  let testDataSetup: TestDataSetupService;
  let testData: TestDataSetup;
  let optionId: string;

  beforeEach(async () => {
    questionOptionService = new QuestionOptionService();
    testDataSetup = new TestDataSetupService();
    await cleanupTestData();
    
    // Setup completo de dados de teste
    testData = await testDataSetup.setupCompleteTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Question Option CRUD Flow', () => {
    it('should create question option successfully', async () => {
      // Arrange
      const optionData = {
        label: 'Mobile',
        orderIndex: 3,
      };

      // Act
      const option = await questionOptionService.createQuestionOption(testData.questionIds.singleChoice, optionData);

      // Assert
      expect(option.id).toBeDefined();
      expect(option.label).toBe('Mobile');
      expect(option.orderIndex).toBe(3);
      expect(option.questionId).toBe(testData.questionIds.singleChoice);
      expect(option.isActive).toBe(true);
      
      // Store option ID for other tests
      optionId = option.id;
    });

    it('should get question options successfully', async () => {
      // Act - Get options that were created in setup
      const options = await questionOptionService.getQuestionOptions(testData.questionIds.singleChoice);

      // Assert
      expect(options).toHaveLength(3); // Frontend, Backend, Full Stack from setup
      expect(options[0].label).toBe('Frontend');
      expect(options[1].label).toBe('Backend');
      expect(options[2].label).toBe('Full Stack');
    });

    it('should get question option by id successfully', async () => {
      // Arrange
      const option = await questionOptionService.createQuestionOption(questionId, {
        label: 'Frontend',
        orderIndex: 0,
      });
      optionId = option.id;

      // Act
      const foundOption = await questionOptionService.getQuestionOptionById(questionId, optionId);

      // Assert
      expect(foundOption.id).toBe(optionId);
      expect(foundOption.label).toBe('Frontend');
      expect(foundOption.orderIndex).toBe(0);
      expect(foundOption.questionId).toBe(questionId);
    });

    it('should fail with non-existent option', async () => {
      // Act & Assert
      await expect(questionOptionService.getQuestionOptionById(questionId, 'non-existent-id')).rejects.toThrow();
    });

    it('should update question option successfully', async () => {
      // Arrange
      const option = await questionOptionService.createQuestionOption(questionId, {
        label: 'Frontend',
        orderIndex: 0,
      });
      optionId = option.id;

      const updateData = {
        label: 'Frontend Development',
        orderIndex: 1,
      };

      // Act
      const updatedOption = await questionOptionService.updateQuestionOption(questionId, optionId, updateData);

      // Assert
      expect(updatedOption.id).toBe(optionId);
      expect(updatedOption.label).toBe('Frontend Development');
      expect(updatedOption.orderIndex).toBe(1);
    });

    it('should fail update with non-existent option', async () => {
      // Arrange
      const updateData = {
        label: 'Frontend Development',
        orderIndex: 1,
      };

      // Act & Assert
      await expect(questionOptionService.updateQuestionOption(questionId, 'non-existent-id', updateData)).rejects.toThrow();
    });

    it('should delete question option successfully', async () => {
      // Arrange
      const option = await questionOptionService.createQuestionOption(questionId, {
        label: 'Frontend',
        orderIndex: 0,
      });
      optionId = option.id;

      // Act
      await questionOptionService.deleteQuestionOption(questionId, optionId);

      // Assert - Verify option was deleted
      const optionExists = await prisma.questionOption.findUnique({
        where: { id: optionId },
      });
      expect(optionExists).toBeNull();
    });

    it('should fail delete with non-existent option', async () => {
      // Act & Assert
      await expect(questionOptionService.deleteQuestionOption(questionId, 'non-existent-id')).rejects.toThrow();
    });
  });

  describe('Question Option Reordering Flow', () => {
    beforeEach(async () => {
      // Create test options
      const option1 = await questionOptionService.createQuestionOption(questionId, {
        label: 'Frontend',
        orderIndex: 0,
      });
      
      const option2 = await questionOptionService.createQuestionOption(questionId, {
        label: 'Backend',
        orderIndex: 1,
      });
      
      const option3 = await questionOptionService.createQuestionOption(questionId, {
        label: 'Full Stack',
        orderIndex: 2,
      });

      optionId = option1.id;
    });

    it('should reorder question options successfully', async () => {
      // Arrange
      const options = await questionOptionService.getQuestionOptions(questionId);
      const optionIds = options.map(option => option.id);

      // Act - Reorder: Backend, Full Stack, Frontend
      await questionOptionService.reorderQuestionOptions(questionId, [optionIds[1], optionIds[2], optionIds[0]]);

      // Assert
      const reorderedOptions = await questionOptionService.getQuestionOptions(questionId);
      expect(reorderedOptions[0].id).toBe(optionIds[1]); // Backend
      expect(reorderedOptions[1].id).toBe(optionIds[2]); // Full Stack
      expect(reorderedOptions[2].id).toBe(optionIds[0]); // Frontend
    });

    it('should fail reorder with invalid option IDs', async () => {
      // Act & Assert
      await expect(questionOptionService.reorderQuestionOptions(questionId, ['invalid-id-1', 'invalid-id-2'])).rejects.toThrow();
    });
  });

  describe('Question Option Status Management', () => {
    beforeEach(async () => {
      // Create test option
      const option = await questionOptionService.createQuestionOption(questionId, {
        label: 'Frontend',
        orderIndex: 0,
      });
      optionId = option.id;
    });

    it('should toggle question option status successfully', async () => {
      // Act
      const toggledOption = await questionOptionService.toggleQuestionOptionStatus(questionId, optionId);

      // Assert
      expect(toggledOption.id).toBe(optionId);
      expect(toggledOption.isActive).toBe(false);
    });

    it('should fail toggle with non-existent option', async () => {
      // Act & Assert
      await expect(questionOptionService.toggleQuestionOptionStatus(questionId, 'non-existent-id')).rejects.toThrow();
    });
  });

  describe('Question Option with Answers Flow', () => {
    beforeEach(async () => {
      // Create test option
      const option = await questionOptionService.createQuestionOption(questionId, {
        label: 'Frontend',
        orderIndex: 0,
      });
      optionId = option.id;
    });

    it('should prevent deletion of option with existing answers', async () => {
      // Arrange - Create application with answer using this option
      const application = await prisma.application.create({
        data: {
          jobId: jobId,
          applicantName: 'João Silva',
          applicantEmail: 'joao@test.com',
          applicantPhone: '11999999999',
        },
      });

      await prisma.answer.create({
        data: {
          applicationId: application.id,
          questionId: questionId,
          questionOptionId: optionId,
        },
      });

      // Act & Assert
      await expect(questionOptionService.deleteQuestionOption(questionId, optionId)).rejects.toThrow();
    });

    it('should allow deletion of option without answers', async () => {
      // Act
      await questionOptionService.deleteQuestionOption(questionId, optionId);

      // Assert - Verify option was deleted
      const optionExists = await prisma.questionOption.findUnique({
        where: { id: optionId },
      });
      expect(optionExists).toBeNull();
    });
  });

  describe('Question Option Edge Cases', () => {
    it('should handle empty options list', async () => {
      // Act
      const options = await questionOptionService.getQuestionOptions(questionId);

      // Assert
      expect(options).toHaveLength(0);
    });

    it('should handle multiple options with same order', async () => {
      // Arrange
      await questionOptionService.createQuestionOption(questionId, {
        label: 'Option 1',
        orderIndex: 0,
      });
      
      await questionOptionService.createQuestionOption(questionId, {
        label: 'Option 2',
        orderIndex: 0, // Same order
      });

      // Act
      const options = await questionOptionService.getQuestionOptions(questionId);

      // Assert
      expect(options).toHaveLength(2);
      expect(options[0].orderIndex).toBe(0);
      expect(options[1].orderIndex).toBe(0);
    });

    it('should handle large number of options', async () => {
      // Arrange - Create many options
      const optionPromises = [];
      for (let i = 1; i <= 10; i++) {
        optionPromises.push(
          questionOptionService.createQuestionOption(questionId, {
            label: `Option ${i}`,
            orderIndex: i - 1,
          })
        );
      }
      await Promise.all(optionPromises);

      // Act
      const options = await questionOptionService.getQuestionOptions(questionId);

      // Assert
      expect(options).toHaveLength(10);
      expect(options[0].label).toBe('Option 1');
      expect(options[9].label).toBe('Option 10');
    });
  });
});
