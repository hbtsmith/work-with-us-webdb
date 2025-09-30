import { FastifyRequest, FastifyReply } from 'fastify';
import { ApplicationService } from '@/services/applicationService';
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

export class ApplicationController {
  private applicationService: ApplicationService;
  private jobService: JobService;
  
  constructor(
    applicationService?: ApplicationService,
    jobService?: JobService
  ) {
    this.applicationService = applicationService || new ApplicationService();
    this.jobService = jobService || new JobService();
  }
  
  async submitApplication(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { slug } = request.params as { slug: string };
      
      // Get job by slug first
      const job = await this.jobService.getJobBySlug(slug);
      
      // Handle multipart/form-data
      let answers: any;
      let resumeFile: any = null;
      
      if (request.isMultipart()) {
        // Process multipart request (production)
        const parts = request.parts();
        const fields: any = {};
        
        for await (const part of parts) {
          if (part.type === 'field') {
            fields[part.fieldname] = part.value;
          } else if (part.type === 'file' && part.fieldname === 'resume') {
            resumeFile = {
              buffer: await part.toBuffer(),
              filename: part.filename,
              size: part.file.bytesRead,
            };
          }
        }
        
        answers = JSON.parse(fields.answers);
      } else {
        // Handle JSON request (testing only)
        const { answers: bodyAnswers, resumeData } = request.body as any;
        answers = bodyAnswers;
        
        if (job.requiresResume && resumeData) {
          // Generate unique filename for testing
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 8);
          resumeFile = {
            buffer: Buffer.from(resumeData),
            filename: `test-resume-${timestamp}-${randomId}.pdf`,
            size: resumeData.length,
          };
        }
      }
      
      // TODO: Verify reCAPTCHA token
      // For now, we'll skip reCAPTCHA verification
      // In production, you should verify the token with Google's API
      
      // Map answers to the expected format
      const mappedAnswers = answers.map((answer: any) => ({
        questionId: answer.questionId,
        textValue: answer.value,
        questionOptionId: answer.questionOptionId,
      }));

      const application = await this.applicationService.submitApplication(
        job.id,
        mappedAnswers,
        resumeFile
      );
      
      return reply.status(201).send({
        success: true,
        data: {
          id: application.id,
          jobId: application.jobId,
          submittedAt: application.createdAt,
          answers: (application as any).answers?.map((answer: any) => ({
            questionId: answer.questionId,
            textValue: answer.textValue,
            questionOptionId: answer.questionOptionId,
          })) || [],
        },
        message: success('application.submitted'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getApplications(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as PaginationQuery;
      const result = await this.applicationService.getApplications(query);
      
      return reply.send({
        success: true,
        ...result,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getApplicationById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const application = await this.applicationService.getApplicationById(id);
      
      return reply.send({
        success: true,
        data: application,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getApplicationsByJob(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { jobId } = request.params as { jobId: string };
      const query = request.query as PaginationQuery;
      
      const result = await this.applicationService.getApplicationsByJob(jobId, query);
      
      return reply.send({
        success: true,
        ...result,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async deleteApplication(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      await this.applicationService.deleteApplication(id);
      
      return reply.send({
        success: true,
        message: success('application.deleted'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getApplicationStats(_request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await this.applicationService.getApplicationStats();
      
      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
}
