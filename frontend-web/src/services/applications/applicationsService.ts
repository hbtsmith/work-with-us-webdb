import BaseApiService from '../api/base';
import { Application, ApiResponse, PaginatedResponse } from '@/types';

class ApplicationsService extends BaseApiService {
  async getApplications(page = 1, limit = 10): Promise<PaginatedResponse<Application>> {
    return this.get<PaginatedResponse<Application>>('/applications', {
      page,
      limit,
    });
  }

  async getApplicationById(id: string): Promise<ApiResponse<Application>> {
    return this.get<ApiResponse<Application>>(`/applications/${id}`);
  }

  async getApplicationsByJob(
    jobId: string, 
    page = 1, 
    limit = 10
  ): Promise<PaginatedResponse<Application>> {
    return this.get<PaginatedResponse<Application>>(`/applications/job/${jobId}`, {
      page,
      limit,
    });
  }

  async deleteApplication(id: string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/applications/${id}`);
  }

  async submitApplication(slug: string, formData: FormData): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(`/applications/submit/${slug}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async downloadResume(applicationId: string): Promise<Blob> {
    const response = await this.api.get(`/applications/${applicationId}/resume`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const applicationsService = new ApplicationsService();
