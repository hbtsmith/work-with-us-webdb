import { swaggerSchemas } from './schemas';

export const authSwaggerDocs = {
  login: {
    description: 'Login do administrador',
    tags: ['Authentication'],
    body: swaggerSchemas.LoginRequest,
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string' },
              admin: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  isFirstLogin: { type: 'boolean' }
                }
              }
            }
          },
          message: { type: 'string' }
        }
      },
      401: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },

  changePassword: {
    description: 'Alterar senha do administrador',
    tags: ['Authentication'],
    security: [{ BearerAuth: [] }],
    body: swaggerSchemas.ChangePasswordRequest,
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },

  updateProfile: {
    description: 'Atualizar perfil do administrador',
    tags: ['Authentication'],
    security: [{ BearerAuth: [] }],
    body: swaggerSchemas.UpdateAdminRequest,
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              isFirstLogin: { type: 'boolean' }
            }
          },
          message: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },

  getProfile: {
    description: 'Obter perfil do administrador',
    tags: ['Authentication'],
    security: [{ BearerAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              isFirstLogin: { type: 'boolean' }
            }
          }
        }
      },
      404: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  }
};
