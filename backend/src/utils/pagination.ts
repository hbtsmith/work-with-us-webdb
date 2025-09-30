import { PaginationQuery, PaginatedResponse } from '@/types';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginatedResponse<never>['pagination'] {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
  };
}

export function getPaginationParams(query: PaginationQuery) {
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

export function getSortParams(query: PaginationQuery, defaultSortBy: string) {
  const sortBy = query.sortBy || defaultSortBy;
  const sortOrder = query.sortOrder || 'desc';
  
  return { sortBy, sortOrder };
}