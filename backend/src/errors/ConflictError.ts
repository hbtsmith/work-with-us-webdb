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
 * Error thrown when there's a conflict with the current state of the resource
 * HTTP Status: 409
 */
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = 'CONFLICT';
  
  constructor(message: string = i18n.t('errors.error_classes.conflict')) {
    super(message);
  }
}
