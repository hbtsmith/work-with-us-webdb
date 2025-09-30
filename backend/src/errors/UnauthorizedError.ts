import { AppError } from './AppError';
import { i18n } from '@/i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

/**
 * Error thrown when authentication is required but not provided or invalid
 * HTTP Status: 401
 */
export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = 'UNAUTHORIZED';
  
  constructor(message: string = i18n.t('errors.error_classes.unauthorized')) {
    super(message);
  }
}
