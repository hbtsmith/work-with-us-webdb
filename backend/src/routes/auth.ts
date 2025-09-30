import { FastifyInstance } from 'fastify';
import { AuthController } from '@/controllers/authController';
import { authenticate } from '@/middlewares/auth';
import { validateBody } from '@/middlewares/validation';
import {
  loginSchema,
  changePasswordSchema,
  updateAdminSchema,
} from '@/schemas';
import { authSwaggerDocs } from '@/swagger';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export async function authRoutes(fastify: FastifyInstance) {
  const authController = new AuthController();

  // Rotas públicas
  fastify.post(
    '/login',
    {
      preHandler: [validateBody(loginSchema)],
      schema: authSwaggerDocs.login
    },
    authController.login.bind(authController)
  );
  // Protected routes
  fastify.register(async function (fastify) {
    fastify.addHook('preHandler', authenticate);
    
    fastify.post('/change-password', {
      preHandler: [validateBody(changePasswordSchema)],
      schema: authSwaggerDocs.changePassword,
      handler: authController.changePassword.bind(authController),
    });
    
    fastify.put('/profile', {
      preHandler: [validateBody(updateAdminSchema)],
      schema: authSwaggerDocs.updateProfile,
      handler: authController.updateProfile.bind(authController),
    });
    
    fastify.get('/profile', {
      schema: authSwaggerDocs.getProfile,
      handler: authController.getProfile.bind(authController),
    });
  });
}
