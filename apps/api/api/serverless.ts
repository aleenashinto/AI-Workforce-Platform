import * as dotenv from 'dotenv';
dotenv.config();

import fastify from '../server';

export default async function (req: any, res: any) {
  try {
    await fastify.ready();
    fastify.server.emit('request', req, res);
  } catch (err: any) {
    console.error("Fastify Ready Error:", err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({ error: "Internal Server Error during boot", details: err?.message || String(err) }));
  }
}
