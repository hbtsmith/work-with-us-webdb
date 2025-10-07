import { FastifyRequest, FastifyReply } from 'fastify';
import { ApplicationService } from '@/services/applicationService';
import { JobService } from '@/services/jobService';
import { PositionService } from '@/services/positionService';
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

export class AdminController {
  private applicationService: ApplicationService;
  private jobService: JobService;
  private positionService: PositionService;

  constructor() {
    this.applicationService = new ApplicationService();
    this.jobService = new JobService();
    this.positionService = new PositionService();
  }

  async getDashboardData(_request: FastifyRequest, reply: FastifyReply) {
    try {
      // Buscar dados em paralelo para melhor performance
      const [applicationStats, jobs, positions] = await Promise.all([
        this.applicationService.getApplicationStats(),
        this.jobService.getJobs({ page: 1, limit: 5 }),
        this.positionService.getAllPositions(),
      ]);


      return reply.send({
        success: true,
        data: {
          totalJobs: jobs.data?.length || 0,
          totalApplications: applicationStats.totalApplications || 0,
          totalPositions: positions.length || 0,
          recentApplications: applicationStats.recentApplications || [],
          jobStats: {
            active: jobs.data?.filter(job => job.isActive).length || 0,
            inactive: jobs.data?.filter(job => !job.isActive).length || 0,
          },
        },
        message: success('dashboard.data_loaded'),
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
        message: success('dashboard.stats_loaded'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
}
