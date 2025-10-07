import { swaggerSchemas } from './schemas';

export const applicationsSwaggerDocs = {
  submitApplication: {
    description: 'Submeter candidatura para uma vaga',
    tags: ['Applications'],
    params: {
      type: 'object',
      properties: {
        slug: { type: 'string' }
      },
      required: ['slug']
    },
    consumes: ['multipart/form-data'],
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              jobId: { type: 'string' },
              submittedAt: { type: 'string' },
              answers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    questionId: { type: 'string' },
                    textValue: { type: 'string' },
                    questionOptionId: { type: 'string' }
                  }
                }
              }
            }
          },
          message: { type: 'string' }
        }
      },
      400: swaggerSchemas.ErrorResponse,
      404: swaggerSchemas.ErrorResponse
    }
  },

  getApplications: {
    description: 'Obter lista de candidaturas',
    tags: ['Applications'],
    security: [{ BearerAuth: [] }],
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'number', minimum: 1, default: 1 },
        limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
        sortBy: { type: 'string' },
        sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
        jobId: { type: 'string' }
      }
    },
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
                jobId: { type: 'string' },
                resumeUrl: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                job: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    slug: { type: 'string' }
                  }
                },
                answers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      questionId: { type: 'string' },
                      value: { type: 'string' },
                      question: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          label: { type: 'string' },
                          type: { type: 'string' },
                          isRequired: { type: 'boolean' }
                        }
                      }
                    }
                  }
                }
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

  getApplicationById: {
    description: 'Obter candidatura por ID',
    tags: ['Applications'],
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
              jobId: { type: 'string' },
              resumeUrl: { type: 'string', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              job: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  slug: { type: 'string' },
                  position: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      level: { type: 'string' },
                      salaryRange: { type: 'string' }
                    }
                  }
                }
              },
              answers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    questionId: { type: 'string' },
                    textValue: { type: 'string', nullable: true },
                    questionOptionId: { type: 'string', nullable: true },
                    question: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        label: { type: 'string' },
                        type: { type: 'string' },
                        isRequired: { type: 'boolean' },
                        order: { type: 'number' }
                      }
                    },
                    questionOption: {
                      type: 'object',
                      nullable: true,
                      properties: {
                        id: { type: 'string' },
                        questionId: { type: 'string' },
                        label: { type: 'string' },
                        orderIndex: { type: 'number' },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      404: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  deleteApplication: {
    description: 'Excluir candidatura',
    tags: ['Applications'],
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
      404: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  getApplicationsByJob: {
    description: 'Obter candidaturas por vaga',
    tags: ['Applications'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        jobId: { type: 'string' }
      },
      required: ['jobId']
    },
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'number', minimum: 1, default: 1 },
        limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
        sortBy: { type: 'string' },
        sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
      }
    },
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
                jobId: { type: 'string' },
                resumeUrl: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                answers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      questionId: { type: 'string' },
                      value: { type: 'string' },
                      question: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          label: { type: 'string' },
                          type: { type: 'string' },
                          isRequired: { type: 'boolean' }
                        }
                      }
                    }
                  }
                }
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
      404: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  getApplicationStats: {
    description: 'Obter estatísticas das candidaturas',
    tags: ['Applications'],
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
              applicationsByJob: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    jobId: { type: 'string' },
                    jobTitle: { type: 'string' },
                    count: { type: 'number' }
                  }
                }
              },
              recentApplications: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    jobTitle: { type: 'string' },
                    submittedAt: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      },
      401: swaggerSchemas.ErrorResponse
    }
  },
  
  downloadResume: {
    description: 'Download resume file for an application',
    tags: ['Applications'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Application ID' }
      },
      required: ['id']
    },
    response: {
      200: {
        description: 'Resume file',
        type: 'string',
        format: 'binary'
      },
      404: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  }
};
