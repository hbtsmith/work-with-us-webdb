import { FastifyInstance } from 'fastify';
import { QuestionOptionController } from '@/controllers/questionOptionController';
import { authenticate } from '@/middlewares/auth';
import { questionOptionsSwaggerDocs } from '@/swagger';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export async function questionOptionRoutes(fastify: FastifyInstance) {
  const questionOptionController = new QuestionOptionController();
  
  // Protected routes - all require authentication
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', authenticate);
    
    // Get all options for a question
    fastify.get('/:questionId/options', {
      schema: questionOptionsSwaggerDocs.getQuestionOptions,
      handler: questionOptionController.getQuestionOptions.bind(questionOptionController),
    });
    
    // Create new option for a question
    fastify.post('/:questionId/options', {
      schema: questionOptionsSwaggerDocs.createQuestionOption,
      handler: questionOptionController.createQuestionOption.bind(questionOptionController),
    });
    
    // Get specific option
    fastify.get('/:questionId/options/:optionId', {
      schema: questionOptionsSwaggerDocs.getQuestionOptionById,
      handler: questionOptionController.getQuestionOptionById.bind(questionOptionController),
    });
    
    // Update specific option
    fastify.put('/:questionId/options/:optionId', {
      schema: questionOptionsSwaggerDocs.updateQuestionOption,
      handler: questionOptionController.updateQuestionOption.bind(questionOptionController),
    });
    
    // Delete specific option
    fastify.delete('/:questionId/options/:optionId', {
      schema: questionOptionsSwaggerDocs.deleteQuestionOption,
      handler: questionOptionController.deleteQuestionOption.bind(questionOptionController),
    });
    
    // Reorder options
    fastify.put('/:questionId/options/reorder', {
      schema: questionOptionsSwaggerDocs.reorderQuestionOptions,
      handler: questionOptionController.reorderQuestionOptions.bind(questionOptionController),
    });
    
    // Toggle option status
    fastify.patch('/:questionId/options/:optionId/toggle', {
      schema: questionOptionsSwaggerDocs.toggleQuestionOptionStatus,
      handler: questionOptionController.toggleQuestionOptionStatus.bind(questionOptionController),
    });
  });
}
