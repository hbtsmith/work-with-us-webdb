import { FastifyInstance } from 'fastify';
import { AdminController } from '@/controllers/adminController';
import { authenticate } from '@/middlewares/auth';
import { adminSwaggerDocs } from '@/swagger';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export async function adminRoutes(fastify: FastifyInstance) {
  const adminController = new AdminController();
  
  // All admin routes require authentication
  fastify.addHook('preHandler', authenticate);
  
  // Dashboard statistics
  fastify.get('/dashboard', {
    schema: adminSwaggerDocs.getDashboard,
    handler: adminController.getDashboardData.bind(adminController),
  });
  
  // Quick stats
  fastify.get('/stats', {
    schema: adminSwaggerDocs.getStats,
    handler: adminController.getApplicationStats.bind(adminController),
  });
}