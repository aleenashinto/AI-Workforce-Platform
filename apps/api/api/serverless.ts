export default async function (req: any, res: any) {
  try {
    const fastifyModule = await import('../server');
    const fastify = fastifyModule.default;
    await fastify.ready();
    fastify.server.emit('request', req, res);
  } catch (err: any) {
    console.error("Boot Error:", err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(JSON.stringify({ 
      error: "Internal Server Error during boot", 
      message: err?.message || String(err),
      stack: err?.stack
    }));
  }
}
