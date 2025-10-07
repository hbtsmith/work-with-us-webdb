import BaseApiService from '../api/base';
import { Job, ApiResponse, PaginatedResponse } from '@/types';

class JobsService extends BaseApiService {
  async getJobs(
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt', 
    sortOrder = 'desc'
  ): Promise<PaginatedResponse<Job>> {
    return this.get<PaginatedResponse<Job>>('/jobs', {
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  async getJobById(id: string): Promise<ApiResponse<Job>> {
    return this.get<ApiResponse<Job>>(`/jobs/${id}`);
  }

  async getJobBySlug(slug: string): Promise<ApiResponse<Job>> {
    return this.get<ApiResponse<Job>>(`/jobs/public/${slug}`);
  }

  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    return this.post<ApiResponse<Job>>('/jobs', jobData);
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    return this.put<ApiResponse<Job>>(`/jobs/${id}`, jobData);
  }

  async deleteJob(id: string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/jobs/${id}`);
  }

  async toggleJobStatus(id: string): Promise<ApiResponse<Job>> {
    return this.patch<ApiResponse<Job>>(`/jobs/${id}/toggle-status`);
  }

  // Question management
  async createJobQuestion(jobId: string, questionData: any): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(`/jobs/${jobId}/questions`, questionData);
  }

  async updateJobQuestion(
    jobId: string, 
    questionId: string, 
    questionData: any
  ): Promise<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(`/jobs/${jobId}/questions/${questionId}`, questionData);
  }

  async deleteJobQuestion(jobId: string, questionId: string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/jobs/${jobId}/questions/${questionId}`);
  }

  // Question Options management
  async getQuestionOptions(questionId: string): Promise<ApiResponse<any[]>> {
    return this.get<ApiResponse<any[]>>(`/questions/${questionId}/options`);
  }

  async createQuestionOption(questionId: string, optionData: any): Promise<ApiResponse<any>> {
    return this.post<ApiResponse<any>>(`/questions/${questionId}/options`, optionData);
  }

  async updateQuestionOption(
    questionId: string, 
    optionId: string, 
    optionData: any
  ): Promise<ApiResponse<any>> {
    return this.put<ApiResponse<any>>(`/questions/${questionId}/options/${optionId}`, optionData);
  }

  async deleteQuestionOption(questionId: string, optionId: string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/questions/${questionId}/options/${optionId}`);
  }
}

export const jobsService = new JobsService();
