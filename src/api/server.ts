import Fastify from 'fastify';
import { calculateRoutes } from './routes/calculate';

const fastify = Fastify({ logger: true });

fastify.register(calculateRoutes);

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
