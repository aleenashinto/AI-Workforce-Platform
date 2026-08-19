import * as dotenv from 'dotenv';
dotenv.config();

import fastify from '../server';

export default async function (req: any, res: any) {
  await fastify.ready();
  fastify.server.emit('request', req, res);
}
