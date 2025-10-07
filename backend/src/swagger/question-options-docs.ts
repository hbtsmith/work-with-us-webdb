// import { swaggerSchemas } from './schemas';

export const questionOptionsSwaggerDocs = {
  getQuestionOptions: {
    description: 'Obter todas as opções de uma questão',
    tags: ['Question Options'],
    params: {
      type: 'object',
      properties: {
        questionId: { type: 'string' }
      },
      required: ['questionId']
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
                questionId: { type: 'string' },
                label: { type: 'string' },
                orderIndex: { type: 'number' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                question: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    label: { type: 'string' },
                    type: { type: 'string' }
                  }
                },
                _count: {
                  type: 'object',
                  properties: {
                    answers: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  createQuestionOption: {
    description: 'Criar nova opção para uma questão',
    tags: ['Question Options'],
    params: {
      type: 'object',
      properties: {
        questionId: { type: 'string' }
      },
      required: ['questionId']
    },
    body: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        orderIndex: { type: 'number' }
      },
      required: ['label']
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
              questionId: { type: 'string' },
              label: { type: 'string' },
              orderIndex: { type: 'number' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              question: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string' },
                  type: { type: 'string' }
                }
              }
            }
          },
          message: { type: 'string' }
        }
      }
    }
  },

  getQuestionOptionById: {
    description: 'Obter opção específica de uma questão',
    tags: ['Question Options'],
    params: {
      type: 'object',
      properties: {
        questionId: { type: 'string' },
        optionId: { type: 'string' }
      },
      required: ['questionId', 'optionId']
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
              questionId: { type: 'string' },
              label: { type: 'string' },
              orderIndex: { type: 'number' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              question: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string' },
                  type: { type: 'string' }
                }
              },
              _count: {
                type: 'object',
                properties: {
                  answers: { type: 'number' }
                }
              }
            }
          }
        }
      }
    }
  },

  updateQuestionOption: {
    description: 'Atualizar opção de uma questão',
    tags: ['Question Options'],
    params: {
      type: 'object',
      properties: {
        questionId: { type: 'string' },
        optionId: { type: 'string' }
      },
      required: ['questionId', 'optionId']
    },
    body: {
      type: 'object',
      properties: {
        label: { type: 'string' },
        orderIndex: { type: 'number' },
        isActive: { type: 'boolean' }
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
              questionId: { type: 'string' },
              label: { type: 'string' },
              orderIndex: { type: 'number' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              question: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string' },
                  type: { type: 'string' }
                }
              }
            }
          },
          message: { type: 'string' }
        }
      }
    }
  },

  deleteQuestionOption: {
    description: 'Excluir opção de uma questão',
    tags: ['Question Options'],
    params: {
      type: 'object',
      properties: {
        questionId: { type: 'string' },
        optionId: { type: 'string' }
      },
      required: ['questionId', 'optionId']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' }
        }
      }
    }
  },

  reorderQuestionOptions: {
    description: 'Reordenar opções de uma questão',
    tags: ['Question Options'],
    params: {
      type: 'object',
      properties: {
        questionId: { type: 'string' }
      },
      required: ['questionId']
    },
    body: {
      type: 'object',
      properties: {
        optionIds: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['optionIds']
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
                questionId: { type: 'string' },
                label: { type: 'string' },
                orderIndex: { type: 'number' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          },
          message: { type: 'string' }
        }
      }
    }
  },

  toggleQuestionOptionStatus: {
    description: 'Alternar status ativo/inativo de uma opção',
    tags: ['Question Options'],
    params: {
      type: 'object',
      properties: {
        questionId: { type: 'string' },
        optionId: { type: 'string' }
      },
      required: ['questionId', 'optionId']
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
              questionId: { type: 'string' },
              label: { type: 'string' },
              orderIndex: { type: 'number' },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              question: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  label: { type: 'string' },
                  type: { type: 'string' }
                }
              }
            }
          },
          message: { type: 'string' }
        }
      }
    }
  }
};
