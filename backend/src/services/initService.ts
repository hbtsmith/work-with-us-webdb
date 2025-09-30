import { prisma } from '@/database/client';
import bcrypt from 'bcryptjs';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export class InitService {
  /**
   * Checks if at least one admin exists in the database
   * If none exists, creates a default admin
   */
  static async ensureAdminExists(): Promise<void> {
    try {
      
      const defaultEmail = process.env['ADMIN_EMAIL'] || 'admin@company.com';
      
      // Check if admin with default email exists
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: defaultEmail },
      });
      
      if (!existingAdmin) {
        await this.createDefaultAdmin();
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a default admin with credentials from .env
   */
  private static async createDefaultAdmin(): Promise<void> {
    const defaultEmail = process.env['ADMIN_EMAIL'] || 'admin@company.com';
    const defaultPassword = process.env['ADMIN_PASSWORD'] || 'admin123';
    // Hash the password
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    // Use upsert to avoid constraint conflicts
    await prisma.admin.upsert({
      where: { email: defaultEmail },
      update: {
        // If it already exists, update the password (useful for reset)
        password: hashedPassword,
        isFirstLogin: true,
      },
      create: {
        email: defaultEmail,
        password: hashedPassword,
        isFirstLogin: true,
      },
    });
    
    // console.log(`📧 Email: ${admin.email}`);
    
  }

  /**
   * Initializes all necessary data
   */
  static async initialize(): Promise<void> {

    
    try {
      await this.ensureAdminExists();
    } catch (error) {
      throw error;
    }
  }
}
