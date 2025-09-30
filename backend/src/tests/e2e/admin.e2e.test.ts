import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdminService } from '../../services/adminService';
import { ApplicationService } from '../../services/applicationService';
import { JobService } from '../../services/jobService';
import { PositionService } from '../../services/positionService';
import { prisma } from '../../database/client';
import { cleanupTestData, createTestPositions } from '../setup';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

describe('Admin E2E Tests', () => {
  let adminService: AdminService;
  let applicationService: ApplicationService;
  let jobService: JobService;
  let positionService: PositionService;
  let positionId: string;
  let jobId: string;
  let applicationId: string;

  beforeEach(async () => {
    adminService = new AdminService();
    applicationService = new ApplicationService();
    jobService = new JobService();
    positionService = new PositionService();
    await cleanupTestData();
    
    // Create test positions
    const positions = await createTestPositions();
    positionId = positions[0].id; // Use Frontend position

    // Create test job
    const job = await jobService.createJob({
      title: 'Desenvolvedor Frontend',
      description: 'Vaga para desenvolvedor frontend com React',
      slug: 'desenvolvedor-frontend',
      positionId: positionId,
      isActive: true,
    });
    jobId = job.id;
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Dashboard Data Flow', () => {
    it('should get dashboard data successfully', async () => {
      // Arrange - Create test applications
      const application1 = await applicationService.submitApplication(jobId, [
        {
          questionId: 'question-1',
          textValue: 'João Silva',
        },
        {
          questionId: 'question-2',
          textValue: 'Tenho 3 anos de experiência com React.',
        },
      ]);

      const application2 = await applicationService.submitApplication(jobId, [
        {
          questionId: 'question-1',
          textValue: 'Maria Santos',
        },
        {
          questionId: 'question-2',
          textValue: 'Tenho 5 anos de experiência com React.',
        },
      ]);

      // Act
      const dashboardData = await adminService.getDashboardData();

      // Assert
      expect(dashboardData.applications).toHaveLength(2);
      expect(dashboardData.recentJobs).toHaveLength(1);
      expect(dashboardData.totalPositions).toBe(1);
      expect(dashboardData.applications[0].id).toBeDefined();
      expect(dashboardData.recentJobs[0].id).toBe(jobId);
    });

    it('should handle empty dashboard data', async () => {
      // Act
      const dashboardData = await adminService.getDashboardData();

      // Assert
      expect(dashboardData.applications).toHaveLength(0);
      expect(dashboardData.recentJobs).toHaveLength(0);
      expect(dashboardData.totalPositions).toBe(1); // Position was created in beforeEach
    });

    it('should get dashboard data with multiple jobs', async () => {
      // Arrange - Create another job
      const anotherJob = await jobService.createJob({
        title: 'Desenvolvedor Backend',
        description: 'Vaga para desenvolvedor backend com Node.js',
        slug: 'desenvolvedor-backend',
        positionId: positionId,
        isActive: true,
      });

      // Create applications for both jobs
      await applicationService.submitApplication(jobId, [
        {
          questionId: 'question-1',
          textValue: 'João Silva',
        },
      ]);

      await applicationService.submitApplication(anotherJob.id, [
        {
          questionId: 'question-1',
          textValue: 'Maria Santos',
        },
      ]);

      // Act
      const dashboardData = await adminService.getDashboardData();

      // Assert
      expect(dashboardData.applications).toHaveLength(2);
      expect(dashboardData.recentJobs).toHaveLength(2);
      expect(dashboardData.totalPositions).toBe(1);
    });
  });

  describe('Application Statistics Flow', () => {
    beforeEach(async () => {
      // Create test applications
      const application1 = await applicationService.submitApplication(jobId, [
        {
          questionId: 'question-1',
          textValue: 'João Silva',
        },
      ]);
      applicationId = application1.id;

      const application2 = await applicationService.submitApplication(jobId, [
        {
          questionId: 'question-1',
          textValue: 'Maria Santos',
        },
      ]);
    });

    it('should get application statistics successfully', async () => {
      // Act
      const stats = await adminService.getApplicationStats();

      // Assert
      expect(stats.totalApplications).toBe(2);
      expect(stats.applicationsByJob).toHaveLength(1);
      expect(stats.applicationsByJob[0].jobId).toBe(jobId);
      expect(stats.applicationsByJob[0].count).toBe(2);
    });

    it('should get application statistics with date range', async () => {
      // Arrange - Create application with specific date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await prisma.application.create({
        data: {
          jobId: jobId,
          applicantName: 'Pedro Costa',
          applicantEmail: 'pedro@test.com',
          applicantPhone: '11999999999',
          createdAt: yesterday,
        },
      });

      // Act
      const stats = await adminService.getApplicationStats();

      // Assert
      expect(stats.totalApplications).toBe(3);
      expect(stats.applicationsByJob).toHaveLength(1);
      expect(stats.applicationsByJob[0].count).toBe(3);
    });

    it('should handle empty statistics', async () => {
      // Arrange - Clean up all applications
      await prisma.application.deleteMany();

      // Act
      const stats = await adminService.getApplicationStats();

      // Assert
      expect(stats.totalApplications).toBe(0);
      expect(stats.applicationsByJob).toHaveLength(0);
    });
  });

  describe('Dashboard Edge Cases', () => {
    it('should handle dashboard with inactive jobs', async () => {
      // Arrange - Create inactive job
      const inactiveJob = await jobService.createJob({
        title: 'Desenvolvedor Backend',
        description: 'Vaga para desenvolvedor backend com Node.js',
        slug: 'desenvolvedor-backend',
        positionId: positionId,
        isActive: false,
      });

      // Create application for inactive job
      await applicationService.submitApplication(inactiveJob.id, [
        {
          questionId: 'question-1',
          textValue: 'João Silva',
        },
      ]);

      // Act
      const dashboardData = await adminService.getDashboardData();

      // Assert
      expect(dashboardData.applications).toHaveLength(1);
      expect(dashboardData.recentJobs).toHaveLength(1); // Only active job
      expect(dashboardData.recentJobs[0].isActive).toBe(true);
    });

    it('should handle dashboard with multiple positions', async () => {
      // Arrange - Create another position
      const anotherPosition = await positionService.createPosition({
        title: 'Desenvolvedor Backend',
        level: 'Sênior',
        salaryRange: 'R$ 8.000 - R$ 12.000',
      });

      // Create job for new position
      await jobService.createJob({
        title: 'Desenvolvedor Backend',
        description: 'Vaga para desenvolvedor backend com Node.js',
        slug: 'desenvolvedor-backend',
        positionId: anotherPosition.id,
        isActive: true,
      });

      // Act
      const dashboardData = await adminService.getDashboardData();

      // Assert
      expect(dashboardData.totalPositions).toBe(2);
      expect(dashboardData.recentJobs).toHaveLength(2);
    });

    it('should handle dashboard with large number of applications', async () => {
      // Arrange - Create many applications
      const applicationPromises = [];
      for (let i = 1; i <= 20; i++) {
        applicationPromises.push(
          applicationService.submitApplication(jobId, [
            {
              questionId: 'question-1',
              textValue: `Applicant ${i}`,
            },
          ])
        );
      }
      await Promise.all(applicationPromises);

      // Act
      const dashboardData = await adminService.getDashboardData();

      // Assert
      expect(dashboardData.applications).toHaveLength(20);
      expect(dashboardData.recentJobs).toHaveLength(1);
    });
  });

  describe('Application Statistics Edge Cases', () => {
    it('should handle statistics with multiple jobs', async () => {
      // Arrange - Create another job
      const anotherJob = await jobService.createJob({
        title: 'Desenvolvedor Backend',
        description: 'Vaga para desenvolvedor backend com Node.js',
        slug: 'desenvolvedor-backend',
        positionId: positionId,
        isActive: true,
      });

      // Create applications for both jobs
      await applicationService.submitApplication(jobId, [
        {
          questionId: 'question-1',
          textValue: 'João Silva',
        },
      ]);

      await applicationService.submitApplication(anotherJob.id, [
        {
          questionId: 'question-1',
          textValue: 'Maria Santos',
        },
      ]);

      // Act
      const stats = await adminService.getApplicationStats();

      // Assert
      expect(stats.totalApplications).toBe(2);
      expect(stats.applicationsByJob).toHaveLength(2);
      expect(stats.applicationsByJob[0].count).toBe(1);
      expect(stats.applicationsByJob[1].count).toBe(1);
    });

    it('should handle statistics with applications from different time periods', async () => {
      // Arrange - Create applications with different dates
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      // Create applications
      await applicationService.submitApplication(jobId, [
        {
          questionId: 'question-1',
          textValue: 'João Silva',
        },
      ]);

      // Create application with yesterday's date
      await prisma.application.create({
        data: {
          jobId: jobId,
          applicantName: 'Maria Santos',
          applicantEmail: 'maria@test.com',
          applicantPhone: '11999999999',
          createdAt: yesterday,
        },
      });

      // Create application with last week's date
      await prisma.application.create({
        data: {
          jobId: jobId,
          applicantName: 'Pedro Costa',
          applicantEmail: 'pedro@test.com',
          applicantPhone: '11999999999',
          createdAt: lastWeek,
        },
      });

      // Act
      const stats = await adminService.getApplicationStats();

      // Assert
      expect(stats.totalApplications).toBe(3);
      expect(stats.applicationsByJob).toHaveLength(1);
      expect(stats.applicationsByJob[0].count).toBe(3);
    });
  });
});
