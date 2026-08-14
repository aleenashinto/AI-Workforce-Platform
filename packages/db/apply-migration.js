const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

console.log('DATABASE_URL:', process.env.DATABASE_URL);
const sql = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_workforce');

async function apply() {
  try {
    const migrationPath = path.join(__dirname, 'drizzle', '0008_famous_proemial_gods.sql');
    const queries = fs.readFileSync(migrationPath, 'utf8').split('--> statement-breakpoint');
    
    for (const query of queries) {
      const trimmed = query.trim();
      if (trimmed) {
        console.log('Executing:', trimmed.substring(0, 50) + '...');
        await sql.unsafe(trimmed);
      }
    }
    console.log('Migration applied successfully.');
  } catch (err) {
    console.error('Error applying migration:', err);
  } finally {
    await sql.end();
  }
}

apply();
