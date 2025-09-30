import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../../services/authService';
import { prisma } from '../../database/client';
import bcrypt from 'bcryptjs';
import { i18n } from '../../i18n/i18n';

describe('AuthService', () => {
  let authService: AuthService;
  
  beforeEach(() => {
    // Configure i18n for tests
    i18n.setLocale('pt_BR');
    authService = new AuthService();
  });
  
  afterEach(async () => {
    await prisma.admin.deleteMany();
  });
  
  describe('login', () => {
    it('should login with valid credentials', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash(i18n.t('test.data.admin_password'), 12);
      const admin = await prisma.admin.create({
        data: {
          email: i18n.t('test.data.admin_email'),
          password: hashedPassword,
          isFirstLogin: false,
        },
      });
      
      // Act
      const result = await authService.login({
        email: i18n.t('test.data.admin_email'),
        password: i18n.t('test.data.admin_password'),
      });
      
      // Assert
      expect(result).toEqual({
        id: admin.id,
        email: i18n.t('test.data.admin_email'),
        isFirstLogin: false,
      });
    });
    
    it('should throw error with invalid email', async () => {
      // Act & Assert
      await expect(
        authService.login({
          email: 'invalid@admin.com',
          password: i18n.t('test.data.admin_password'),
        })
      ).rejects.toThrow(i18n.t('errors.auth.invalid_credentials'));
    });
    
    it('should throw error with invalid password', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash(i18n.t('test.data.admin_password'), 12);
      await prisma.admin.create({
        data: {
          email: i18n.t('test.data.admin_email'),
          password: hashedPassword,
          isFirstLogin: false,
        },
      });
      
      // Act & Assert
      await expect(
        authService.login({
          email: i18n.t('test.data.admin_email'),
          password: i18n.t('test.data.wrong_password'),
        })
      ).rejects.toThrow(i18n.t('errors.auth.invalid_credentials'));
    });
  });
  
  describe('changePassword', () => {
    it('should change password with valid current password', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash(i18n.t('test.data.old_password'), 12);
      const admin = await prisma.admin.create({
        data: {
          email: i18n.t('test.data.admin_email'),
          password: hashedPassword,
          isFirstLogin: false,
        },
      });
      
      // Act
      const result = await authService.changePassword(admin.id, {
        currentPassword: i18n.t('test.data.old_password'),
        newPassword: i18n.t('test.data.new_password'),
      });
      
      // Assert
      expect(result.isFirstLogin).toBe(false);
      
      // Verify new password works
      const loginResult = await authService.login({
        email: i18n.t('test.data.admin_email'),
        password: i18n.t('test.data.new_password'),
      });
      expect(loginResult.id).toBe(admin.id);
    });
    
    it('should throw error with invalid current password', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash(i18n.t('test.data.old_password'), 12);
      const admin = await prisma.admin.create({
        data: {
          email: i18n.t('test.data.admin_email'),
          password: hashedPassword,
          isFirstLogin: false,
        },
      });
      
      // Act & Assert
      await expect(
        authService.changePassword(admin.id, {
          currentPassword: i18n.t('test.data.wrong_password'),
          newPassword: i18n.t('test.data.new_password'),
        })
      ).rejects.toThrow(i18n.t('errors.auth.current_password_incorrect'));
    });
    
    it('should throw error for non-existent admin', async () => {
      // Act & Assert
      await expect(
        authService.changePassword('non-existent-id', {
          currentPassword: i18n.t('test.data.old_password'),
          newPassword: i18n.t('test.data.new_password'),
        })
      ).rejects.toThrow(i18n.t('errors.auth.admin_not_found'));
    });
  });
  
  describe('updateAdmin', () => {
    it('should update email and password', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash(i18n.t('test.data.old_password'), 12);
      const admin = await prisma.admin.create({
        data: {
          email: 'old@admin.com',
          password: hashedPassword,
          isFirstLogin: true,
        },
      });
      
      // Act
      const result = await authService.updateAdmin(admin.id, {
        email: i18n.t('test.data.new_email'),
        password: i18n.t('test.data.new_password'),
      });
      
      // Assert
      expect(result.email).toBe(i18n.t('test.data.new_email'));
      expect(result.isFirstLogin).toBe(false);
      
      // Verify new credentials work
      const loginResult = await authService.login({
        email: i18n.t('test.data.new_email'),
        password: i18n.t('test.data.new_password'),
      });
      expect(loginResult.id).toBe(admin.id);
    });
    
    it('should update only email when password not provided', async () => {
      // Arrange
      const hashedPassword = await bcrypt.hash(i18n.t('test.data.admin_password'), 12);
      const admin = await prisma.admin.create({
        data: {
          email: 'old@admin.com',
          password: hashedPassword,
          isFirstLogin: false,
        },
      });
      
      // Act
      const result = await authService.updateAdmin(admin.id, {
        email: i18n.t('test.data.new_email'),
      });
      
      // Assert
      expect(result.email).toBe(i18n.t('test.data.new_email'));
      expect(result.isFirstLogin).toBe(false);
      
      // Verify old password still works
      const loginResult = await authService.login({
        email: i18n.t('test.data.new_email'),
        password: i18n.t('test.data.admin_password'),
      });
      expect(loginResult.id).toBe(admin.id);
    });
  });
  
  describe('getAdminById', () => {
    it('should return admin by id', async () => {
      // Arrange
      const admin = await prisma.admin.create({
        data: {
          email: i18n.t('test.data.admin_email'),
          password: 'hashedpassword',
          isFirstLogin: false,
        },
      });
      
      // Act
      const result = await authService.getAdminById(admin.id);
      
      // Assert
      expect(result).toEqual({
        id: admin.id,
        email: i18n.t('test.data.admin_email'),
        isFirstLogin: false,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      });
    });
    
    it('should throw error for non-existent admin', async () => {
      // Act & Assert
      await expect(
        authService.getAdminById('non-existent-id')
      ).rejects.toThrow(i18n.t('errors.auth.admin_not_found'));
    });
  });
});