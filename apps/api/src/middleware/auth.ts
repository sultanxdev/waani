import { FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import { prisma } from '@waani/database';
import { AppError } from './error-handler.js';

declare module 'fastify' {
  interface FastifyRequest {
    organizationId: string;
    authType: 'api_key' | 'jwt';
    user?: {
      id: string;
      email: string;
      organizationId: string;
    };
  }
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header. Provide Bearer token or API key.');
  }

  const token = authHeader.substring(7).trim();

  // 1. Check if it's an API Key (waani_live_...)
  if (token.startsWith('waani_live_')) {
    const keyHash = hashApiKey(token);
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
    });

    if (!apiKey || apiKey.revokedAt) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid or revoked API key.');
    }

    // Update lastUsedAt asynchronously
    prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    }).catch((err) => {
      request.log.warn({ err }, 'Failed to update API key lastUsedAt');
    });

    request.organizationId = apiKey.organizationId;
    request.authType = 'api_key';
    return;
  }

  // 2. JWT Dashboard Token
  try {
    const decoded = await request.jwtVerify<{ id: string; email: string; organizationId: string }>();
    request.user = decoded;
    request.organizationId = decoded.organizationId;
    request.authType = 'jwt';
  } catch (err) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired session token.');
  }
}
