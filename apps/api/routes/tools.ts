import { FastifyInstance } from "fastify";
import postgres from "postgres";
import { db } from "@ai-workforce/db";
import { tools } from "@ai-workforce/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export default async function toolsRoutes(fastify: FastifyInstance) {
  fastify.get("/v1/tools", async (req, reply) => {
    const { org_id } = (req as any).user || {
      org_id: "00000000-0000-0000-0000-000000000001",
    };

    const orgTools = await db
      .select()
      .from(tools)
      .where(eq(tools.org_id, org_id));

    return { tools: orgTools };
  });

  fastify.post("/v1/tools", async (req, reply) => {
    const { org_id } = (req as any).user || {
      org_id: "00000000-0000-0000-0000-000000000001",
    };
    const {
      name,
      description,
      endpoint,
      auth_header,
      schema,
      requires_confirmation,
      is_active,
    } = req.body as any;

    const [newTool] = await db
      .insert(tools)
      .values({
        id: uuidv4(),
        org_id,
        name,
        description,
        endpoint,
        auth_header,
        schema,
        requires_confirmation,
        is_active,
      })
      .returning();

    return { success: true, tool: newTool };
  });

  fastify.patch("/v1/tools/:id", async (req, reply) => {
    const { org_id } = (req as any).user || {
      org_id: "00000000-0000-0000-0000-000000000001",
    };
    const { id } = req.params as { id: string };
    const updateData = req.body as any;

    updateData.updated_at = new Date();

    const [updatedTool] = await db
      .update(tools)
      .set(updateData)
      .where(eq(tools.id, id))
      .returning();

    return { success: true, tool: updatedTool };
  });

  fastify.delete("/v1/tools/:id", async (req, reply) => {
    const { org_id } = (req as any).user || {
      org_id: "00000000-0000-0000-0000-000000000001",
    };
    const { id } = req.params as { id: string };

    await db.delete(tools).where(eq(tools.id, id));

    return { success: true };
  });

  fastify.post("/v1/tools/:id/test", async (req, reply) => {
    const { id } = req.params as { id: string };
    const payload = req.body;

    // Simulate testing a tool (in a real scenario, this would make an HTTP request using fetch/axios to the tool's endpoint)
    return {
      success: true,
      result: {
        status: 200,
        data: { message: "Tool executed successfully", simulated: true },
      },
    };
  });
}
