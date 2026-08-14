import type { Config } from 'drizzle-kit';

export default {
  schema: './schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5435/ai_workforce',
  },
} satisfies Config;
