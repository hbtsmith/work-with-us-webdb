import { describe, it, expect } from 'vitest';
import { validateFileType, validateFileSize } from '../../utils/fileUpload';

describe('File Upload Utils', () => {

  describe('validateFileType', () => {
    it('should validate allowed file types', () => {
      // Arrange
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
      const testCases = [
        { filename: 'document.pdf', expected: true },
        { filename: 'document.doc', expected: true },
        { filename: 'document.docx', expected: true },
        { filename: 'document.txt', expected: true },
        { filename: 'document.PDF', expected: true }, // case insensitive
        { filename: 'document.DOC', expected: true },
      ];

      // Act & Assert
      testCases.forEach(({ filename, expected }) => {
        const result = validateFileType(filename, allowedTypes);
        expect(result).toBe(expected);
      });
    });

    it('should reject disallowed file types', () => {
      // Arrange
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const testCases = [
        { filename: 'document.jpg', expected: false },
        { filename: 'document.png', expected: false },
        { filename: 'document.exe', expected: false },
        { filename: 'document', expected: false }, // no extension
        { filename: 'document.unknown', expected: false },
      ];

      // Act & Assert
      testCases.forEach(({ filename, expected }) => {
        const result = validateFileType(filename, allowedTypes);
        expect(result).toBe(expected);
      });
    });

    it('should handle case sensitivity', () => {
      // Arrange
      const allowedTypes = ['.pdf', '.doc'];
      const testCases = [
        { filename: 'document.pdf', expected: true },
        { filename: 'document.PDF', expected: true },
        { filename: 'document.Pdf', expected: true },
        { filename: 'document.pDf', expected: true },
      ];

      // Act & Assert
      testCases.forEach(({ filename, expected }) => {
        const result = validateFileType(filename, allowedTypes);
        expect(result).toBe(expected);
      });
    });

    it('should handle empty allowed types array', () => {
      // Arrange
      const allowedTypes: string[] = [];
      const filename = 'document.pdf';

      // Act
      const result = validateFileType(filename, allowedTypes);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('validateFileSize', () => {
    it('should validate file size within limit', () => {
      // Arrange
      const testCases = [
        { size: 1024, maxSize: 2048, expected: true },
        { size: 0, maxSize: 1024, expected: true },
        { size: 1024, maxSize: 1024, expected: true },
        { size: 1024, maxSize: 1023, expected: false },
        { size: 1, maxSize: 1, expected: true },
      ];

      // Act & Assert
      testCases.forEach(({ size, maxSize, expected }) => {
        const result = validateFileSize(size, maxSize);
        expect(result).toBe(expected);
      });
    });

    it('should handle large file sizes', () => {
      // Arrange
      const largeSize = 10 * 1024 * 1024; // 10MB
      const maxSize = 5 * 1024 * 1024; // 5MB

      // Act
      const result = validateFileSize(largeSize, maxSize);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle zero max size', () => {
      // Arrange
      const size = 1024;
      const maxSize = 0;

      // Act
      const result = validateFileSize(size, maxSize);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle negative values', () => {
      // Arrange
      const size = -1024;
      const maxSize = 1024;

      // Act
      const result = validateFileSize(size, maxSize);

      // Assert
      expect(result).toBe(true); // negative size is considered valid (edge case)
    });
  });
});
