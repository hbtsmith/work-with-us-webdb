import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PositionService } from '../../services/positionService';
import { prisma } from '../../database/client';
import { cleanupTestData, generateUniqueId } from '../setup';
import { i18n } from '../../i18n/i18n';

describe('PositionService', () => {
  let positionService: PositionService;
  
  beforeEach(() => {
    // Configure i18n for tests
    i18n.setLocale('pt_BR');
    positionService = new PositionService();
  });
  
  afterEach(async () => {
    await cleanupTestData();
  });
  
  describe('createPosition', () => {
    it('should create a new position', async () => {
      // Arrange
      const positionData = {
        title: i18n.t('test.data.frontend_title'),
        level: i18n.t('test.data.position_level'),
        salaryRange: i18n.t('test.data.position_salary'),
      };
      
      // Act
      const result = await positionService.createPosition(positionData);
      
      // Assert
      expect(result).toMatchObject(positionData);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });
  });
  
  describe('getPositions', () => {
    it('should return paginated positions', async () => {
      // Arrange
      const uniqueId = generateUniqueId();
      const positions = [
        {
          title: `${i18n.t('test.data.frontend_title')} ${uniqueId}`,
          level: i18n.t('test.data.position_level'),
          salaryRange: i18n.t('test.data.position_salary'),
        },
        {
          title: `${i18n.t('test.data.backend_title')} ${uniqueId}`,
          level: i18n.t('test.data.senior_level'),
          salaryRange: 'R$ 8.000 - R$ 12.000',
        },
      ];
      
      for (const positionData of positions) {
        await prisma.position.create({ data: positionData });
      }
      
      // Act
      const result = await positionService.getPositions({
        page: 1,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'asc',
      });
      
      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.data[0].title).toBe(`${i18n.t('test.data.backend_title')} ${uniqueId}`); // Sorted by title asc
    });
    
    it('should handle pagination correctly', async () => {
      // Arrange
      const uniqueId = generateUniqueId();
      for (let i = 1; i <= 15; i++) {
        await prisma.position.create({
          data: {
            title: `Position ${i} ${uniqueId}`,
            level: i18n.t('test.data.position_level'),
            salaryRange: i18n.t('test.data.position_salary'),
          },
        });
      }
      
      // Act
      const result = await positionService.getPositions({
        page: 2,
        limit: 10,
      });
      
      // Assert
      expect(result.data).toHaveLength(5);
      expect(result.pagination.total).toBe(15);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.totalPages).toBe(2);
    });
  });
  
  describe('getPositionById', () => {
    it('should return position by id', async () => {
      // Arrange
      const position = await prisma.position.create({
        data: {
          title: i18n.t('test.data.frontend_title'),
          level: i18n.t('test.data.position_level'),
          salaryRange: i18n.t('test.data.position_salary'),
        },
      });
      
      // Act
      const result = await positionService.getPositionById(position.id);
      
      // Assert
      expect(result.id).toBe(position.id);
      expect(result.title).toBe(i18n.t('test.data.frontend_title'));
      expect(result._count).toBeDefined();
    });
    
    it('should throw error for non-existent position', async () => {
      // Act & Assert
      await expect(
        positionService.getPositionById('non-existent-id')
      ).rejects.toThrow(i18n.t('errors.position.not_found'));
    });
  });
  
  describe('updatePosition', () => {
    it('should update position when not used by jobs', async () => {
      // Arrange
      const position = await prisma.position.create({
        data: {
          title: i18n.t('test.data.frontend_title'),
          level: i18n.t('test.data.position_level'),
          salaryRange: i18n.t('test.data.position_salary'),
        },
      });
      
      // Act
      const result = await positionService.updatePosition(position.id, {
        title: 'Senior Frontend Developer',
        level: i18n.t('test.data.senior_level'),
      });
      
      // Assert
      expect(result.title).toBe('Senior Frontend Developer');
      expect(result.level).toBe(i18n.t('test.data.senior_level'));
      expect(result.salaryRange).toBe(i18n.t('test.data.position_salary')); // Unchanged
    });
    
    it('should throw error when position is used by jobs', async () => {
      // Arrange
      const position = await prisma.position.create({
        data: {
          title: i18n.t('test.data.frontend_title'),
          level: i18n.t('test.data.position_level'),
          salaryRange: i18n.t('test.data.position_salary'),
        },
      });
      
      await prisma.job.create({
        data: {
          title: i18n.t('test.data.job_title'),
          description: i18n.t('test.data.job_description'),
          slug: i18n.t('test.data.job_slug'),
          positionId: position.id,
        },
      });
      
      // Act & Assert
      await expect(
        positionService.updatePosition(position.id, {
          title: i18n.t('test.data.updated_title'),
        })
      ).rejects.toThrow(i18n.t('errors.position.in_use'));
    });
  });
  
  describe('deletePosition', () => {
    it('should delete position when not used by jobs', async () => {
      // Arrange
      const position = await prisma.position.create({
        data: {
          title: i18n.t('test.data.frontend_title'),
          level: i18n.t('test.data.position_level'),
          salaryRange: i18n.t('test.data.position_salary'),
        },
      });
      
      // Act
      const result = await positionService.deletePosition(position.id);
      
      // Assert
      expect(result.id).toBe(position.id);
      
      // Verify position is deleted
      const deletedPosition = await prisma.position.findUnique({
        where: { id: position.id },
      });
      expect(deletedPosition).toBeNull();
    });
    
    it('should throw error when position is used by jobs', async () => {
      // Arrange
      const position = await prisma.position.create({
        data: {
          title: i18n.t('test.data.frontend_title'),
          level: i18n.t('test.data.position_level'),
          salaryRange: i18n.t('test.data.position_salary'),
        },
      });
      
      await prisma.job.create({
        data: {
          title: i18n.t('test.data.job_title'),
          description: i18n.t('test.data.job_description'),
          slug: i18n.t('test.data.job_slug'),
          positionId: position.id,
        },
      });
      
      // Act & Assert
      await expect(
        positionService.deletePosition(position.id)
      ).rejects.toThrow(i18n.t('errors.position.in_use'));
    });
  });
  
  describe('getAllPositions', () => {
    it('should return all positions ordered by title', async () => {
      // Arrange
      const uniqueId = generateUniqueId();
      const positions = [
        { title: `${i18n.t('test.data.backend_title')} ${uniqueId}`, level: i18n.t('test.data.senior_level'), salaryRange: 'R$ 8.000 - R$ 12.000' },
        { title: `${i18n.t('test.data.frontend_title')} ${uniqueId}`, level: i18n.t('test.data.position_level'), salaryRange: i18n.t('test.data.position_salary') },
        { title: `DevOps Engineer ${uniqueId}`, level: i18n.t('test.data.senior_level'), salaryRange: i18n.t('test.data.senior_salary') },
      ];
      
      for (const positionData of positions) {
        await prisma.position.create({ data: positionData });
      }
      
      // Act
      const result = await positionService.getAllPositions();
      
      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].title).toBe(`${i18n.t('test.data.backend_title')} ${uniqueId}`);
      expect(result[1].title).toBe(`DevOps Engineer ${uniqueId}`);
      expect(result[2].title).toBe(`${i18n.t('test.data.frontend_title')} ${uniqueId}`);
    });
  });
});