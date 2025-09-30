import { prisma } from '@/database/client';
import { CreatePositionData, PaginationQuery } from '@/types';
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

export class PositionService {
  async createPosition(positionData: CreatePositionData) {
    return await prisma.position.create({
      data: positionData,
    });
  }
  
  async getPositions(query: PaginationQuery) {
    const { page, limit, skip } = getPaginationParams(query);
    const { sortBy, sortOrder } = getSortParams(query, 'createdAt');
    
    const [positions, total] = await Promise.all([
      prisma.position.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { jobs: true },
          },
        },
      }),
      prisma.position.count(),
    ]);
    
    return {
      data: positions,
      pagination: calculatePagination(page, limit, total),
    };
  }
  
  async getPositionById(id: string) {
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        _count: {
          select: { jobs: true },
        },
      },
    });
    
    if (!position) {
      throw new NotFoundError(i18n.t('errors.position.not_found'));
    }
    
    return position;
  }
  
  async updatePosition(id: string, updateData: Partial<CreatePositionData>) {
    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id },
    });
    
    if (!existingPosition) {
      throw new NotFoundError(i18n.t('errors.position.not_found'));
    }
    
    // Check if position is being used by any job
    const jobCount = await prisma.job.count({
      where: { positionId: id },
    });
    
    if (jobCount > 0) {
      throw new ConflictError(i18n.t('errors.position.in_use'));
    }
    
    return await prisma.position.update({
      where: { id },
      data: updateData,
    });
  }
  
  async deletePosition(id: string) {
    // Check if position exists
    const existingPosition = await prisma.position.findUnique({
      where: { id },
    });
    
    if (!existingPosition) {
      throw new NotFoundError(i18n.t('errors.position.not_found'));
    }
    
    // Check if position is being used by any job
    const jobCount = await prisma.job.count({
      where: { positionId: id },
    });
    
    if (jobCount > 0) {
      throw new ConflictError(i18n.t('errors.position.in_use'));
    }
    
    return await prisma.position.delete({
      where: { id },
    });
  }
  
  async getAllPositions() {
    return await prisma.position.findMany({
      orderBy: { title: 'asc' },
      select: {
        id: true,
        title: true,
        level: true,
        salaryRange: true,
      },
    });
  }
}
