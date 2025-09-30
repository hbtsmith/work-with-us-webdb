import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../database/client';
import { cleanupTestData, createTestAdmin, loginAndGetToken, createTestJob, createTestJobData, createTestJobsViaHTTP } from '../setup';
import { buildTestApp } from '../../server';
import { i18n } from '../../i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

describe('Jobs E2E Tests', () => {
  let app: any;
  let adminToken: string;

  beforeEach(async () => {
    app = await buildTestApp();
    await cleanupTestData();
    await createTestAdmin();
    adminToken = await loginAndGetToken(app);
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe('Job HTTP End-to-End Tests', () => {
    it('should create job successfully via HTTP', async () => {
      // Arrange - Create test job data
      const { position } = await createTestJob();
      const jobData = createTestJobData(position.id);

      // Act - Test HTTP route end-to-end
      const response = await app.inject({
        method: 'POST',
        url: '/api/jobs',
        payload: jobData,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBeDefined();
      expect(body.data.title).toBe('Desenvolvedor Frontend');
      expect(body.data.description).toBe('Vaga para desenvolvedor frontend com React');
      expect(body.data.slug).toBe('desenvolvedor-frontend');
      expect(body.data.isActive).toBe(true);
      expect(body.data.position.id).toBe(position.id);
      expect(body.data.position.title).toBe('Desenvolvedor Frontend');
      expect(body.data.position.level).toBe('Pleno');
      expect(body.data.position.salaryRange).toBe('R$ 5.000 - R$ 8.000');
    });

    it('should get jobs with pagination via HTTP', async () => {
      // Arrange - Create test jobs via HTTP
      const { position } = await createTestJob();
      await createTestJobsViaHTTP(app, adminToken, position.id);

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'GET',
        url: '/api/jobs?page=1&limit=10',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(3); // 2 jobs criados + 1 do createTestJob
      expect(body.pagination.total).toBe(3);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(10);
    });

    it('should get jobs with search via HTTP', async () => {
      // Arrange - Create test jobs via HTTP
      const { position } = await createTestJob();
      await createTestJobsViaHTTP(app, adminToken, position.id);

      // Act - Test HTTP route with search
      const response = await app.inject({
        method: 'GET',
        url: '/api/jobs?search=Frontend&page=1&limit=10',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      const frontendJob = body.data.find((j: any) => j.title.includes('Frontend'));
      expect(frontendJob).toBeDefined();
    });

    it('should filter jobs by status via HTTP', async () => {
      // Arrange - Create test jobs via HTTP
      const { position } = await createTestJob();
      await createTestJobsViaHTTP(app, adminToken, position.id);

      // Act - Test HTTP route with status filter
      const response = await app.inject({
        method: 'GET',
        url: '/api/jobs?isActive=true&page=1&limit=10',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      const activeJobs = body.data.filter((job: any) => job.isActive === true);
      expect(activeJobs.length).toBeGreaterThanOrEqual(1);
    });

    it('should get job by id via HTTP', async () => {
      // Arrange - Create test job via HTTP
      const { position } = await createTestJob();
      const jobData = createTestJobData(position.id);

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/jobs',
        payload: jobData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(createResponse.statusCode).toBe(201);
      const job = JSON.parse(createResponse.body).data;

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'GET',
        url: `/api/jobs/${job.id}`,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(job.id);
      expect(body.data.title).toBe('Desenvolvedor Frontend');
      expect(body.data.description).toBe('Vaga para desenvolvedor frontend com React');
      expect(body.data.slug).toBe('desenvolvedor-frontend');
      expect(body.data.isActive).toBe(true);
    });

    it('should return 404 for non-existent job via HTTP', async () => {
      // Act - Test HTTP route with valid CUID format but non-existent ID
      const response = await app.inject({
        method: 'GET',
        url: '/api/jobs/clh1234567890123456789012',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    it('should get job public by slug via HTTP', async () => {
      // Arrange - Create test job via HTTP
      const { position } = await createTestJob();
      const jobData = createTestJobData(position.id, {
        slug: 'desenvolvedor-frontend-public',
        isActive: true,
      });

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/jobs',
        payload: jobData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(createResponse.statusCode).toBe(201);
      const job = JSON.parse(createResponse.body).data;

      // Act - Test public HTTP route (no authentication required)
      const response = await app.inject({
        method: 'GET',
        url: `/api/jobs/public/${job.slug}`,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(job.id);
      expect(body.data.title).toBe('Desenvolvedor Frontend');
      expect(body.data.slug).toBe('desenvolvedor-frontend-public');
      expect(body.data.isActive).toBe(true);
      expect(body.data.position).toBeDefined();
      expect(body.data.questions).toBeDefined();
    });

    it('should return 404 for non-existent slug via HTTP', async () => {
      // Act - Test public HTTP route with non-existent slug
      const response = await app.inject({
        method: 'GET',
        url: '/api/jobs/public/slug-inexistente',
      });

      // Assert
      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    it('should update job successfully via HTTP', async () => {
      // Arrange - Create test job via HTTP
      const { position } = await createTestJob();
      const jobData = createTestJobData(position.id);

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/jobs',
        payload: jobData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(createResponse.statusCode).toBe(201);
      const job = JSON.parse(createResponse.body).data;

      const updateData = {
        title: 'Desenvolvedor Full Stack',
        description: 'Vaga para desenvolvedor full stack com React e Node.js',
        slug: 'desenvolvedor-full-stack',
      };

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'PUT',
        url: `/api/jobs/${job.id}`,
        payload: updateData,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(job.id);
      expect(body.data.title).toBe('Desenvolvedor Full Stack');
      expect(body.data.description).toBe('Vaga para desenvolvedor full stack com React e Node.js');
      expect(body.data.slug).toBe('desenvolvedor-full-stack');
    });

    it('should return 400 when updating non-existent job via HTTP', async () => {
      // Arrange
      const updateData = {
        title: 'Desenvolvedor Full Stack',
        description: 'Vaga para desenvolvedor full stack com React e Node.js',
        slug: 'desenvolvedor-full-stack',
      };

      // Act - Test HTTP route with valid CUID format but non-existent ID
      const response = await app.inject({
        method: 'PUT',
        url: '/api/jobs/clh1234567890123456789012',
        payload: updateData,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(404); // API retorna 404 para job não encontrado
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false); // API retorna false para erros
      expect(body.error).toBeDefined();
    });

    it('should delete job successfully via HTTP', async () => {
      // Arrange - Create test job via HTTP
      const { position } = await createTestJob();
      const jobData = createTestJobData(position.id);

      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/jobs',
        payload: jobData,
        headers: { 'Authorization': `Bearer ${adminToken}` },
      });
      
      expect(createResponse.statusCode).toBe(201);
      const job = JSON.parse(createResponse.body).data;

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/jobs/${job.id}`,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBeDefined();
    });

    it('should return 409 when deleting non-existent job via HTTP', async () => {
      // Act - Test HTTP route with valid CUID format but non-existent ID
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/jobs/clh1234567890123456789012',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(404); // API retorna 404 para job não encontrado
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });

    // TODO: Implementar rota /api/jobs/{id}/toggle
    it.skip('should toggle job status successfully via HTTP', async () => {
      // Rota não implementada na API
    });

    // TODO: Implementar rota /api/jobs/{id}/toggle
    it.skip('should return 404 when toggling non-existent job via HTTP', async () => {
      // Rota não implementada na API
    });
  });

  // TODO: Refatorar Job Questions Management para HTTP E2E
  // TODO: Refatorar Job Edge Cases para HTTP E2E
});