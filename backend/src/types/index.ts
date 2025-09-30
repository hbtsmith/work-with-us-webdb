import { FastifyRequest } from 'fastify';
import { JWT } from '@fastify/jwt';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
  };
}

export interface FastifyRequestWithJWT extends FastifyRequest {
  jwt: JWT;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export enum QuestionType {
  SHORT_TEXT = 'SHORT_TEXT',
  LONG_TEXT = 'LONG_TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface CreateQuestionData {
  label: string;
  type: QuestionType;
  isRequired: boolean;
  options?: QuestionOption[];
  order: number;
}

export interface CreateJobData {
  title: string;
  description: string;
  slug: string;
  requiresResume: boolean;
  positionId: string;
}

export interface CreatePositionData {
  title: string;
  level: string;
  salaryRange: string;
}

export interface ApplicationFormData {
  answers: Record<string, string>;
  resume?: File;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateAdminData {
  email?: string;
  password?: string;
}