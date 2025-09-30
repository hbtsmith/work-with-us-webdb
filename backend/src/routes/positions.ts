import { FastifyInstance } from 'fastify';
import { PositionController } from '@/controllers/positionController';
import { authenticate } from '@/middlewares/auth';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validation';
import {
  createPositionSchema,
  updatePositionSchema,
  idParamSchema,
  paginationSchema,
} from '@/schemas';
import { positionsSwaggerDocs } from '@/swagger';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export async function positionRoutes(fastify: FastifyInstance) {
  const positionController = new PositionController();
  
  // All position routes require authentication
  fastify.addHook('preHandler', authenticate);
  
  // Get all positions (for dropdowns)
  fastify.get('/all', {
    schema: positionsSwaggerDocs.getAllPositionsSimple,
    handler: positionController.getAllPositions.bind(positionController),
  });
  
  // CRUD operations
  fastify.post('/', {
    preHandler: [validateBody(createPositionSchema)],
    schema: positionsSwaggerDocs.createPosition,
    handler: positionController.createPosition.bind(positionController),
  });
  
  fastify.get('/', {
    preHandler: [validateQuery(paginationSchema)],
    schema: positionsSwaggerDocs.getAllPositions,
    handler: positionController.getPositions.bind(positionController),
  });
  
  fastify.get('/:id', {
    preHandler: [validateParams(idParamSchema)],
    schema: positionsSwaggerDocs.getPositionById,
    handler: positionController.getPositionById.bind(positionController),
  });
  
  fastify.put('/:id', {
    preHandler: [
      validateParams(idParamSchema),
      validateBody(updatePositionSchema),
    ],
    schema: positionsSwaggerDocs.updatePosition,
    handler: positionController.updatePosition.bind(positionController),
  });
  
  fastify.delete('/:id', {
    preHandler: [validateParams(idParamSchema)],
    schema: positionsSwaggerDocs.deletePosition,
    handler: positionController.deletePosition.bind(positionController),
  });
}
