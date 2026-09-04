import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { errorHandler } from './middleware/error-handler.js';
import { authRoutes } from './modules/auth/routes.js';
import { apiKeyRoutes } from './modules/api-keys/routes.js';
import { organizationRoutes } from './modules/organizations/routes.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
    },
    disableRequestLogging: false,
  });

  // 1. CORS
  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : [env.CORS_ORIGIN],
    credentials: true,
  });

  // 2. JWT Plugin
  await app.register(jwt, {
    secret: env.JWT_SECRET,
  });

  // 3. Rate Limiting (100 reqs/min as per PRD Section 59)
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // 4. Request ID Middleware
  app.addHook('onRequest', requestIdMiddleware);

  // 5. Global Error Handler
  app.setErrorHandler(errorHandler);

  // 6. Health Check
  app.get('/health', async (_req, _reply) => {
    return {
      status: 'healthy',
      service: 'waani-api',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
    };
  });

  // 7. Register API Routes
  await app.register(authRoutes, { prefix: '/v1/auth' });
  await app.register(apiKeyRoutes, { prefix: '/v1/api-keys' });
  await app.register(organizationRoutes, { prefix: '/v1/organizations' });

  return app;
}

async function start() {
  try {
    const app = await buildApp();
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`🚀 Waani API Server running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    console.error('Fatal error starting Waani API:', err);
    process.exit(1);
  }
}

// Start if executed directly
if (process.argv[1]?.endsWith('server.ts') || process.argv[1]?.endsWith('server.js')) {
  start();
}
