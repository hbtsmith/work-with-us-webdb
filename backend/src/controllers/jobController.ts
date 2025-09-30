import { FastifyRequest, FastifyReply } from 'fastify';
import { JobService } from '@/services/jobService';
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

export class JobController {
  private jobService: JobService;
  
  constructor() {
    this.jobService = new JobService();
  }
  
  async createJob(request: FastifyRequest, reply: FastifyReply) {
    try {
      const jobData = request.body as any;
      const job = await this.jobService.createJob(jobData);
      
      return reply.status(201).send({
        success: true,
        data: job,
        message: success('job.created'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getJobs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as PaginationQuery;
      const result = await this.jobService.getJobs(query);
      
      return reply.send({
        success: true,
        ...result,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getJobById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const job = await this.jobService.getJobById(id);
      
      return reply.send({
        success: true,
        data: job,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getJobBySlug(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = request.params as { slug: string };
      const job = await this.jobService.getJobBySlug(slug);
      
      return reply.send({
        success: true,
        data: job,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async updateJob(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;
      
      const job = await this.jobService.updateJob(id, updateData);
      
      return reply.send({
        success: true,
        data: job,
        message: success('job.updated'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async deleteJob(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      await this.jobService.deleteJob(id);
      
      return reply.send({
        success: true,
        message: success('job.deleted'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async cloneJob(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const cloneData = request.body as { title: string; slug: string };
      
      const job = await this.jobService.cloneJob(id, cloneData);
      
      return reply.status(201).send({
        success: true,
        data: job,
        message: success('job.cloned'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  // Question management methods
  async createJobQuestion(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { jobId } = request.params as { jobId: string };
      const questionData = request.body as any;
      
      const question = await this.jobService.createJobQuestion(jobId, questionData);
      
      return reply.status(201).send({
        success: true,
        data: question,
        message: success('question.created'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }

  async updateJobQuestion(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { jobId, questionId } = request.params as { jobId: string; questionId: string };
      const questionData = request.body as any;
      
      const question = await this.jobService.updateJobQuestion(jobId, questionId, questionData);
      
      return reply.send({
        success: true,
        data: question,
        message: success('question.updated'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }

  async deleteJobQuestion(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { jobId, questionId } = request.params as { jobId: string; questionId: string };
      
      await this.jobService.deleteJobQuestion(jobId, questionId);
      
      return reply.send({
        success: true,
        message: success('question.deleted'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async toggleJobStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const job = await this.jobService.toggleJobStatus(id);
      
      return reply.send({
        success: true,
        data: job,
        message: job.isActive ? success('job.activated') : success('job.deactivated'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
}
