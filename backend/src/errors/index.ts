/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

/**
 * Centralized export of all error classes
 * Provides a single import point for all application errors
 */

export { AppError } from './AppError';
export { NotFoundError } from './NotFoundError';
export { ConflictError } from './ConflictError';
export { BadRequestError } from './BadRequestError';
export { UnauthorizedError } from './UnauthorizedError';
export { ForbiddenError } from './ForbiddenError';
export { ValidationError } from './ValidationError';
