import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '@/services/authService';
import { success } from '@/i18n/i18n';
import { ErrorHandler } from '@/handlers/ErrorHandler';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

// Module augmentation to extend FastifyRequest globally
declare module 'fastify' {
  interface FastifyRequest {
    jwt: {
      sign: (payload: { id: string; email: string }) => string;
    };
    authUser: {
      id: string;
      email: string;
    };
  }
}

export class AuthController {
  private authService: AuthService;
  
  constructor() {
    this.authService = new AuthService();
  }
  
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const loginData = request.body as any;
      const admin = await this.authService.login(loginData);
      
      const token = request.server.jwt.sign({
        id: admin.id,
        email: admin.email,
      });
      
      return reply.send({
        success: true,
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
            isFirstLogin: admin.isFirstLogin,
          },
        },
        message: success('auth.login'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const passwordData = request.body as any;
      const adminId = (request as any).user.id;
      
      await this.authService.changePassword(adminId, passwordData);
      
      return reply.send({
        success: true,
        message: success('auth.password_changed'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const updateData = request.body as any;
      const adminId = (request as any).user.id;
      
      const updatedAdmin = await this.authService.updateAdmin(adminId, updateData);
      
      return reply.send({
        success: true,
        data: {
          id: updatedAdmin.id,
          email: updatedAdmin.email,
          isFirstLogin: updatedAdmin.isFirstLogin,
        },
        message: success('auth.profile_updated'),
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
  
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const adminId = (request as any).user.id;
      const admin = await this.authService.getAdminById(adminId);
      
      return reply.send({
        success: true,
        data: admin,
      });
    } catch (error) {
      return ErrorHandler.handle(error as Error, reply);
    }
  }
}
