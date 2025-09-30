import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { errorHandler } from '@/middlewares/errorHandler';
import { authRoutes } from '@/routes/auth';
import { jobRoutes } from '@/routes/jobs';
import { positionRoutes } from '@/routes/positions';
import { applicationRoutes } from '@/routes/applications';
import { adminRoutes } from '@/routes/admin';
import { questionOptionRoutes } from '@/routes/questionOptions';
import { i18n } from '@/i18n/i18n';
import { InitService } from '@/services/initService';

/**
 * Follow SOLID principles
 * DRY (Don't Repeat Yourself)
 * Single Responsibility Principle
 * Open/Closed Principle
 * Always use i18n for error messages or return messages
 * Always use ErrorHandler for error handling
 */

export function buildApp() {
  return Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
    },
  });
}

export async function buildTestApp() {
  const app = buildApp();
  
  // Configure for testing
  app.log.level = 'error'; // Reduce log noise in tests
  
  // Register plugins
  await registerPlugins(app);
  await registerRoutes(app);
  
  // Prepare the app for testing (don't start listening)
  await app.ready();
  
  return app;
}

const fastify = buildApp();

// Register plugins
async function registerPlugins(app = fastify) {
  // Initialize i18n
  i18n.setLocale((process.env['DEFAULT_LOCALE'] as any) || 'pt_BR');
  
  // Add hook to serialize dates
  app.addHook('preSerialization', async (_request, _reply, payload) => {
    if (payload && typeof payload === 'object') {
      return JSON.parse(JSON.stringify(payload, (_key, value) => {
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      }));
    }
    return payload;
  });
  
  // Security
  await app.register(helmet);
  
  await app.register(cors, {
    origin: process.env['NODE_ENV'] === 'production' 
      ? ['https://yourdomain.com'] 
      : true,
    credentials: true,
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // JWT
  await app.register(jwt, {
    secret: process.env['JWT_SECRET'] || 'fallback-secret-key',
  });

  // Multipart for file uploads
  await app.register(multipart, {
    limits: {
      fileSize: parseInt(process.env['MAX_FILE_SIZE'] || '5242880'), // 5MB
    },
  });

  // Swagger documentation
  await app.register(swagger, {
    swagger: {
      info: {
        title: 'Work With Us API',
        description: 'API for job application system',
        version: '1.0.0',
      },
      host: 'localhost:3001',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        BearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Enter your bearer token in the format **Bearer &lt;token>**',
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });
}

// Register routes
async function registerRoutes(app = fastify) {
  // Public routes
  await app.register(applicationRoutes, { prefix: '/api/applications' });
  await app.register(jobRoutes, { prefix: '/api/jobs' });
  
  // Protected routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(adminRoutes, { prefix: '/api/admin' });
  await app.register(positionRoutes, { prefix: '/api/positions' });
  await app.register(questionOptionRoutes, { prefix: '/api/questions' });
}

// Error handler
fastify.setErrorHandler(errorHandler);

async function start() {
  try {
    // Initialize database and ensure admin exists
    await InitService.initialize();
    
    await registerPlugins();
    await registerRoutes();
    
    const port = parseInt(process.env['PORT'] || '3000');
    const host = process.env['NODE_ENV'] === 'production' ? '0.0.0.0' : 'localhost';
    
    await fastify.listen({ port, host });
    
    console.log(`🚀 Server running on http://${host}:${port}`);
    console.log(`📚 API Documentation available at http://${host}:${port}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});

start();
