import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@waani/database';
import { AppError } from '../../middleware/error-handler.js';
import { authenticate } from '../../middleware/auth.js';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  organizationName: z.string().min(2).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  // Signup
  fastify.post('/signup', async (request, reply) => {
    const body = signupSchema.parse(request.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError(400, 'USER_EXISTS', 'A user with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    // Create organization and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: body.organizationName || `${body.name}'s Organization`,
        },
      });

      const user = await tx.user.create({
        data: {
          email: body.email.toLowerCase(),
          name: body.name,
          passwordHash,
          organizationId: org.id,
        },
      });

      return { user, org };
    });

    const token = fastify.jwt.sign({
      id: result.user.id,
      email: result.user.email,
      organizationId: result.org.id,
    });

    return reply.status(201).send({
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        organizationId: result.org.id,
        createdAt: result.user.createdAt,
      },
      organization: {
        id: result.org.id,
        name: result.org.name,
      },
      token,
    });
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { organization: true },
    });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const isValid = await bcrypt.compare(body.password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
    });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
      },
      token,
    });
  });

  // Current authenticated user (GET /v1/auth/me)
  fastify.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    if (request.authType === 'jwt' && request.user) {
      const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        include: { organization: true },
      });

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'User record not found.');
      }

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          organizationId: user.organizationId,
          createdAt: user.createdAt,
        },
        organization: {
          id: user.organization.id,
          name: user.organization.name,
        },
        authType: 'jwt',
      });
    }

    // Authenticated via API key
    const org = await prisma.organization.findUnique({
      where: { id: request.organizationId },
    });

    return reply.send({
      organization: org,
      authType: 'api_key',
    });
  });
}
