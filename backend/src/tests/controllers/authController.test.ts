import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuthController } from '../../controllers/authController';
import { AuthService } from '../../services/authService';
import { i18n } from '../../i18n/i18n';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

// Mock do AuthService
vi.mock('../../services/authService');

// Mock do ErrorHandler
vi.mock('../../handlers/ErrorHandler', () => ({
  ErrorHandler: {
    handle: vi.fn()
  }
}));

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: any;
  let mockRequest: any;
  let mockReply: any;
  let mockErrorHandler: any;

  beforeEach(async () => {
    // Configure i18n for tests
    i18n.setLocale('pt_BR');
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Import and setup ErrorHandler mock
    const { ErrorHandler } = await import('../../handlers/ErrorHandler');
    mockErrorHandler = ErrorHandler;
    
    // Create controller
    authController = new AuthController();
    
    // Mock AuthService
    mockAuthService = {
      login: vi.fn(),
      changePassword: vi.fn(),
      updateAdmin: vi.fn(),
      getAdminById: vi.fn(),
    };
    
    // Replace the service instance
    (authController as any).authService = mockAuthService;
    
    // Mock request and reply
    mockRequest = {
      body: {},
      server: {
        jwt: {
          sign: vi.fn().mockReturnValue('mock-jwt-token'),
        },
      },
    };
    
    mockReply = {
      send: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'admin@test.com',
        password: 'password123',
      };
      const mockAdmin = {
        id: 'admin-123',
        email: 'admin@test.com',
        isFirstLogin: false,
      };
      
      mockRequest.body = loginData;
      mockAuthService.login.mockResolvedValue(mockAdmin);
      
      // Act
      await authController.login(mockRequest, mockReply);
      
      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockRequest.server.jwt.sign).toHaveBeenCalledWith({
        id: mockAdmin.id,
        email: mockAdmin.email,
      });
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: {
          token: 'mock-jwt-token',
          admin: {
            id: mockAdmin.id,
            email: mockAdmin.email,
            isFirstLogin: mockAdmin.isFirstLogin,
          },
        },
        message: i18n.t('success.auth.login'),
      });
    });

    it('should handle login failure', async () => {
      // Arrange
      const loginData = {
        email: 'admin@test.com',
        password: 'wrongpassword',
      };
      const errorMessage = i18n.t('errors.auth.invalid_credentials');
      
      mockRequest.body = loginData;
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await authController.login(mockRequest, mockReply);
      
      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const adminId = 'admin-123';
      
      mockRequest.body = passwordData;
      mockRequest.user = { id: adminId };
      mockAuthService.changePassword.mockResolvedValue(undefined);
      
      // Act
      await authController.changePassword(mockRequest, mockReply);
      
      // Assert
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(adminId, passwordData);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: i18n.t('success.auth.password_changed'),
      });
    });

    it('should handle password change failure', async () => {
      // Arrange
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword',
      };
      const adminId = 'admin-123';
      const errorMessage = i18n.t('errors.auth.current_password_incorrect');
      
      mockRequest.body = passwordData;
      mockRequest.user = { id: adminId };
      mockAuthService.changePassword.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await authController.changePassword(mockRequest, mockReply);
      
      // Assert
      expect(mockAuthService.changePassword).toHaveBeenCalledWith(adminId, passwordData);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      // Arrange
      const updateData = {
        email: 'newemail@test.com',
      };
      const adminId = 'admin-123';
      const updatedAdmin = {
        id: adminId,
        email: 'newemail@test.com',
        isFirstLogin: false,
      };
      
      mockRequest.body = updateData;
      mockRequest.user = { id: adminId };
      mockAuthService.updateAdmin.mockResolvedValue(updatedAdmin);
      
      // Act
      await authController.updateProfile(mockRequest, mockReply);
      
      // Assert
      expect(mockAuthService.updateAdmin).toHaveBeenCalledWith(adminId, updateData);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: {
          id: updatedAdmin.id,
          email: updatedAdmin.email,
          isFirstLogin: updatedAdmin.isFirstLogin,
        },
        message: i18n.t('success.auth.profile_updated'),
      });
    });

    it('should handle profile update failure', async () => {
      // Arrange
      const updateData = {
        email: 'invalid-email',
      };
      const adminId = 'admin-123';
      const errorMessage = i18n.t('errors.auth.profile_update_failed');
      
      mockRequest.body = updateData;
      mockRequest.user = { id: adminId };
      mockAuthService.updateAdmin.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await authController.updateProfile(mockRequest, mockReply);
      
      // Assert
      expect(mockAuthService.updateAdmin).toHaveBeenCalledWith(adminId, updateData);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });

  describe('getProfile', () => {
    it('should get profile successfully', async () => {
      // Arrange
      const adminId = 'admin-123';
      const admin = {
        id: adminId,
        email: 'admin@test.com',
        isFirstLogin: false,
      };
      
      mockRequest.user = { id: adminId };
      mockAuthService.getAdminById.mockResolvedValue(admin);
      
      // Act
      await authController.getProfile(mockRequest, mockReply);
      
      // Assert
      expect(mockAuthService.getAdminById).toHaveBeenCalledWith(adminId);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        data: admin,
      });
    });

    it('should handle profile not found', async () => {
      // Arrange
      const adminId = 'admin-123';
      const errorMessage = i18n.t('errors.auth.admin_not_found');
      
      mockRequest.user = { id: adminId };
      mockAuthService.getAdminById.mockRejectedValue(new Error(errorMessage));
      
      // Act
      await authController.getProfile(mockRequest, mockReply);
      
      // Assert
      expect(mockAuthService.getAdminById).toHaveBeenCalledWith(adminId);
      expect(mockErrorHandler.handle).toHaveBeenCalledWith(expect.any(Error), mockReply);
    });
  });
});
