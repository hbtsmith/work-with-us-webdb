export interface User {
  id: string;
  email: string;
  isFirstLogin: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    admin: User;
  };
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  slug: string;
  requiresResume: boolean;
  isActive: boolean;
  position: Position;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
  };
}

export interface Position {
  id: string;
  title: string;
  level: string;
  salaryRange: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  label: string;
  type: 'SHORT_TEXT' | 'LONG_TEXT' | 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  isRequired: boolean;
  options?: QuestionOption[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Application {
  id: string;
  jobId: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
  job: Job;
  answers: Answer[];
}

export interface Answer {
  id: string;
  value: string;
  questionId: string;
  question: Question;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}
