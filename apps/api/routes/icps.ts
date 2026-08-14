import { FastifyInstance } from 'fastify';
import { db } from '@ai-workforce/db';
import { icps } from '@ai-workforce/db/schema';
import { eq } from 'drizzle-orm';
import { generateStructured } from '@ai-workforce/llm';
import { z } from 'zod';

const ICPSchema = z.object({
  industries: z.array(z.string()),
  companySize: z.array(z.string()),
  geography: z.array(z.string()),
  keywords: z.array(z.string()),
  targetTitles: z.array(z.string()),
  valueProp: z.string(),
  proofPoints: z.string()
});

const PersonaSchema = z.object({
  titles: z.array(z.string()),
  seniority: z.array(z.string()),
  departments: z.array(z.string()),
});

export default async function icpRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    // Mock user/org extraction
    const orgId = '00000000-0000-0000-0000-000000000000'; 
    const list = await db.query.icps.findMany({
      where: eq(icps.org_id, orgId)
    });
    return reply.send({ data: list });
  });

  fastify.post('/', async (request, reply) => {
    const orgId = '00000000-0000-0000-0000-000000000000';
    const body = request.body as any;

    const [inserted] = await db.insert(icps).values({
      org_id: orgId,
      name: body.name,
      criteria: body.criteria,
      disqualifiers: body.disqualifiers,
      persona: body.persona
    }).returning();

    return reply.status(201).send({ data: inserted });
  });

  fastify.post('/generate', async (request, reply) => {
    // AI-assisted path
    const body = request.body as { url: string; customerDomains: string[] };
    
    const systemPrompt = `You are a B2B sales expert. Propose an Ideal Customer Profile (ICP) based on the provided company URL and existing customer domains.`;
    const userPrompt = `URL: ${body.url}\nCustomers: ${body.customerDomains.join(', ')}`;

    const criteria = await generateStructured('deep', systemPrompt, userPrompt, ICPSchema);
    
    // Propose persona separately for simplicity
    const personaSysPrompt = `Propose the buyer persona (titles, seniority, departments) for B2B sales to the ICP defined below:\n\n${JSON.stringify(criteria)}`;
    const persona = await generateStructured('deep', personaSysPrompt, 'Generate persona', PersonaSchema);

    return reply.send({
      data: {
        criteria,
        persona,
        disqualifiers: ["Competitors", "Existing Customers"]
      }
    });
  });
}
