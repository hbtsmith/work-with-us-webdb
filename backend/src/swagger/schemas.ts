export const swaggerSchemas = {
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      password: {
        type: 'string',
        minLength: 6
      }
    }
  },
  
  ChangePasswordRequest: {
    type: 'object',
    required: ['currentPassword', 'newPassword'],
    properties: {
      currentPassword: {
        type: 'string'
      },
      newPassword: {
        type: 'string',
        minLength: 6
      }
    }
  },
  
  UpdateAdminRequest: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      password: {
        type: 'string',
        minLength: 6
      }
    }
  },
  
  LoginResponse: {
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
  
  ErrorResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      error: { type: 'string' },
      message: { type: 'string' }
    }
  },

  // Position schemas
  CreatePositionRequest: {
    type: 'object',
    required: ['title', 'level', 'salaryRange'],
    properties: {
      title: {
        type: 'string',
        minLength: 1
      },
      level: {
        type: 'string',
        minLength: 1
      },
      salaryRange: {
        type: 'string',
        minLength: 1
      }
    }
  },

  UpdatePositionRequest: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1
      },
      level: {
        type: 'string',
        minLength: 1
      },
      salaryRange: {
        type: 'string',
        minLength: 1
      }
    }
  },

  // Job schemas
  CreateJobRequest: {
    type: 'object',
    required: ['title', 'description', 'slug', 'positionId'],
    properties: {
      title: {
        type: 'string',
        minLength: 1
      },
      description: {
        type: 'string',
        minLength: 1
      },
      slug: {
        type: 'string',
        minLength: 1
      },
      requiresResume: {
        type: 'boolean'
      },
      positionId: {
        type: 'string'
      }
    }
  },

  UpdateJobRequest: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        minLength: 1
      },
      description: {
        type: 'string',
        minLength: 1
      },
      slug: {
        type: 'string',
        minLength: 1
      },
      requiresResume: {
        type: 'boolean'
      },
      positionId: {
        type: 'string'
      }
    }
  },

  CloneJobRequest: {
    type: 'object',
    required: ['title', 'slug'],
    properties: {
      title: {
        type: 'string',
        minLength: 1
      },
      slug: {
        type: 'string',
        minLength: 1
      }
    }
  },

  // Application schemas
  SubmitApplicationRequest: {
    type: 'object',
    required: ['answers', 'recaptchaToken'],
    properties: {
      answers: {
        type: 'array',
        items: {
          type: 'object',
          required: ['questionId', 'value'],
          properties: {
            questionId: { type: 'string' },
            value: { type: 'string' }
          }
        }
      },
      recaptchaToken: {
        type: 'string'
      }
    }
  },

  // Pagination schemas
  PaginationQuery: {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        minimum: 1,
        default: 1
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 100,
        default: 10
      },
      sortBy: {
        type: 'string'
      },
      sortOrder: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'desc'
      }
    }
  },

  // Success response schemas
  SuccessResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' }
    }
  },

  PaginatedResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      data: {
        type: 'array',
        items: { type: 'object' }
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
  }
};
