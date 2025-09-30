import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { error as i18nError } from '@/i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { log } = request;

  // Log error for debugging
  log.error(error);

  // Handle different types of errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: i18nError('validation.error'),
      message: i18nError('validation.invalid_input'),
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return reply.status(409).send({
          error: i18nError('general.conflict'),
          message: i18nError('general.record_exists'),
        });
      case 'P2025':
        return reply.status(404).send({
          error: i18nError('general.not_found'),
          message: i18nError('general.record_not_found'),
        });
      default:
        return reply.status(500).send({
          error: i18nError('general.database_error'),
          message: i18nError('general.processing_error'),
        });
    }
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: error.name || 'Error',
      message: error.message,
    });
  }

  // Default error response
  return reply.status(500).send({
    error: i18nError('general.internal_error'),
    message: process.env['NODE_ENV'] === 'production' 
      ? i18nError('general.unexpected_error')
      : error.message,
  });
}