import { swaggerSchemas } from './schemas';

export const adminSwaggerDocs = {
  getDashboard: {
    description: 'Obter dados do dashboard administrativo',
    tags: ['Admin'],
    security: [{ BearerAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              totalJobs: { type: 'number' },
              totalApplications: { type: 'number' },
              totalPositions: { type: 'number' },
              recentApplications: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    jobTitle: { type: 'string' },
                    applicantName: { type: 'string' },
                    createdAt: { type: 'string' }
                  }
                }
              },
              jobStats: {
                type: 'object',
                properties: {
                  active: { type: 'number' },
                  inactive: { type: 'number' }
                }
              }
            }
          }
        }
      },
      401: swaggerSchemas.ErrorResponse
    }
  },

  getStats: {
    description: 'Obter estatísticas das candidaturas',
    tags: ['Admin'],
    security: [{ BearerAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              totalApplications: { type: 'number' },
              applicationsByMonth: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    month: { type: 'string' },
                    count: { type: 'number' }
                  }
                }
              },
              applicationsByJob: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    jobTitle: { type: 'string' },
                    count: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      },
      401: swaggerSchemas.ErrorResponse
    }
  }
};
