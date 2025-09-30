import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedRequest } from '@/types';
import { error as i18nError } from '@/i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        error: i18nError('auth.unauthorized'),
        message: i18nError('auth.token_invalid'),
      });
    }

    const decoded = request.server.jwt.verify(token);
    const user = decoded as { id: string; email: string };
    (request as AuthenticatedRequest).user = user;
  } catch (err) {
    return reply.status(401).send({
      error: i18nError('auth.unauthorized'),
      message: i18nError('auth.token_invalid'),
    });
  }
}