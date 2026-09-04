import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(error: FastifyError | AppError | Error, request: FastifyRequest, reply: FastifyReply) {
  const requestId = request.requestId || (request.headers['x-request-id'] as string) || 'unknown';

  request.log.error({
    err: error,
    requestId,
    url: request.raw.url,
    method: request.raw.method,
  }, 'Request error occurred');

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        requestId,
        details: error.details,
      },
    });
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or query parameters',
        requestId,
        details: error.flatten(),
      },
    });
  }

  const fastifyErr = error as FastifyError;
  const statusCode = fastifyErr.statusCode || 500;
  const code = fastifyErr.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');

  return reply.status(statusCode).send({
    error: {
      code,
      message: fastifyErr.message || 'An unexpected internal server error occurred',
      requestId,
    },
  });
}
