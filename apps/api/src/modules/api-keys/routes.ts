import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@waani/database';
import { authenticate } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error-handler.js';

const createKeySchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100),
});

export async function apiKeyRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);

  // List API Keys
  fastify.get('/', async (request, reply) => {
    const keys = await prisma.apiKey.findMany({
      where: {
        organizationId: request.organizationId,
        revokedAt: null, // Only return active non-revoked keys
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ data: keys });
  });

  // Create API Key
  fastify.post('/', async (request, reply) => {
    const body = createKeySchema.parse(request.body);

    // Generate secure random key: waani_live_<32 hex chars>
    const randomBytes = crypto.randomBytes(24).toString('hex');
    const rawKey = `waani_live_${randomBytes}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = `waani_live_${randomBytes.slice(0, 8)}...`;

    const apiKey = await prisma.apiKey.create({
      data: {
        organizationId: request.organizationId,
        name: body.name,
        keyHash,
        keyPrefix,
      },
      select: {
        id: true,
        organizationId: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
      },
    });

    return reply.status(201).send({
      apiKey,
      rawKey, // Note: This rawKey is returned only ONCE upon creation
    });
  });

  // Revoke API Key
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await prisma.apiKey.findFirst({
      where: {
        id,
        organizationId: request.organizationId, // Enforce tenant isolation
      },
    });

    if (!existing) {
      throw new AppError(404, 'API_KEY_NOT_FOUND', 'API Key not found or does not belong to your organization.');
    }

    await prisma.apiKey.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    return reply.send({ success: true, message: 'API key successfully revoked.' });
  });
}
