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
 * Error thrown when a requested resource is not found
 * HTTP Status: 404
 */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = 'NOT_FOUND';
  
  constructor(message: string = i18n.t('errors.error_classes.not_found')) {
    super(message);
  }
}
