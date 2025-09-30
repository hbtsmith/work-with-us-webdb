import { describe, it, expect } from 'vitest';
import { calculatePagination, getPaginationParams, getSortParams } from '../../utils/pagination';

describe('Pagination Utils', () => {
  describe('calculatePagination', () => {
    it('should calculate pagination for first page', () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const total = 25;
      
      // Act
      const result = calculatePagination(page, limit, total);
      
      // Assert
      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it('should calculate pagination for middle page', () => {
      // Arrange
      const page = 2;
      const limit = 5;
      const total = 12;
      
      // Act
      const result = calculatePagination(page, limit, total);
      
      // Assert
      expect(result).toEqual({
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3,
      });
    });

    it('should calculate pagination for last page', () => {
      // Arrange
      const page = 3;
      const limit = 5;
      const total = 12;
      
      // Act
      const result = calculatePagination(page, limit, total);
      
      // Assert
      expect(result).toEqual({
        page: 3,
        limit: 5,
        total: 12,
        totalPages: 3,
      });
    });

    it('should handle empty results', () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const total = 0;
      
      // Act
      const result = calculatePagination(page, limit, total);
      
      // Assert
      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it('should handle exact page division', () => {
      // Arrange
      const page = 2;
      const limit = 5;
      const total = 10;
      
      // Act
      const result = calculatePagination(page, limit, total);
      
      // Assert
      expect(result).toEqual({
        page: 2,
        limit: 5,
        total: 10,
        totalPages: 2,
      });
    });

    it('should handle large numbers', () => {
      // Arrange
      const page = 50;
      const limit = 100;
      const total = 5000;
      
      // Act
      const result = calculatePagination(page, limit, total);
      
      // Assert
      expect(result).toEqual({
        page: 50,
        limit: 100,
        total: 5000,
        totalPages: 50,
      });
    });
  });

  describe('getPaginationParams', () => {
    it('should return default values when query is empty', () => {
      // Arrange
      const query = {};
      
      // Act
      const result = getPaginationParams(query);
      
      // Assert
      expect(result).toEqual({
        page: 1,
        limit: 10,
        skip: 0,
      });
    });

    it('should use provided page and limit', () => {
      // Arrange
      const query = { page: 3, limit: 20 };
      
      // Act
      const result = getPaginationParams(query);
      
      // Assert
      expect(result).toEqual({
        page: 3,
        limit: 20,
        skip: 40, // (3 - 1) * 20
      });
    });

    it('should calculate skip correctly for different pages', () => {
      // Arrange
      const testCases = [
        { query: { page: 1, limit: 10 }, expectedSkip: 0 },
        { query: { page: 2, limit: 10 }, expectedSkip: 10 },
        { query: { page: 3, limit: 5 }, expectedSkip: 10 },
        { query: { page: 5, limit: 20 }, expectedSkip: 80 },
      ];
      
      // Act & Assert
      testCases.forEach(({ query, expectedSkip }) => {
        const result = getPaginationParams(query);
        expect(result.skip).toBe(expectedSkip);
      });
    });

    it('should handle partial query parameters', () => {
      // Arrange
      const queryOnlyPage = { page: 3 };
      const queryOnlyLimit = { limit: 25 };
      
      // Act
      const resultPage = getPaginationParams(queryOnlyPage);
      const resultLimit = getPaginationParams(queryOnlyLimit);
      
      // Assert
      expect(resultPage).toEqual({
        page: 3,
        limit: 10,
        skip: 20,
      });
      
      expect(resultLimit).toEqual({
        page: 1,
        limit: 25,
        skip: 0,
      });
    });
  });

  describe('getSortParams', () => {
    it('should return default values when query is empty', () => {
      // Arrange
      const query = {};
      const defaultSortBy = 'createdAt';
      
      // Act
      const result = getSortParams(query, defaultSortBy);
      
      // Assert
      expect(result).toEqual({
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    });

    it('should use provided sort parameters', () => {
      // Arrange
      const query = { sortBy: 'title', sortOrder: 'asc' };
      const defaultSortBy = 'createdAt';
      
      // Act
      const result = getSortParams(query, defaultSortBy);
      
      // Assert
      expect(result).toEqual({
        sortBy: 'title',
        sortOrder: 'asc',
      });
    });

    it('should handle partial sort parameters', () => {
      // Arrange
      const queryOnlySortBy = { sortBy: 'name' };
      const queryOnlySortOrder = { sortOrder: 'asc' };
      const defaultSortBy = 'createdAt';
      
      // Act
      const resultSortBy = getSortParams(queryOnlySortBy, defaultSortBy);
      const resultSortOrder = getSortParams(queryOnlySortOrder, defaultSortBy);
      
      // Assert
      expect(resultSortBy).toEqual({
        sortBy: 'name',
        sortOrder: 'desc',
      });
      
      expect(resultSortOrder).toEqual({
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });
    });

    it('should handle different default sort fields', () => {
      // Arrange
      const query = {};
      const defaultSortBy = 'title';
      
      // Act
      const result = getSortParams(query, defaultSortBy);
      
      // Assert
      expect(result).toEqual({
        sortBy: 'title',
        sortOrder: 'desc',
      });
    });

    it('should handle case sensitivity', () => {
      // Arrange
      const query = { sortBy: 'TITLE', sortOrder: 'ASC' };
      const defaultSortBy = 'createdAt';
      
      // Act
      const result = getSortParams(query, defaultSortBy);
      
      // Assert
      expect(result).toEqual({
        sortBy: 'TITLE',
        sortOrder: 'ASC',
      });
    });
  });
});
