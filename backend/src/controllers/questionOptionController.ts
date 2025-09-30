import { FastifyRequest, FastifyReply } from 'fastify';
import { QuestionOptionService } from '@/services/questionOptionService';
import { success } from '@/i18n/i18n';
import { ErrorHandler } from '@/handlers/ErrorHandler';

interface QuestionOptionParams {
  questionId: string;
  optionId?: string;
}

export class QuestionOptionController {
  private questionOptionService: QuestionOptionService;
  
  constructor() {
    this.questionOptionService = new QuestionOptionService();
  }
  
  async createQuestionOption(request: FastifyRequest<{ Params: QuestionOptionParams }>, reply: FastifyReply) {
    try {
      const { questionId } = request.params;
      const optionData = request.body as any;
      
      const option = await this.questionOptionService.createQuestionOption(questionId, optionData);
      
      return reply.status(201).send({
        success: true,
        data: option,
        message: success('question_option.created'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getQuestionOptions(request: FastifyRequest<{ Params: QuestionOptionParams }>, reply: FastifyReply) {
    try {
      const { questionId } = request.params;
      const options = await this.questionOptionService.getQuestionOptions(questionId);
      
      return reply.send({
        success: true,
        data: options,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getQuestionOptionById(request: FastifyRequest<{ Params: QuestionOptionParams }>, reply: FastifyReply) {
    try {
      const { questionId, optionId } = request.params;
      
      if (!optionId) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Option ID is required',
        });
      }
      
      const option = await this.questionOptionService.getQuestionOptionById(questionId, optionId);
      
      return reply.send({
        success: true,
        data: option,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async updateQuestionOption(request: FastifyRequest<{ Params: QuestionOptionParams }>, reply: FastifyReply) {
    try {
      const { questionId, optionId } = request.params;
      const optionData = request.body as any;
      
      if (!optionId) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Option ID is required',
        });
      }
      
      const option = await this.questionOptionService.updateQuestionOption(questionId, optionId, optionData);
      
      return reply.send({
        success: true,
        data: option,
        message: success('question_option.updated'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async deleteQuestionOption(request: FastifyRequest<{ Params: QuestionOptionParams }>, reply: FastifyReply) {
    try {
      const { questionId, optionId } = request.params;
      
      if (!optionId) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Option ID is required',
        });
      }
      
      await this.questionOptionService.deleteQuestionOption(questionId, optionId);
      
      return reply.send({
        success: true,
        message: success('question_option.deleted'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async reorderQuestionOptions(request: FastifyRequest<{ Params: QuestionOptionParams }>, reply: FastifyReply) {
    try {
      const { questionId } = request.params;
      const reorderData = request.body as any;
      
      const options = await this.questionOptionService.reorderQuestionOptions(questionId, reorderData);
      
      return reply.send({
        success: true,
        data: options,
        message: success('question_option.reordered'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async toggleQuestionOptionStatus(request: FastifyRequest<{ Params: QuestionOptionParams }>, reply: FastifyReply) {
    try {
      const { questionId, optionId } = request.params;
      
      if (!optionId) {
        return reply.status(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Option ID is required',
        });
      }
      
      const option = await this.questionOptionService.toggleQuestionOptionStatus(questionId, optionId);
      
      return reply.send({
        success: true,
        data: option,
        message: success('question_option.status_toggled'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
}
