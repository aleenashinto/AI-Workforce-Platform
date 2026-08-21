import { FastifyInstance } from 'fastify';
import { db } from '@ai-workforce/db';
import { knowledge_gaps, conversations, users } from '@ai-workforce/db/schema';
import { eq, sql, and, gte, lte, desc } from 'drizzle-orm';

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.get('/analytics/support-overview', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      if (!(request as any).user) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }
    }
    const org_id = (request as any).user.org_id;
    if (!org_id) return reply.status(400).send({ error: 'org_id required' });

    const { start_date, end_date } = request.query as { start_date?: string, end_date?: string };
    
    // Build date filter
    const conditions = [eq(conversations.org_id, org_id)];
    if (start_date) conditions.push(gte(conversations.created_at, new Date(start_date)));
    if (end_date) conditions.push(lte(conversations.created_at, new Date(end_date)));
    const whereClause = and(...conditions);

    try {
      // 1. KPIs
      const totalConvRes = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(conversations).where(whereClause);
      const totalConversations = totalConvRes[0].count || 0;

      const aiRes = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(conversations)
        .where(and(whereClause, eq(conversations.status, 'resolved'), sql`${conversations.assigned_to} IS NULL`));
      const aiResolved = aiRes[0].count || 0;

      const deflectionRate = totalConversations > 0 ? (aiResolved / totalConversations) * 100 : 0;

      const escRes = await db.select({ count: sql<number>`cast(count(*) as integer)` }).from(conversations)
        .where(and(whereClause, eq(conversations.status, 'escalated')));
      const escalated = escRes[0].count || 0;

      const csatRes = await db.select({ avg: sql<number>`avg(cast(${conversations.csat_score} as float))` }).from(conversations).where(whereClause);
      const csat = csatRes[0].avg || 0;

      const timeRes = await db.select({ 
        avgSeconds: sql<number>`avg(extract(epoch from (${conversations.updated_at} - ${conversations.created_at})))` 
      }).from(conversations)
        .where(and(whereClause, eq(conversations.status, 'resolved')));
      const avgResolutionTime = timeRes[0].avgSeconds || 0;

      // 2. Channel Distribution
      const channelRes = await db.select({
        channel: conversations.channel,
        count: sql<number>`cast(count(*) as integer)`
      }).from(conversations).where(whereClause).groupBy(conversations.channel);

      const channelDistribution = channelRes.map(c => ({
        name: c.channel,
        value: c.count
      }));

      // 3. Conversation Volume (daily)
      const volumeRes = await db.select({
        date: sql<string>`to_char(${conversations.created_at}, 'YYYY-MM-DD')`,
        count: sql<number>`cast(count(*) as integer)`
      }).from(conversations).where(whereClause).groupBy(sql`to_char(${conversations.created_at}, 'YYYY-MM-DD')`).orderBy(sql`1`);

      const conversationVolume = volumeRes.map(v => ({
        date: v.date,
        count: v.count
      }));

      // 4. Recent Conversations (latest 5)
      const recent = await db.select().from(conversations).where(whereClause).orderBy(desc(conversations.created_at)).limit(5);
      
      const recentConversations = await Promise.all(recent.map(async (c) => {
        let agentName = 'AI Support Agent';
        if (c.assigned_to) {
          const ag = await db.select({ name: users.name }).from(users).where(eq(users.id, c.assigned_to)).limit(1);
          if (ag.length > 0) agentName = ag[0].name || 'Human Agent';
        }
        return {
          id: c.id,
          customer: c.visitor_id || 'Unknown Customer',
          channel: c.channel,
          status: c.status,
          confidence: null, 
          time: c.created_at,
          agent: agentName
        };
      }));

      return reply.send({
        success: true,
        data: {
          overview: {
            totalConversations,
            aiResolved,
            deflectionRate,
            escalated,
            csat,
            avgResolutionTime,
            costPerConversation: null
          },
          conversationVolume,
          channelDistribution,
          recentConversations
        }
      });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Failed to aggregate analytics' });
    }
  });

  fastify.get('/analytics/knowledge-gaps', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      if (!(request as any).user) return reply.status(401).send({ error: 'Unauthorized' });
    }
    const org_id = (request as any).user.org_id;
    if (!org_id) return reply.status(400).send({ error: 'org_id required' });

    try {
      const gaps = await db.query.knowledge_gaps.findMany({
        where: eq(knowledge_gaps.org_id, org_id),
        orderBy: (gaps, { desc }) => [desc(gaps.occurrence_count)],
        limit: 5,
      });
      return reply.send({ success: true, data: gaps });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({ error: 'Failed to fetch knowledge gaps' });
    }
  });
}
