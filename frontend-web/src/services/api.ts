import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AuthResponse, LoginCredentials, Job, Position, Application, ApiResponse, PaginatedResponse, User } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // Usar a mesma configuração do constants/index.ts
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    // DEBUG: Log temporário para verificar variável de ambiente
    console.log('🔍 DEBUG API URL:', {
      'import.meta.env.VITE_API_URL': import.meta.env.VITE_API_URL,
      'apiUrl final': apiUrl,
      'NODE_ENV': import.meta.env.MODE,
      'todas as env vars': import.meta.env
    });

    this.api = axios.create({
      baseURL: `${apiUrl}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }
  
  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(email?: string, password?: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.put('/auth/profile', {
      email,
      password,
    });
    return response.data;
  }

  // Jobs endpoints
  async getJobs(page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc'): Promise<PaginatedResponse<Job>> {
    const response: AxiosResponse<PaginatedResponse<Job>> = await this.api.get('/jobs', {
      params: { page, limit, sortBy, sortOrder },
    });
    return response.data;
  }

  async getJobById(id: string): Promise<ApiResponse<Job>> {
    const response: AxiosResponse<ApiResponse<Job>> = await this.api.get(`/jobs/${id}`);
    return response.data;
  }

  async getJobBySlug(slug: string): Promise<ApiResponse<Job>> {
    const response: AxiosResponse<ApiResponse<Job>> = await this.api.get(`/jobs/public/${slug}`);
    return response.data;
  }

  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    const response: AxiosResponse<ApiResponse<Job>> = await this.api.post('/jobs', jobData);
    return response.data;
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    const response: AxiosResponse<ApiResponse<Job>> = await this.api.put(`/jobs/${id}`, jobData);
    return response.data;
  }

  async deleteJob(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/jobs/${id}`);
    return response.data;
  }

  async toggleJobStatus(id: string): Promise<ApiResponse<Job>> {
    const response: AxiosResponse<ApiResponse<Job>> = await this.api.patch(`/jobs/${id}/toggle-status`);
    return response.data;
  }

  // Question management endpoints
  async createJobQuestion(jobId: string, questionData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`/jobs/${jobId}/questions`, questionData);
    return response.data;
  }

  async updateJobQuestion(jobId: string, questionId: string, questionData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(`/jobs/${jobId}/questions/${questionId}`, questionData);
    return response.data;
  }

  async deleteJobQuestion(jobId: string, questionId: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/jobs/${jobId}/questions/${questionId}`);
    return response.data;
  }

  // Question Options management endpoints
  async getQuestionOptions(questionId: string): Promise<ApiResponse<any[]>> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(`/questions/${questionId}/options`);
    return response.data;
  }

  async createQuestionOption(questionId: string, optionData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`/questions/${questionId}/options`, optionData);
    return response.data;
  }

  async updateQuestionOption(questionId: string, optionId: string, optionData: any): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(`/questions/${questionId}/options/${optionId}`, optionData);
    return response.data;
  }

  async deleteQuestionOption(questionId: string, optionId: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/questions/${questionId}/options/${optionId}`);
    return response.data;
  }

      // Positions endpoints
      async getPositions(page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc'): Promise<PaginatedResponse<Position>> {
        const response: AxiosResponse<PaginatedResponse<Position>> = await this.api.get('/positions', {
          params: { page, limit, sortBy, sortOrder },
        });
        return response.data;
      }

  async createPosition(positionData: Partial<Position>): Promise<ApiResponse<Position>> {
    const response: AxiosResponse<ApiResponse<Position>> = await this.api.post('/positions', positionData);
    return response.data;
  }

  async updatePosition(id: string, positionData: Partial<Position>): Promise<ApiResponse<Position>> {
    const response: AxiosResponse<ApiResponse<Position>> = await this.api.put(`/positions/${id}`, positionData);
    return response.data;
  }

  async deletePosition(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/positions/${id}`);
    return response.data;
  }

  // Applications endpoints
  async getApplications(page = 1, limit = 10): Promise<PaginatedResponse<Application>> {
    const response: AxiosResponse<PaginatedResponse<Application>> = await this.api.get('/applications', {
      params: { page, limit },
    });
    return response.data;
  }

  async getApplicationById(id: string): Promise<ApiResponse<Application>> {
    const response: AxiosResponse<ApiResponse<Application>> = await this.api.get(`/applications/${id}`);
    return response.data;
  }

  async getApplicationsByJob(jobId: string, page = 1, limit = 10): Promise<PaginatedResponse<Application>> {
    const response: AxiosResponse<PaginatedResponse<Application>> = await this.api.get(`/applications/job/${jobId}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async deleteApplication(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = await this.api.delete(`/applications/${id}`);
    return response.data;
  }

  // Submit application endpoint
  async submitApplication(slug: string, formData: FormData): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`/applications/submit/${slug}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Download resume
  async downloadResume(applicationId: string): Promise<Blob> {
    const response: AxiosResponse<Blob> = await this.api.get(`/applications/${applicationId}/resume`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<ApiResponse<any>> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/admin/dashboard');
    return response.data;
  }
}

export const apiService = new ApiService();
