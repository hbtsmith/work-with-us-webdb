import { prisma } from '@/database/client';
import { PaginationQuery } from '@/types';
import { getPaginationParams, getSortParams, calculatePagination } from '@/utils/pagination';
import { saveUploadedFile, validateFileType, validateFileSize } from '@/utils/fileUpload';
import { NotFoundError, BadRequestError } from '@/errors';
import { i18n } from '@/i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export class ApplicationService {
  async submitApplication(
    jobId: string,
    answers: Array<{ questionId: string; textValue?: string; questionOptionId?: string }>,
    resumeFile?: { buffer: Buffer; filename: string; size: number }
  ) {
    // Verify job exists and is active
    const job = await prisma.job.findUnique({
      where: { 
        id: jobId,
        isActive: true,
      },
      include: {
        questions: true,
      },
    });
    
    if (!job) {
      throw new NotFoundError(i18n.t('errors.job.not_found_or_inactive'));
    }
    
    // Validate answers against job questions
    const requiredQuestions = job.questions.filter(q => q.isRequired);
    const answeredQuestionIds = answers.map(a => a.questionId);
    
    for (const question of requiredQuestions) {
      if (!answeredQuestionIds.includes(question.id)) {
        throw new BadRequestError(i18n.t('errors.application.required_question', { question: question.label }));
      }
    }
    
    // Validate that answers have either textValue or questionOptionId
    for (const answer of answers) {
      if (!answer.textValue && !answer.questionOptionId) {
        throw new BadRequestError(i18n.t('errors.application.invalid_answer_format'));
      }
    }
    
    // Handle resume upload if required
    let resumeUrl: string | null = null;
    
    if (job.requiresResume) {
      if (!resumeFile) {
        throw new BadRequestError(i18n.t('errors.application.resume_required'));
      }
      
      // Validate file type (PDF only)
      if (!validateFileType(resumeFile.filename, ['.pdf'])) {
        throw new BadRequestError(i18n.t('errors.general.invalid_file_type'));
      }
      
      // Validate file size (5MB max)
      if (!validateFileSize(resumeFile.size, 5 * 1024 * 1024)) {
        throw new BadRequestError(i18n.t('errors.general.file_too_large'));
      }
      
      // Save file
      const uploadDir = process.env['UPLOAD_DIR'] || './uploads';
      resumeUrl = await saveUploadedFile(resumeFile.buffer, resumeFile.filename, uploadDir);
    }
    
    // Create application with answers
    return await prisma.application.create({
      data: {
        jobId,
        resumeUrl,
        answers: {
          create: answers.map(answer => ({
            questionId: answer.questionId,
            textValue: answer.textValue || null,
            questionOptionId: answer.questionOptionId || null,
          })),
        },
      },
      include: {
        job: {
          include: {
            position: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }
  
  async getApplications(query: PaginationQuery, jobId?: string) {
    const { page, limit, skip } = getPaginationParams(query);
    const { sortBy, sortOrder } = getSortParams(query, 'createdAt');
    
    const whereClause = jobId ? { jobId } : {};
    
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          job: {
            include: {
              position: true,
            },
          },
          answers: {
            include: {
              question: true,
            },
          },
        },
      }),
      prisma.application.count({ where: whereClause }),
    ]);
    
    return {
      data: applications,
      pagination: calculatePagination(page, limit, total),
    };
  }
  
  async getApplicationById(id: string) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            position: true,
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
        answers: {
          include: {
            question: true,
            questionOption: true,
          },
          orderBy: {
            question: {
              order: 'asc',
            },
          },
        },
      },
    });
    
    if (!application) {
      throw new NotFoundError(i18n.t('errors.application.not_found'));
    }
    
    return application;
  }
  
  async getApplicationsByJob(jobId: string, query: PaginationQuery) {
    return await this.getApplications(query, jobId);
  }
  
  async deleteApplication(id: string) {
    // Check if application exists
    const existingApplication = await prisma.application.findUnique({
      where: { id },
    });
    
    if (!existingApplication) {
      throw new NotFoundError(i18n.t('errors.application.not_found'));
    }
    
    return await prisma.application.delete({
      where: { id },
    });
  }
  
  async getApplicationStats() {
    const [totalApplications, applicationsByJob, recentApplications] = await Promise.all([
      prisma.application.count(),
      prisma.job.findMany({
        include: {
          _count: {
            select: { applications: true },
          },
        },
        orderBy: {
          applications: {
            _count: 'desc',
          },
        },
        take: 10,
      }),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      }),
    ]);
    
    return {
      totalApplications,
      applicationsByJob,
      recentApplications,
    };
  }
}