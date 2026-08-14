import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

export const getDb = (connectionString: string) => {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
};

// Middleware/helper to run queries as a specific tenant
export const withTenant = async <T>(
  db: ReturnType<typeof getDb>,
  orgId: string,
  callback: (tx: any) => Promise<T>
) => {
  return db.transaction(async (tx) => {
    // Set the local variable for RLS
    await tx.execute(sql`SET LOCAL app.current_org_id = ${orgId}`);
    return callback(tx);
  });
};

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5435/ai_workforce';
export const db = getDb(connectionString);
