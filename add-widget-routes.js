const fs = require('fs');
const p = 'apps/api/routes/agent.ts';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  "import { conversations, messages } from '@ai-workforce/db/schema';",
  "import { conversations, messages, organizations } from '@ai-workforce/db/schema';"
);

const endpoints = `
  fastify.get('/widget-config', async (req, reply) => {
    const { org_id } = (req as any).user;
    const [org] = await db.select().from(organizations).where(eq(organizations.id, org_id)).limit(1);
    if (!org) return reply.status(404).send({ error: 'Org not found' });
    const settings: any = org.settings || {};
    return { success: true, config: settings.widgetConfig || {} };
  });

  fastify.post('/widget-config', async (req, reply) => {
    const { org_id } = (req as any).user;
    const body = req.body as any;
    
    const [org] = await db.select().from(organizations).where(eq(organizations.id, org_id)).limit(1);
    if (!org) return reply.status(404).send({ error: 'Org not found' });

    const settings: any = org.settings || {};
    settings.widgetConfig = { ...settings.widgetConfig, ...body };

    await db.update(organizations).set({ settings }).where(eq(organizations.id, org_id));
    return { success: true, config: settings.widgetConfig };
  });
`;

c = c.replace(
  'export default async function agentRoutes(fastify: FastifyInstance) {',
  'export default async function agentRoutes(fastify: FastifyInstance) {\n' + endpoints
);

fs.writeFileSync(p, c);
