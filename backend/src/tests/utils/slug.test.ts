import { describe, it, expect } from 'vitest';
import { generateSlug, validateSlug } from '../../utils/slug';

describe('Slug Utils', () => {
  describe('generateSlug', () => {
    it('should convert text to URL-friendly slug', () => {
      // Arrange
      const text = 'Desenvolvedor Frontend React';
      
      // Act
      const result = generateSlug(text);
      
      // Assert
      expect(result).toBe('desenvolvedor-frontend-react');
    });

    it('should handle special characters correctly', () => {
      // Arrange
      const text = 'Cargo: Desenvolvedor (Sênior) - R$ 5.000';
      
      // Act
      const result = generateSlug(text);
      
      // Assert
      expect(result).toBe('cargo-desenvolvedor-snior-r-5000');
    });

    it('should handle multiple spaces and special characters', () => {
      // Arrange
      const text = '  Vaga   de   Desenvolvedor   Full-Stack  ';
      
      // Act
      const result = generateSlug(text);
      
      // Assert
      expect(result).toBe('vaga-de-desenvolvedor-full-stack');
    });

    it('should handle underscores and hyphens', () => {
      // Arrange
      const text = 'Desenvolvedor_Frontend---React';
      
      // Act
      const result = generateSlug(text);
      
      // Assert
      expect(result).toBe('desenvolvedor-frontend-react');
    });

    it('should handle empty string', () => {
      // Arrange
      const text = '';
      
      // Act
      const result = generateSlug(text);
      
      // Assert
      expect(result).toBe('');
    });

    it('should handle only special characters', () => {
      // Arrange
      const text = '!@#$%^&*()';
      
      // Act
      const result = generateSlug(text);
      
      // Assert
      expect(result).toBe('');
    });

    it('should handle mixed case text', () => {
      // Arrange
      const text = 'DESENVOLVEDOR Frontend REACT';
      
      // Act
      const result = generateSlug(text);
      
      // Assert
      expect(result).toBe('desenvolvedor-frontend-react');
    });
  });

  describe('validateSlug', () => {
    it('should validate correct slug format', () => {
      // Arrange
      const validSlugs = [
        'desenvolvedor-frontend',
        'cargo-senior',
        'vaga-123',
        'a',
        'desenvolvedor-frontend-react-typescript'
      ];
      
      // Act & Assert
      validSlugs.forEach(slug => {
        expect(validateSlug(slug)).toBe(true);
      });
    });

    it('should reject invalid slug format', () => {
      // Arrange
      const invalidSlugs = [
        'Desenvolvedor Frontend', // uppercase
        'desenvolvedor_frontend', // underscore
        'desenvolvedor.frontend', // dot
        'desenvolvedor@frontend', // special char
        '', // empty
        'desenvolvedor frontend', // space
        'a'.repeat(101), // too long
      ];
      
      // Act & Assert
      invalidSlugs.forEach(slug => {
        expect(validateSlug(slug)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      // Arrange & Act & Assert
      expect(validateSlug('a')).toBe(true); // minimum length
      expect(validateSlug('a'.repeat(100))).toBe(true); // maximum length
      expect(validateSlug('a'.repeat(101))).toBe(false); // too long
      expect(validateSlug('')).toBe(false); // empty string
    });

    it('should validate slug with numbers', () => {
      // Arrange
      const slug = 'desenvolvedor-frontend-2024';
      
      // Act
      const result = validateSlug(slug);
      
      // Assert
      expect(result).toBe(true);
    });

    it('should validate slug with multiple hyphens', () => {
      // Arrange
      const slug = 'desenvolvedor-frontend-react-typescript';
      
      // Act
      const result = validateSlug(slug);
      
      // Assert
      expect(result).toBe(true);
    });
  });
});
