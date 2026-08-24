const { sql } = require("postgres");
const postgres = require("postgres");

async function seed() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/ai_workforce";
  const sqlClient = postgres(connectionString);

  try {
    const orgs = await sqlClient`SELECT id FROM organizations LIMIT 1`;
    const users = await sqlClient`SELECT id FROM users LIMIT 1`;

    if (orgs.length === 0) return console.log("No org");

    const org_id = orgs[0].id;
    const user_id = users.length > 0 ? users[0].id : null;

    for (let i = 1; i <= 10; i++) {
      await sqlClient`
        INSERT INTO drafts (org_id, owner_id, title, subject, type, source_type, body, status, version_number)
        VALUES (${org_id}, ${user_id}, 'Sales Outreach to Acme Corp ' || ${i}, 'Partnership Opportunity ' || ${i}, 'email', 'lead', 'Hi, I am reaching out to discuss a potential partnership...', 'draft', 1)
      `;
    }

    for (let i = 1; i <= 10; i++) {
      await sqlClient`
        INSERT INTO drafts (org_id, owner_id, title, subject, type, source_type, body, status, version_number)
        VALUES (${org_id}, ${user_id}, 'Research Report: Market Trends ' || ${i}, 'Market Trends ' || ${i}, 'research_report', 'research', 'The market is experiencing a significant shift...', 'in_review', 1)
      `;
    }

    for (let i = 1; i <= 10; i++) {
      await sqlClient`
        INSERT INTO drafts (org_id, owner_id, title, subject, type, source_type, body, status, version_number)
        VALUES (${org_id}, ${user_id}, 'Support Response: Billing Issue ' || ${i}, 'Re: Billing Issue ' || ${i}, 'support_response', 'support', 'Hello, we have processed your refund...', 'approved', 1)
      `;
    }

    console.log("Seeding successful!");
  } catch (error) {
    console.error("Seeding failed", error);
  } finally {
    await sqlClient.end();
  }
}

seed();
