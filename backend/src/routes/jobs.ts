import { FastifyInstance } from 'fastify';
import { JobController } from '@/controllers/jobController';
import { authenticate } from '@/middlewares/auth';
import { validateBody, validateParams, validateQuery } from '@/middlewares/validation';
import {
  createJobSchema,
  updateJobSchema,
  cloneJobSchema,
  idParamSchema,
  jobSlugParamSchema,
  paginationSchema,
  jobIdParamSchema,
  jobQuestionParamsSchema,
  createJobQuestionSchema,
  updateJobQuestionSchema,
} from '@/schemas';
import { jobsSwaggerDocs } from '@/swagger';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export async function jobRoutes(fastify: FastifyInstance) {
  const jobController = new JobController();
  
  // Public route - get job by slug for application form
  fastify.get('/public/:slug', {
    preHandler: [validateParams(jobSlugParamSchema)],
    schema: jobsSwaggerDocs.getJobBySlug,
    handler: jobController.getJobBySlug.bind(jobController),
  });
  
  // Protected routes
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', authenticate);
    
    // CRUD operations
    fastify.post('/', {
      preHandler: [validateBody(createJobSchema)],
      schema: jobsSwaggerDocs.createJob,
      handler: jobController.createJob.bind(jobController),
    });
    
    fastify.get('/', {
      preHandler: [validateQuery(paginationSchema)],
      schema: jobsSwaggerDocs.getJobs,
      handler: jobController.getJobs.bind(jobController),
    });
    
    fastify.get('/:id', {
      preHandler: [validateParams(idParamSchema)],
      schema: jobsSwaggerDocs.getJobById,
      handler: jobController.getJobById.bind(jobController),
    });
    
    fastify.put('/:id', {
      preHandler: [
        validateParams(idParamSchema),
        validateBody(updateJobSchema),
      ],
      schema: jobsSwaggerDocs.updateJob,
      handler: jobController.updateJob.bind(jobController),
    });
    
    fastify.delete('/:id', {
      preHandler: [validateParams(idParamSchema)],
      schema: jobsSwaggerDocs.deleteJob,
      handler: jobController.deleteJob.bind(jobController),
    });
    
    // Additional operations
    fastify.post('/:id/clone', {
      preHandler: [
        validateParams(idParamSchema),
        validateBody(cloneJobSchema),
      ],
      schema: jobsSwaggerDocs.cloneJob,
      handler: jobController.cloneJob.bind(jobController),
    });
    
    // Question management routes
    fastify.post('/:jobId/questions', {
      preHandler: [
        validateParams(jobIdParamSchema),
        validateBody(createJobQuestionSchema)
      ],
      schema: jobsSwaggerDocs.createJobQuestion,
      handler: jobController.createJobQuestion.bind(jobController),
    });
    
    fastify.put('/:jobId/questions/:questionId', {
      preHandler: [
        validateParams(jobQuestionParamsSchema),
        validateBody(updateJobQuestionSchema)
      ],
      schema: jobsSwaggerDocs.updateJobQuestion,
      handler: jobController.updateJobQuestion.bind(jobController),
    });
    
    fastify.delete('/:jobId/questions/:questionId', {
      preHandler: [validateParams(jobQuestionParamsSchema)],
      schema: jobsSwaggerDocs.deleteJobQuestion,
      handler: jobController.deleteJobQuestion.bind(jobController),
    });
    
    fastify.patch('/:id/toggle-status', {
      preHandler: [validateParams(idParamSchema)],
      schema: jobsSwaggerDocs.toggleJobStatus,
      handler: jobController.toggleJobStatus.bind(jobController),
    });
  });
}
