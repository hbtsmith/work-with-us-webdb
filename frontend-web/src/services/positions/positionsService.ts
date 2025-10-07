import BaseApiService from '../api/base';
import { Position, ApiResponse, PaginatedResponse } from '@/types';

class PositionsService extends BaseApiService {
  async getPositions(
    page = 1, 
    limit = 10, 
    sortBy = 'createdAt', 
    sortOrder = 'desc'
  ): Promise<PaginatedResponse<Position>> {
    return this.get<PaginatedResponse<Position>>('/positions', {
      page,
      limit,
      sortBy,
      sortOrder,
    });
  }

  async createPosition(positionData: Partial<Position>): Promise<ApiResponse<Position>> {
    return this.post<ApiResponse<Position>>('/positions', positionData);
  }

  async updatePosition(id: string, positionData: Partial<Position>): Promise<ApiResponse<Position>> {
    return this.put<ApiResponse<Position>>(`/positions/${id}`, positionData);
  }

  async deletePosition(id: string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`/positions/${id}`);
  }
}

export const positionsService = new PositionsService();
