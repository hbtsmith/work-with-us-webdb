import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QuestionOptionService } from '../../services/questionOptionService';
import { prisma } from '../../database/client';
import { cleanupTestData, generateUniqueId } from '../setup';
import { i18n } from '../../i18n/i18n';

describe('QuestionOptionService', () => {
  let questionOptionService: QuestionOptionService;
  let position: any;
  let job: any;
  let question: any;
  
  beforeEach(async () => {
    // Configure i18n for tests
    i18n.setLocale('pt_BR');
    questionOptionService = new QuestionOptionService();
    
    // Create test position
    const uniqueId = generateUniqueId();
    position = await prisma.position.create({
      data: {
        title: `Test Developer ${uniqueId}`,
        level: 'Mid-level',
        salaryRange: 'R$ 5.000 - R$ 8.000',
      },
    });
    
    // Create test job
    job = await prisma.job.create({
      data: {
        title: 'Test Job',
        description: 'Test description',
        slug: `test-job-${uniqueId}`,
        positionId: position.id,
        isActive: true,
      },
    });
    
    // Create test question
    question = await prisma.question.create({
      data: {
        label: 'Select your skills',
        type: 'MULTIPLE_CHOICE',
        isRequired: true,
        order: 1,
        jobId: job.id,
      },
    });
  });
  
  afterEach(async () => {
    await cleanupTestData();
  });
  
  describe('createQuestionOption', () => {
    it('should create a question option', async () => {
      // Arrange
      const optionData = {
        label: 'JavaScript',
      };
      
      // Act
      const result = await questionOptionService.createQuestionOption(question.id, optionData);
      
      // Assert
      expect(result.label).toBe('JavaScript');
      expect(result.questionId).toBe(question.id);
      expect(result.orderIndex).toBe(0);
      expect(result.isActive).toBe(true);
    });
    
    it('should create question option with custom order index', async () => {
      // Arrange
      const optionData = {
        label: 'TypeScript',
        orderIndex: 5,
      };
      
      // Act
      const result = await questionOptionService.createQuestionOption(question.id, optionData);
      
      // Assert
      expect(result.label).toBe('TypeScript');
      expect(result.orderIndex).toBe(5);
    });
    
    it('should throw error if question does not exist', async () => {
      // Arrange
      const nonExistentQuestionId = 'non-existent-id';
      const optionData = {
        label: 'JavaScript',
      };
      
      // Act & Assert
      await expect(
        questionOptionService.createQuestionOption(nonExistentQuestionId, optionData)
      ).rejects.toThrow();
    });
  });
  
  describe('getQuestionOptions', () => {
    it('should get all options for a question', async () => {
      // Arrange
      await prisma.questionOption.createMany({
        data: [
          {
            questionId: question.id,
            label: 'JavaScript',
            orderIndex: 0,
          },
          {
            questionId: question.id,
            label: 'TypeScript',
            orderIndex: 1,
          },
        ],
      });
      
      // Act
      const result = await questionOptionService.getQuestionOptions(question.id);
      
      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].label).toBe('JavaScript');
      expect(result[1].label).toBe('TypeScript');
      expect(result[0].orderIndex).toBe(0);
      expect(result[1].orderIndex).toBe(1);
    });
    
    it('should return empty array if no options exist', async () => {
      // Act
      const result = await questionOptionService.getQuestionOptions(question.id);
      
      // Assert
      expect(result).toHaveLength(0);
    });
    
    it('should throw error if question does not exist', async () => {
      // Arrange
      const nonExistentQuestionId = 'non-existent-id';
      
      // Act & Assert
      await expect(
        questionOptionService.getQuestionOptions(nonExistentQuestionId)
      ).rejects.toThrow();
    });
  });
  
  describe('getQuestionOptionById', () => {
    it('should get specific question option', async () => {
      // Arrange
      const option = await prisma.questionOption.create({
        data: {
          questionId: question.id,
          label: 'JavaScript',
          orderIndex: 0,
        },
      });
      
      // Act
      const result = await questionOptionService.getQuestionOptionById(question.id, option.id);
      
      // Assert
      expect(result.id).toBe(option.id);
      expect(result.label).toBe('JavaScript');
    });
    
    it('should throw error if option does not exist', async () => {
      // Arrange
      const nonExistentOptionId = 'non-existent-id';
      
      // Act & Assert
      await expect(
        questionOptionService.getQuestionOptionById(question.id, nonExistentOptionId)
      ).rejects.toThrow();
    });
  });
  
  describe('updateQuestionOption', () => {
    it('should update question option', async () => {
      // Arrange
      const option = await prisma.questionOption.create({
        data: {
          questionId: question.id,
          label: 'JavaScript',
          orderIndex: 0,
        },
      });
      
      const updateData = {
        label: 'Updated JavaScript',
        orderIndex: 1,
      };
      
      // Act
      const result = await questionOptionService.updateQuestionOption(question.id, option.id, updateData);
      
      // Assert
      expect(result.label).toBe('Updated JavaScript');
      expect(result.orderIndex).toBe(1);
    });
    
    it('should throw error if option has answers', async () => {
      // Arrange
      const option = await prisma.questionOption.create({
        data: {
          questionId: question.id,
          label: 'JavaScript',
          orderIndex: 0,
        },
      });
      
      // Create an application with answer
      const application = await prisma.application.create({
        data: {
          jobId: job.id,
        },
      });
      
      await prisma.answer.create({
        data: {
          applicationId: application.id,
          questionId: question.id,
          questionOptionId: option.id,
        },
      });
      
      const updateData = {
        label: 'Updated JavaScript',
      };
      
      // Act & Assert
      await expect(
        questionOptionService.updateQuestionOption(question.id, option.id, updateData)
      ).rejects.toThrow();
    });
  });
  
  describe('deleteQuestionOption', () => {
    it('should delete question option', async () => {
      // Arrange
      const option = await prisma.questionOption.create({
        data: {
          questionId: question.id,
          label: 'JavaScript',
          orderIndex: 0,
        },
      });
      
      // Act
      await questionOptionService.deleteQuestionOption(question.id, option.id);
      
      // Assert
      const deletedOption = await prisma.questionOption.findUnique({
        where: { id: option.id },
      });
      expect(deletedOption).toBeNull();
    });
    
    it('should throw error if option has answers', async () => {
      // Arrange
      const option = await prisma.questionOption.create({
        data: {
          questionId: question.id,
          label: 'JavaScript',
          orderIndex: 0,
        },
      });
      
      // Create an application with answer
      const application = await prisma.application.create({
        data: {
          jobId: job.id,
        },
      });
      
      await prisma.answer.create({
        data: {
          applicationId: application.id,
          questionId: question.id,
          questionOptionId: option.id,
        },
      });
      
      // Act & Assert
      await expect(
        questionOptionService.deleteQuestionOption(question.id, option.id)
      ).rejects.toThrow();
    });
  });
  
  describe('reorderQuestionOptions', () => {
    it('should reorder question options', async () => {
      // Arrange
      const option1 = await prisma.questionOption.create({
        data: {
          questionId: question.id,
          label: 'JavaScript',
          orderIndex: 0,
        },
      });
      
      const option2 = await prisma.questionOption.create({
        data: {
          questionId: question.id,
          label: 'TypeScript',
          orderIndex: 1,
        },
      });
      
      const option3 = await prisma.questionOption.create({
        data: {
          questionId: question.id,
          label: 'Python',
          orderIndex: 2,
        },
      });
      
      // Act
      const result = await questionOptionService.reorderQuestionOptions(question.id, {
        optionIds: [option3.id, option1.id, option2.id],
      });
      
      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(option3.id);
      expect(result[0].orderIndex).toBe(0);
      expect(result[1].id).toBe(option1.id);
      expect(result[1].orderIndex).toBe(1);
      expect(result[2].id).toBe(option2.id);
      expect(result[2].orderIndex).toBe(2);
    });
    
    it('should throw error if question does not exist', async () => {
      // Arrange
      const nonExistentQuestionId = 'non-existent-id';
      
      // Act & Assert
      await expect(
        questionOptionService.reorderQuestionOptions(nonExistentQuestionId, {
          optionIds: ['option1', 'option2'],
        })
      ).rejects.toThrow();
    });
  });
  
  describe('toggleQuestionOptionStatus', () => {
    it('should toggle question option status', async () => {
      // Arrange
      const option = await prisma.questionOption.create({
        data: {
          questionId: question.id,
          label: 'JavaScript',
          orderIndex: 0,
          isActive: true,
        },
      });
      
      // Act
      const result = await questionOptionService.toggleQuestionOptionStatus(question.id, option.id);
      
      // Assert
      expect(result.isActive).toBe(false);
    });
    
    it('should throw error if option does not exist', async () => {
      // Arrange
      const nonExistentOptionId = 'non-existent-id';
      
      // Act & Assert
      await expect(
        questionOptionService.toggleQuestionOptionStatus(question.id, nonExistentOptionId)
      ).rejects.toThrow();
    });
  });
});
