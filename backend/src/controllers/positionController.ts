import { FastifyRequest, FastifyReply } from 'fastify';
import { PositionService } from '@/services/positionService';
import { PaginationQuery } from '@/types';
import { success } from '@/i18n/i18n';
import { ErrorHandler } from '@/handlers/ErrorHandler';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export class PositionController {
  private positionService: PositionService;
  
  constructor() {
    this.positionService = new PositionService();
  }
  
  async createPosition(request: FastifyRequest, reply: FastifyReply) {
    try {
      const positionData = request.body as any;
      const position = await this.positionService.createPosition(positionData);
      
      return reply.status(201).send({
        success: true,
        data: position,
        message: success('position.created'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getPositions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as PaginationQuery;
      const result = await this.positionService.getPositions(query);
      
      return reply.send({
        success: true,
        ...result,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getPositionById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const position = await this.positionService.getPositionById(id);
      
      return reply.send({
        success: true,
        data: position,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async updatePosition(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;
      
      const position = await this.positionService.updatePosition(id, updateData);
      
      return reply.send({
        success: true,
        data: position,
        message: success('position.updated'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async deletePosition(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      await this.positionService.deletePosition(id);
      
      return reply.send({
        success: true,
        message: success('position.deleted'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getAllPositions(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const positions = await this.positionService.getAllPositions();
      
      return reply.send({
        success: true,
        data: positions,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
}
