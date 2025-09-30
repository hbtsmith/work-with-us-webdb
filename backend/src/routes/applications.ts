import { FastifyInstance } from 'fastify';
import { ApplicationController } from '@/controllers/applicationController';
import { authenticate } from '@/middlewares/auth';
import {  validateParams, validateQuery } from '@/middlewares/validation';
import {
  idParamSchema,
  jobIdParamSchema,
  jobSlugParamSchema,
  paginationSchema,
} from '@/schemas';
import { applicationsSwaggerDocs } from '@/swagger';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export async function applicationRoutes(fastify: FastifyInstance) {
  const applicationController = new ApplicationController();
  
  // Public route - submit application
  fastify.post('/submit/:slug', {
    preHandler: [validateParams(jobSlugParamSchema)],
    schema: applicationsSwaggerDocs.submitApplication,
    handler: applicationController.submitApplication.bind(applicationController),
  });
  
  // Protected routes
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', authenticate);
    
    // Get all applications
    fastify.get('/', {
      preHandler: [validateQuery(paginationSchema)],
      schema: applicationsSwaggerDocs.getApplications,
      handler: applicationController.getApplications.bind(applicationController),
    });
    
    // Get application by ID
    fastify.get('/:id', {
      preHandler: [validateParams(idParamSchema)],
      schema: applicationsSwaggerDocs.getApplicationById,
      handler: applicationController.getApplicationById.bind(applicationController),
    });
    
    // Get applications by job
    fastify.get('/job/:jobId', {
      preHandler: [validateParams(jobIdParamSchema)],
      schema: applicationsSwaggerDocs.getApplicationsByJob,
      handler: applicationController.getApplicationsByJob.bind(applicationController),
    });
    
    // Delete application
    fastify.delete('/:id', {
      preHandler: [validateParams(idParamSchema)],
      schema: applicationsSwaggerDocs.deleteApplication,
      handler: applicationController.deleteApplication.bind(applicationController),
    });
    
    // Get application statistics
    fastify.get('/stats/overview', {
      schema: applicationsSwaggerDocs.getApplicationStats,
      handler: applicationController.getApplicationStats.bind(applicationController),
    });
  });
}
