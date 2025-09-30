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
 * Error thrown when the user doesn't have permission to access the resource
 * HTTP Status: 403
 */
export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = 'FORBIDDEN';
  
  constructor(message: string = i18n.t('errors.error_classes.forbidden')) {
    super(message);
  }
}
