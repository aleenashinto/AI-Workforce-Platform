import fastify from 'fastify';

const app = fastify();

app.post('/test', async (req, reply) => {
  console.log("Body is:", req.body);
  return { success: true };
});

async function run() {
  await app.ready();
  const response = await app.inject({
    method: 'POST',
    url: '/test',
    headers: {
      'content-type': 'application/json'
    },
    payload: { hello: "world" }
  });
  console.log(response.statusCode);
  console.log(response.body);
}

run();
