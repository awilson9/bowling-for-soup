import type { FastifyBaseLogger, FastifyPluginCallback } from 'fastify';
import z from 'zod';
import { calculateScore } from '@/core/calculate-score';
import { BowlingSequenceInputSchema } from '@/schema/bowling-sequence/schema';
import type { Logger } from '@/util/log';

const ApiLogger = (fastifyLog: FastifyBaseLogger): Logger => ({
  info: (message, details) => fastifyLog.info(details, message),
  warn: (message, details) => fastifyLog.warn(details, message),
  error: (message, error, details) => fastifyLog.error({ ...details, error }, message),
});

export const calculateRoutes: FastifyPluginCallback = (fastify) =>
  fastify.post('/calculate', async (request, reply) => {
    const requestData = z.object({ sequence: BowlingSequenceInputSchema }).safeParse(request.body);
    if (!requestData.success) {
      return reply.status(400).send({ error: requestData.error.format() });
    }
    const score = calculateScore(requestData.data.sequence, ApiLogger(fastify.log));
    return reply.status(200).send({ score });
  });
