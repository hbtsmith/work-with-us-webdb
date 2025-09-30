import { FastifyReply } from 'fastify';
import { AppError } from '../errors';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

/**
 * Centralized error handler for the application
 * Provides consistent error response format across all controllers
 */
export class ErrorHandler {
  /**
   * Handles application errors and returns appropriate HTTP response
   * @param error - The error to handle
   * @param reply - Fastify reply object
   * @returns Formatted error response
   */
  static handle(error: Error, reply: FastifyReply) {
    // Handle custom application errors
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Handle unexpected errors
    console.error('Unexpected error:', error);
    
    return reply.status(500).send({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * Handles validation errors with detailed field information
   * @param errors - Array of validation errors
   * @param reply - Fastify reply object
   * @returns Formatted validation error response
   */
  static handleValidationErrors(errors: any[], reply: FastifyReply) {
    return reply.status(422).send({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Dados de entrada inválidos',
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }
}
