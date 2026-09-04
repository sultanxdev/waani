import { FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';

declare module 'fastify' {
  interface FastifyRequest {
    requestId: string;
  }
}

export async function requestIdMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const reqId = (request.headers['x-request-id'] as string) || `req_${uuidv4().replace(/-/g, '').slice(0, 16)}`;
  request.requestId = reqId;
  reply.header('x-request-id', reqId);
}
