import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '../../database/client';
import { cleanupTestData, createTestAdmin, loginAndGetToken, createTestPositions } from '../setup';
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

describe('Positions E2E Tests', () => {
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

  describe('Position HTTP End-to-End Tests', () => {
    it('should create position successfully via HTTP', async () => {
      // Arrange
      const positionData = {
        title: 'Desenvolvedor Frontend',
        level: 'Pleno',
        salaryRange: 'R$ 5.000 - R$ 8.000',
      };

      // Act - Test HTTP route end-to-end
      const response = await app.inject({
        method: 'POST',
        url: '/api/positions',
        payload: positionData,
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
      expect(body.data.level).toBe('Pleno');
      expect(body.data.salaryRange).toBe('R$ 5.000 - R$ 8.000');
    });

    it('should get positions with pagination via HTTP', async () => {
      // Arrange - Create test positions
      const positions = await createTestPositions();

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions?page=1&limit=10',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(3);
      expect(body.pagination.total).toBe(3);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(10);
    });

    it('should get positions with search via HTTP', async () => {
      // Arrange - Create test positions
      const positions = await createTestPositions();

      // Act - Test HTTP route with search
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions?search=Frontend&page=1&limit=10',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      const frontendPosition = body.data.find((p: any) => p.title.includes('Frontend'));
      expect(frontendPosition).toBeDefined();
    });

    it('should get position by id via HTTP', async () => {
      // Arrange - Create test positions
      const positions = await createTestPositions();
      const position = positions[0]; // Use Frontend position

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'GET',
        url: `/api/positions/${position.id}`,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(position.id);
      expect(body.data.title).toBe('Desenvolvedor Frontend');
      expect(body.data.level).toBe('Pleno');
      expect(body.data.salaryRange).toBe('R$ 5.000 - R$ 8.000');
    });

    it('should return 404 for non-existent position via HTTP', async () => {
      // Act - Test HTTP route with valid CUID format but non-existent ID
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions/clh1234567890123456789012',
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

    it('should update position via HTTP', async () => {
      // Arrange - Create test positions
      const positions = await createTestPositions();
      const position = positions[0]; // Use Frontend position

      const updateData = {
        title: 'Desenvolvedor Full Stack',
        level: 'Sênior',
        salaryRange: 'R$ 8.000 - R$ 12.000',
      };

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'PUT',
        url: `/api/positions/${position.id}`,
        payload: updateData,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(position.id);
      expect(body.data.title).toBe('Desenvolvedor Full Stack');
      expect(body.data.level).toBe('Sênior');
      expect(body.data.salaryRange).toBe('R$ 8.000 - R$ 12.000');
    });

    it('should return 404 when updating non-existent position via HTTP', async () => {
      // Arrange
      const updateData = {
        title: 'Desenvolvedor Full Stack',
        level: 'Sênior',
        salaryRange: 'R$ 8.000 - R$ 12.000',
      };

      // Act - Test HTTP route with valid CUID format but non-existent ID
      const response = await app.inject({
        method: 'PUT',
        url: '/api/positions/clh1234567890123456789012',
        payload: updateData,
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

    it('should delete position via HTTP', async () => {
      // Arrange - Create test positions
      const positions = await createTestPositions();
      const position = positions[0]; // Use Frontend position

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/positions/${position.id}`,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toBeDefined();

      // Verify position was deleted
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/positions/${position.id}`,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 when deleting non-existent position via HTTP', async () => {
      // Act - Test HTTP route with valid CUID format but non-existent ID
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/positions/clh1234567890123456789012',
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

    it('should get all positions via HTTP', async () => {
      // Arrange - Create test positions
      const positions = await createTestPositions();

      // Act - Test HTTP route
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions/all',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(3);
      expect(body.data[0].title).toBeDefined();
      expect(body.data[1].title).toBeDefined();
      expect(body.data[2].title).toBeDefined();
    });
  });

  describe('Position HTTP Authentication and Authorization Tests', () => {
    it('should require authentication for all position endpoints', async () => {
      // Test without token
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(undefined);
      expect(body.error).toBe(i18n.t('errors.auth.unauthorized'));
      expect(body.message).toBe(i18n.t('errors.auth.token_invalid'));
    });

    it('should reject invalid token', async () => {
      // Test with invalid token
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(undefined);
      expect(body.error).toBe(i18n.t('errors.auth.unauthorized'));
      expect(body.message).toBe(i18n.t('errors.auth.token_invalid'));
    });

    it('should accept valid token', async () => {
      // Arrange - Create test positions
      const positions = await createTestPositions();

      // Test with valid token
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
    });
  });

  describe('Position HTTP Edge Cases and Error Handling', () => {
    it('should handle empty search results via HTTP', async () => {
      // Act - Search for non-existent position via HTTP
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions?search=NonExistentPosition&page=1&limit=10',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(0);
      expect(body.pagination.total).toBe(0);
    });

    it('should handle pagination correctly via HTTP', async () => {
      // Arrange - Create multiple positions via HTTP
      const positions: any[] = [];
      for (let i = 1; i <= 5; i++) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/positions',
          payload: {
            title: `Position ${i}`,
            level: 'Pleno',
            salaryRange: 'R$ 5.000 - R$ 8.000',
          },
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        });
        expect(response.statusCode).toBe(201);
        const body = JSON.parse(response.body);
        positions.push(body.data);
      }

      // Act - Get first page via HTTP
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions?page=1&limit=2',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      expect(body.pagination.total).toBe(5);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(2);
    });

    it('should handle large page numbers gracefully via HTTP', async () => {
      // Arrange - Create one position via HTTP
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/positions',
        payload: {
          title: 'Test Position',
          level: 'Pleno',
          salaryRange: 'R$ 5.000 - R$ 8.000',
        },
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      expect(createResponse.statusCode).toBe(201);

      // Act - Request page 999 via HTTP
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions?page=999&limit=10',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(0);
      expect(body.pagination.total).toBe(1);
      expect(body.pagination.page).toBe(999);
    });

    it('should handle case-insensitive search via HTTP', async () => {
      // Arrange - Create test positions
      const positions = await createTestPositions();

      // Act - Search with different case via HTTP
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions?search=frontend&page=1&limit=10',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      const foundPosition = body.data.find((p: any) => p.title.toLowerCase().includes('frontend'));
      expect(foundPosition).toBeDefined();
    });

    it('should handle special characters in search via HTTP', async () => {
      // Arrange - Create position with special characters via HTTP
      const createResponse = await app.inject({
        method: 'POST',
        url: '/api/positions',
        payload: {
          title: 'Desenvolvedor C#/.NET',
          level: 'Pleno',
          salaryRange: 'R$ 5.000 - R$ 8.000',
        },
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      expect(createResponse.statusCode).toBe(201);

      // Act - Search with special characters via HTTP
      const response = await app.inject({
        method: 'GET',
        url: '/api/positions?search=C%23&page=1&limit=10',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      const foundPosition = body.data.find((p: any) => p.title.includes('C#'));
      expect(foundPosition).toBeDefined();
    });
  });

  describe('Position HTTP Validation and Business Rules', () => {
    it('should prevent deletion of position in use by jobs via HTTP', async () => {
      // Arrange - Create test positions
      const positions = await createTestPositions();
      const position = positions[0]; // Use Frontend position

      // Create a job that uses this position
      await prisma.job.create({
        data: {
          title: 'Vaga de Desenvolvedor',
          description: 'Descrição da vaga',
          slug: 'vaga-desenvolvedor',
          positionId: position.id,
          isActive: true,
        },
      });

      // Act - Try to delete position via HTTP
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/positions/${position.id}`,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert - Should return conflict error
      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('CONFLICT');
      expect(body.message).toBe(i18n.t('errors.position.in_use'));
    });

    it('should prevent update of position in use by jobs via HTTP', async () => {
      // Arrange - Create test positions
      const positions = await createTestPositions();
      const position = positions[0]; // Use Frontend position

      // Create a job that uses this position
      await prisma.job.create({
        data: {
          title: 'Vaga de Desenvolvedor',
          description: 'Descrição da vaga',
          slug: 'vaga-desenvolvedor',
          positionId: position.id,
          isActive: true,
        },
      });

      const updateData = {
        title: 'Desenvolvedor Full Stack',
        level: 'Sênior',
        salaryRange: 'R$ 8.000 - R$ 12.000',
      };

      // Act - Try to update position via HTTP
      const response = await app.inject({
        method: 'PUT',
        url: `/api/positions/${position.id}`,
        payload: updateData,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert - Should return conflict error
      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.error).toBe('CONFLICT');
      expect(body.message).toBe(i18n.t('errors.position.in_use'));
    });

    it('should validate required fields for position creation via HTTP', async () => {
      // Act - Try to create position without required fields
      const response = await app.inject({
        method: 'POST',
        url: '/api/positions',
        payload: {
          // Missing required fields
        },
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert - Should return validation error
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(undefined);
      expect(body.error).toBeDefined();
      expect(body.message).toBeDefined();
    });

    it('should validate position data format via HTTP', async () => {
      // Act - Try to create position with invalid data
      const response = await app.inject({
        method: 'POST',
        url: '/api/positions',
        payload: {
          title: '', // Empty title
          level: 'Invalid Level', // Invalid level
          salaryRange: 'Invalid Range', // Invalid format
        },
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      // Assert - Should return validation error
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(undefined);
      expect(body.error).toBeDefined();
      expect(body.message).toBeDefined();
    });
  });
});