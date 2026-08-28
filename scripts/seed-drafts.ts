import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const ORG = "00000000-0000-0000-0000-000000000001";

async function main() {
  console.log("?? Seeding drafts and draft versions...");

  // Get some active users and leads to associate drafts with
  const users = await sql.unsafe(`SELECT id FROM users LIMIT 2`);
  const leads = await sql.unsafe(`SELECT id, name, company FROM leads WHERE org_id = '${ORG}' LIMIT 5`);

  if (users.length === 0 || leads.length === 0) {
    console.error("Please run the lead and user seeds first!");
    await sql.end();
    process.exit(1);
  }

  const userId = users[0].id;
  
  // Clean existing drafts for the demo org to avoid duplicate key or junk build up
  await sql.unsafe(`DELETE FROM draft_versions WHERE org_id = '${ORG}'`);
  await sql.unsafe(`DELETE FROM drafts WHERE org_id = '${ORG}'`);

  const sampleDrafts = [
    {
      id: uuidv4(),
      title: `Cold Email - ${leads[0].name}`,
      type: "email",
      subject: `Quick question about Engineering at ${leads[0].company}`,
      body: `Hi ${leads[0].name},\n\nI saw that you are managing engineering at ${leads[0].company}. Given your focus, I wanted to reach out regarding automation platforms.\n\nWould you be open to a quick chat next week?\n\nBest,\nSales Team`,
      lead_id: leads[0].id,
      status: "draft",
    },
    {
      id: uuidv4(),
      title: `Research Report - ${leads[1].company}`,
      type: "research_report",
      subject: `Buying Signals for ${leads[1].company}`,
      body: `Company Research Summary:\n- Active hiring: Yes\n- Recent Funding: Series A ($15M)\n- Technology Stack: AWS, React, Python\n\nPersonalization Hooks:\n1. Congratulations on your recent funding round!\n2. I noticed you are expanding your engineering division in Seattle.\n3. Your current compliance stack could benefit from automation.`,
      lead_id: leads[1].id,
      status: "in_review",
    },
    {
      id: uuidv4(),
      title: `Support Auto-Response - Ticket #108`,
      type: "support_response",
      subject: `Re: How do I change my billing info?`,
      body: `Hello,\n\nBased on our documentation, you can update your billing details by navigating to Settings > Billing and clicking 'Update Payment Method'.\n\nLet us know if you need anything else.\n\nAI Assistant`,
      lead_id: leads[2].id,
      status: "approved",
    },
  ];

  for (const d of sampleDrafts) {
    // 1. Insert Draft
    await sql.unsafe(`
      INSERT INTO drafts (id, org_id, title, type, owner_id, lead_id, status, subject, body, version_number)
      VALUES (
        '${d.id}',
        '${ORG}',
        '${d.title.replace(/'/g, "''")}',
        '${d.type}',
        '${userId}',
        '${d.lead_id}',
        '${d.status}',
        '${d.subject.replace(/'/g, "''")}',
        '${d.body.replace(/'/g, "''")}',
        2
      )
    `);

    // 2. Insert Draft Versions
    const v1Id = uuidv4();
    const v2Id = uuidv4();
    await sql.unsafe(`
      INSERT INTO draft_versions (id, org_id, draft_id, version_number, subject, body, created_by, change_type)
      VALUES
        ('${v1Id}', '${ORG}', '${d.id}', 1, 'Initial Subject Line', 'Initial draft body content before changes.', '${userId}', 'manual_save'),
        ('${v2Id}', '${ORG}', '${d.id}', 2, '${d.subject.replace(/'/g, "''")}', '${d.body.replace(/'/g, "''")}', '${userId}', 'manual_save')
    `);
  }

  console.log("? Successfully seeded 3 drafts with version histories!");
  await sql.end();
  process.exit(0);
}

main().catch(e => {
  console.error("Error seeding drafts:", e.message);
  process.exit(1);
});
