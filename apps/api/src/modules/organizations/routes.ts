import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { prisma } from '@waani/database';
import { authenticate } from '../../middleware/auth.js';
import { AppError } from '../../middleware/error-handler.js';

export async function organizationRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.addHook('preHandler', authenticate);

  // Get Current Organization
  fastify.get('/current', async (request, reply) => {
    const org = await prisma.organization.findUnique({
      where: { id: request.organizationId },
      include: {
        _count: {
          select: {
            users: true,
            apiKeys: { where: { revokedAt: null } },
            agents: true,
            phoneNumbers: true,
            calls: true,
          },
        },
      },
    });

    if (!org) {
      throw new AppError(404, 'ORGANIZATION_NOT_FOUND', 'Organization not found.');
    }

    return reply.send({ organization: org });
  });
}
