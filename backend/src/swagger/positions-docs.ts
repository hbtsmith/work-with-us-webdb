import { swaggerSchemas } from './schemas';

export const positionsSwaggerDocs = {
  getAllPositions: {
    description: 'Obter todos os cargos',
    tags: ['Positions'],
    security: [{ BearerAuth: [] }],
    querystring: swaggerSchemas.PaginationQuery,
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                level: { type: 'string' },
                salaryRange: { type: 'string' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            }
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' }
            }
          }
        }
      },
      401: swaggerSchemas.ErrorResponse
    }
  },

  getAllPositionsSimple: {
    description: 'Obter lista simples de todos os cargos',
    tags: ['Positions'],
    security: [{ BearerAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                level: { type: 'string' },
                salaryRange: { type: 'string' }
              }
            }
          }
        }
      },
      401: swaggerSchemas.ErrorResponse
    }
  },

  createPosition: {
    description: 'Criar novo cargo',
    tags: ['Positions'],
    security: [{ BearerAuth: [] }],
    body: swaggerSchemas.CreatePositionRequest,
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              level: { type: 'string' },
              salaryRange: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          },
          message: { type: 'string' }
        }
      },
      400: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  getPositionById: {
    description: 'Obter cargo por ID',
    tags: ['Positions'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              level: { type: 'string' },
              salaryRange: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      },
      404: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  updatePosition: {
    description: 'Atualizar cargo',
    tags: ['Positions'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    },
    body: swaggerSchemas.UpdatePositionRequest,
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              level: { type: 'string' },
              salaryRange: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          },
          message: { type: 'string' }
        }
      },
      400: swaggerSchemas.ErrorResponse,
      404: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  deletePosition: {
    description: 'Excluir cargo',
    tags: ['Positions'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      },
      400: swaggerSchemas.ErrorResponse,
      404: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  }
};
