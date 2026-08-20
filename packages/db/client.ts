import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { AsyncLocalStorage } from 'async_hooks';
import * as schema from './schema';

export const tenantContext = new AsyncLocalStorage<any>();

export const getDb = (connectionString: string) => {
  const client = postgres(connectionString);
  const baseDb = drizzle(client, { schema });

  // Proxy to use the AsyncLocalStorage transaction if one exists
  return new Proxy(baseDb, {
    get(target, prop, receiver) {
      const tx = tenantContext.getStore();
      if (tx && typeof (tx as any)[prop] !== 'undefined') {
        return Reflect.get(tx, prop, tx);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
};

// Middleware/helper to run queries as a specific tenant
export const withTenant = async <T>(
  db: ReturnType<typeof getDb>,
  orgId: string,
  callback: (tx?: any) => Promise<T>
) => {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_org_id', ${orgId}, true)`);
    // Pass tx so inner queries use the transaction
    return tenantContext.run(tx, () => callback(tx));
  });
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

export const db = getDb(connectionString);
