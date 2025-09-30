import bcrypt from 'bcryptjs';
import { prisma } from '@/database/client';
import { LoginData, ChangePasswordData, UpdateAdminData } from '@/types';
import { NotFoundError, UnauthorizedError } from '@/errors';
import { i18n } from '@/i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export class AuthService {
  async login(loginData: LoginData) {
    const { email, password } = loginData;
    
    const admin = await prisma.admin.findUnique({
      where: { email },
    });
    
    if (!admin) {
      throw new UnauthorizedError(i18n.t('errors.auth.invalid_credentials'));
    }
    
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      throw new UnauthorizedError(i18n.t('errors.auth.invalid_credentials'));
    }
    
    return {
      id: admin.id,
      email: admin.email,
      isFirstLogin: admin.isFirstLogin,
    };
  }
  
  async changePassword(adminId: string, passwordData: ChangePasswordData) {
    const { currentPassword, newPassword } = passwordData;
    
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    
    if (!admin) {
      throw new NotFoundError(i18n.t('errors.auth.admin_not_found'));
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
    
    if (!isValidPassword) {
      throw new UnauthorizedError(i18n.t('errors.auth.current_password_incorrect'));
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    return await prisma.admin.update({
      where: { id: adminId },
      data: {
        password: hashedNewPassword,
        isFirstLogin: false,
      },
    });
  }
  
  async updateAdmin(adminId: string, updateData: UpdateAdminData) {
    const updateFields: any = {};
    
    if (updateData.email) {
      updateFields.email = updateData.email;
    }
    
    if (updateData.password) {
      updateFields.password = await bcrypt.hash(updateData.password, 12);
      updateFields.isFirstLogin = false;
    }
    
    return await prisma.admin.update({
      where: { id: adminId },
      data: updateFields,
    });
  }
  
  async getAdminById(adminId: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        isFirstLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!admin) {
      throw new NotFoundError(i18n.t('errors.auth.admin_not_found'));
    }
    
    return admin;
  }
}
