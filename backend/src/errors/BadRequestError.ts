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
 * Error thrown when the request is malformed or invalid
 * HTTP Status: 400
 */
export class BadRequestError extends AppError {
  readonly statusCode = 400;
  readonly code = 'BAD_REQUEST';
  
  constructor(message: string = i18n.t('errors.error_classes.bad_request')) {
    super(message);
  }
}
