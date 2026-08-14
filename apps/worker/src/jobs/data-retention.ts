import { Job } from 'bullmq';
import { db, withTenant } from 'db/client';
import { organizations, audit_logs, messages, conversations, leads } from 'db/schema';
import { eq, lt, sql } from 'drizzle-orm';
import { subDays } from 'date-fns';

export default async function dataRetentionProcessor(job: Job) {
  job.log(`Starting Data Retention Job...`);
  
  // Find organizations with retention_days set
  const orgs = await db.select({ id: organizations.id, retention_days: organizations.retention_days }).from(organizations).where(sql`retention_days IS NOT NULL`);
  
  for (const org of orgs) {
    if (!org.retention_days) continue;
    
    const cutoffDate = subDays(new Date(), parseInt(org.retention_days.toString(), 10));
    
    job.log(`Processing org ${org.id}, cutoff date: ${cutoffDate.toISOString()}`);
    
    await withTenant(db, org.id, async (tx) => {
      // 1. Delete old messages
      // We would ideally fetch old conversation IDs first to delete messages, but this is simplified for the stub
      await tx.execute(sql`
        DELETE FROM ${messages}
        USING ${conversations}
        WHERE ${messages.conversation_id} = ${conversations.id}
          AND ${conversations.org_id} = ${org.id}
          AND ${messages.created_at} < ${cutoffDate.toISOString()}
      `);
      
      // 2. Delete old conversations
      await tx.delete(conversations)
        .where(sql`${conversations.org_id} = ${org.id} AND ${conversations.created_at} < ${cutoffDate.toISOString()}`);
        
      // 3. Delete old audit logs
      await tx.delete(audit_logs)
        .where(sql`${audit_logs.org_id} = ${org.id} AND ${audit_logs.created_at} < ${cutoffDate.toISOString()}`);
    });
  }
  
  job.log('Data retention job completed.');
}
