/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

// Swagger schemas and documentation
export { swaggerSchemas } from './schemas';
export { authSwaggerDocs } from './auth-docs';
export { positionsSwaggerDocs } from './positions-docs';
export { jobsSwaggerDocs } from './jobs-docs';
export { applicationsSwaggerDocs } from './applications-docs';
export { adminSwaggerDocs } from './admin-docs';
export { questionOptionsSwaggerDocs } from './question-options-docs';

// Re-export common types for convenience
export type SwaggerSchema = {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  format?: string;
  minLength?: number;
};

export type SwaggerResponse = {
  type: string;
  properties?: Record<string, any>;
};

export type SwaggerEndpoint = {
  description: string;
  tags: string[];
  body?: SwaggerSchema;
  security?: Array<{ BearerAuth: any[] }>;
  response: Record<number, SwaggerResponse>;
};
