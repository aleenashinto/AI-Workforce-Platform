import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['server.ts', 'api/serverless.ts'],
  format: ['cjs'],
  splitting: false,
  sourcemap: true,
  clean: true,
  noExternal: ['@ai-workforce/db', '@ai-workforce/llm', '@ai-workforce/core'],
});