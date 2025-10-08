import { prisma } from '@/database/client';
import { CreateJobData, PaginationQuery } from '@/types';
import { getPaginationParams, getSortParams, calculatePagination } from '@/utils/pagination';
import { NotFoundError, ConflictError } from '@/errors';
import { i18n } from '@/i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export class JobService {
  async createJob(jobData: CreateJobData) {
    return await prisma.job.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        slug: jobData.slug,
        requiresResume: jobData.requiresResume,
        positionId: jobData.positionId,
      },
      include: {
        position: true,
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { applications: true },
        },
      },
    });
  }
  
  async getJobs(query: PaginationQuery) {
    const { page, limit, skip } = getPaginationParams(query);
    const { sortBy, sortOrder } = getSortParams(query, 'createdAt');
    
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          position: true,
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count(),
    ]);
    
    return {
      data: jobs,
      pagination: calculatePagination(page, limit, total),
    };
  }
  
  async getJobById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        position: true,
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { applications: true },
        },
      },
    });
    
    if (!job) {
      throw new NotFoundError(i18n.t('errors.job.not_found'));
    }
    
    return job;
  }
  
  async getJobBySlug(slug: string) {
    const job = await prisma.job.findUnique({
      where: { 
        slug,
        isActive: true,
      },
      include: {
        position: true,
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });
    
    if (!job) {
      throw new NotFoundError(i18n.t('errors.job.not_found_or_inactive'));
    }
    
    return job;
  }
  
  async updateJob(id: string, updateData: Partial<CreateJobData>) {
    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id },
    });
    
    if (!existingJob) {
      throw new NotFoundError(i18n.t('errors.job.not_found'));
    }
    
    // Check if job has applications
    const applicationCount = await prisma.application.count({
      where: { jobId: id },
    });
    
    if (applicationCount > 0) {
      throw new ConflictError(i18n.t('errors.job.has_applications'));
    }
    
    const updateFields: any = {
      title: updateData.title,
      description: updateData.description,
      slug: updateData.slug,
      requiresResume: updateData.requiresResume,
      isActive: updateData.isActive,
      positionId: updateData.positionId,
    };
    
    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });
    
    return await prisma.job.update({
      where: { id },
      data: updateFields,
      include: {
        position: true,
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }
  
  async deleteJob(id: string) {
    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id },
    });
    
    if (!existingJob) {
      throw new NotFoundError(i18n.t('errors.job.not_found'));
    }
    
    // Check if job has applications
    const applicationCount = await prisma.application.count({
      where: { jobId: id },
    });
    
    if (applicationCount > 0) {
      throw new ConflictError(i18n.t('errors.job.has_applications'));
    }
    
    return await prisma.job.delete({
      where: { id },
    });
  }
  
  async cloneJob(id: string, newJobData: { title: string; slug: string }) {
    const originalJob = await this.getJobById(id);
    
    return await prisma.job.create({
      data: {
        title: newJobData.title,
        description: originalJob.description,
        slug: newJobData.slug,
        requiresResume: originalJob.requiresResume,
        positionId: originalJob.positionId,
        questions: {
          create: originalJob.questions.map(question => ({
            label: question.label,
            type: question.type,
            isRequired: question.isRequired,
            order: question.order,
          })),
        },
      },
      include: {
        position: true,
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  // Question management methods
  async createJobQuestion(jobId: string, questionData: any) {
    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundError(i18n.t('errors.job.not_found'));
    }

    // Create question with options if provided
    const questionDataToCreate: any = {
      jobId,
      label: questionData.label,
      type: questionData.type,
      isRequired: questionData.isRequired,
      order: questionData.order,
    };

    if (questionData.options) {
      questionDataToCreate.options = {
        create: questionData.options.map((option: any, index: number) => ({
          label: option.label,
          orderIndex: index,
        }))
      };
    }

    const question = await prisma.question.create({
      data: questionDataToCreate,
      include: {
        job: true,
        options: true,
      },
    });

    return question;
  }

  async updateJobQuestion(jobId: string, questionId: string, questionData: any) {
    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { 
        id: questionId,
        jobId: jobId,
      },
    });
    
    if (!existingQuestion) {
      throw new NotFoundError(i18n.t('errors.question.not_found'));
    }
    
    // Check if question has answers
    const answerCount = await prisma.answer.count({
      where: { questionId },
    });
    
    if (answerCount > 0) {
      throw new ConflictError(i18n.t('errors.question.has_answers'));
    }

    return await prisma.question.update({
      where: { 
        id: questionId,
        jobId: jobId,
      },
      data: {
        label: questionData.label,
        type: questionData.type,
        isRequired: questionData.isRequired,
        order: questionData.order,
      },
      include: {
        job: true,
      },
    });
  }

  async deleteJobQuestion(jobId: string, questionId: string) {
    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({
      where: { 
        id: questionId,
        jobId: jobId,
      },
    });
    
    if (!existingQuestion) {
      throw new NotFoundError(i18n.t('errors.question.not_found'));
    }
    
    // Check if question has answers
    const answerCount = await prisma.answer.count({
      where: { questionId },
    });
    
    if (answerCount > 0) {
      throw new ConflictError(i18n.t('errors.question.has_answers'));
    }

    return await prisma.question.delete({
      where: { 
        id: questionId,
        jobId: jobId,
      },
    });
  }
  
  async toggleJobStatus(id: string) {
    const job = await prisma.job.findUnique({
      where: { id },
    });
    
    if (!job) {
      throw new NotFoundError(i18n.t('errors.job.not_found'));
    }
    
    return await prisma.job.update({
      where: { id },
      data: { isActive: !job.isActive },
    });
  }
}
