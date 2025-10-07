import { swaggerSchemas } from './schemas';

export const jobsSwaggerDocs = {
  getJobBySlug: {
    description: 'Obter vaga por slug (acesso público)',
    tags: ['Jobs'],
    params: {
      type: 'object',
      properties: {
        slug: { type: 'string' }
      },
      required: ['slug']
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
              description: { type: 'string' },
              slug: { type: 'string' },
              requiresResume: { type: 'boolean' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              position: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  level: { type: 'string' },
                  salaryRange: { type: 'string' }
                }
              },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    type: { type: 'string' },
                    isRequired: { type: 'boolean' },
                    order: { type: 'number' },
                    options: {
                      type: 'array',
                      items: {
                        type: 'object',
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
        }
      },
      404: swaggerSchemas.ErrorResponse
    }
  },

  createJob: {
    description: 'Criar nova vaga',
    tags: ['Jobs'],
    security: [{ BearerAuth: [] }],
    body: swaggerSchemas.CreateJobRequest,
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
              description: { type: 'string' },
              slug: { type: 'string' },
              requiresResume: { type: 'boolean' },
              isActive: { type: 'boolean' },
              position: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  level: { type: 'string' },
                  salaryRange: { type: 'string' }
                }
              },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    type: { type: 'string' },
                    isRequired: { type: 'boolean' },
                    order: { type: 'number' },
                    options: {
                      type: 'array',
                      items: {
                        type: 'object',
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
              },
              _count: {
                type: 'object',
                properties: {
                  applications: { type: 'number' }
                }
              }
            }
          },
          message: { type: 'string' }
        }
      },
      400: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  getJobs: {
    description: 'Obter lista de vagas',
    tags: ['Jobs'],
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
                description: { type: 'string' },
                slug: { type: 'string' },
                requiresResume: { type: 'boolean' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                position: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    level: { type: 'string' },
                    salaryRange: { type: 'string' }
                  }
                },
                _count: {
                  type: 'object',
                  properties: {
                    applications: { type: 'number' }
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

  getJobById: {
    description: 'Obter vaga por ID',
    tags: ['Jobs'],
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
              description: { type: 'string' },
              slug: { type: 'string' },
              requiresResume: { type: 'boolean' },
              isActive: { type: 'boolean' },
              position: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  level: { type: 'string' },
                  salaryRange: { type: 'string' }
                }
              },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    type: { type: 'string' },
                    isRequired: { type: 'boolean' },
                    order: { type: 'number' },
                    options: {
                      type: 'array',
                      items: {
                        type: 'object',
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
              },
              _count: {
                type: 'object',
                properties: {
                  applications: { type: 'number' }
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

  updateJob: {
    description: 'Atualizar vaga',
    tags: ['Jobs'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    },
    body: swaggerSchemas.UpdateJobRequest,
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
              description: { type: 'string' },
              slug: { type: 'string' },
              requiresResume: { type: 'boolean' },
              isActive: { type: 'boolean' },
              position: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  level: { type: 'string' },
                  salaryRange: { type: 'string' }
                }
              },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    type: { type: 'string' },
                    isRequired: { type: 'boolean' },
                    order: { type: 'number' },
                    options: {
                      type: 'array',
                      items: {
                        type: 'object',
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
          },
          message: { type: 'string' }
        }
      },
      400: swaggerSchemas.ErrorResponse,
      404: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  deleteJob: {
    description: 'Excluir vaga',
    tags: ['Jobs'],
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
  },

  cloneJob: {
    description: 'Clonar vaga',
    tags: ['Jobs'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    },
    body: swaggerSchemas.CloneJobRequest,
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
              description: { type: 'string' },
              slug: { type: 'string' },
              requiresResume: { type: 'boolean' },
              isActive: { type: 'boolean' },
              position: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  level: { type: 'string' },
                  salaryRange: { type: 'string' }
                }
              },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    type: { type: 'string' },
                    isRequired: { type: 'boolean' },
                    order: { type: 'number' },
                    options: {
                      type: 'array',
                      items: {
                        type: 'object',
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
          },
          message: { type: 'string' }
        }
      },
      400: swaggerSchemas.ErrorResponse,
      404: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  toggleJobStatus: {
    description: 'Alternar status da vaga (ativa/inativa)',
    tags: ['Jobs'],
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
              isActive: { type: 'boolean' }
            }
          },
          message: { type: 'string' }
        }
      },
      404: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  // Question management routes
  createJobQuestion: {
    description: 'Criar pergunta para uma vaga',
    tags: ['Questions'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        jobId: { type: 'string' }
      },
      required: ['jobId']
    },
    body: {
      type: 'object',
      required: ['label', 'type', 'isRequired', 'order'],
      properties: {
        label: { type: 'string', minLength: 1 },
        type: { 
          type: 'string',
          enum: ['SHORT_TEXT', 'LONG_TEXT', 'MULTIPLE_CHOICE', 'SINGLE_CHOICE']
        },
        isRequired: { type: 'boolean' },
        order: { type: 'number', minimum: 0 },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              value: { type: 'string' }
            }
          }
        }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              type: { type: 'string' },
              isRequired: { type: 'boolean' },
              order: { type: 'number' },
              options: { type: 'object' },
              jobId: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              job: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  slug: { type: 'string' },
                  requiresResume: { type: 'boolean' },
                  isActive: { type: 'boolean' },
                  positionId: { type: 'string' }
                }
              }
            }
          },
          message: { type: 'string' }
        }
      },
      400: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse
    }
  },

  updateJobQuestion: {
    description: 'Atualizar pergunta de uma vaga',
    tags: ['Questions'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        jobId: { type: 'string' },
        questionId: { type: 'string' }
      },
      required: ['jobId', 'questionId']
    },
    body: {
      type: 'object',
      properties: {
        label: { type: 'string', minLength: 1 },
        type: { 
          type: 'string',
          enum: ['SHORT_TEXT', 'LONG_TEXT', 'MULTIPLE_CHOICE', 'SINGLE_CHOICE']
        },
        isRequired: { type: 'boolean' },
        order: { type: 'number', minimum: 0 },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
              value: { type: 'string' }
            }
          }
        }
      }
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
              label: { type: 'string' },
              type: { type: 'string' },
              isRequired: { type: 'boolean' },
              order: { type: 'number' },
              options: { type: 'object' },
              jobId: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
              job: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  slug: { type: 'string' },
                  requiresResume: { type: 'boolean' },
                  isActive: { type: 'boolean' },
                  positionId: { type: 'string' }
                }
              }
            }
          },
          message: { type: 'string' }
        }
      },
      400: swaggerSchemas.ErrorResponse,
      401: swaggerSchemas.ErrorResponse,
      409: swaggerSchemas.ErrorResponse
    }
  },

  deleteJobQuestion: {
    description: 'Excluir pergunta de uma vaga',
    tags: ['Questions'],
    security: [{ BearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        jobId: { type: 'string' },
        questionId: { type: 'string' }
      },
      required: ['jobId', 'questionId']
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
      401: swaggerSchemas.ErrorResponse,
      409: swaggerSchemas.ErrorResponse
    }
  }
};
