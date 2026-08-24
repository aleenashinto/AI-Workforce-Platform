import fastify from "../server";

export default async function (req: any, res: any) {
  try {
    await fastify.ready();
    const headers = { ...req.headers };
    delete headers["content-length"];

    const response = await fastify.inject({
      method: req.method,
      url: req.url,
      headers: headers,
      payload: req.body,
      query: req.query,
    });

    for (const [key, value] of Object.entries(response.headers)) {
      if (value !== undefined) {
        res.setHeader(key, value);
      }
    }

    res.status(response.statusCode).send(response.rawPayload);
  } catch (err: any) {
    console.error("Boot Error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.end(
      JSON.stringify({
        error: "Internal Server Error during boot",
        message: err?.message || String(err),
        stack: err?.stack,
      }),
    );
  }
}
