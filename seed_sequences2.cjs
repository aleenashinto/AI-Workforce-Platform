const postgres = require('postgres');
const crypto = require('crypto');

async function seed() {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_workforce';
  const sqlClient = postgres(connectionString);

  try {
    const orgs = await sqlClient\SELECT id FROM organizations LIMIT 1\;
    const users = await sqlClient\SELECT id FROM users LIMIT 1\;
    const leads = await sqlClient\SELECT id FROM leads LIMIT 10\;
    
    if (orgs.length === 0) return console.log("No org");
    if (leads.length === 0) return console.log("No leads to enroll");
    
    const org_id = orgs[0].id;
    const user_id = users.length > 0 ? users[0].id : null;

    console.log("Seeding sequences...");

    // Create 3 demo sequences
    const seqs = [
      { id: crypto.randomUUID(), name: 'Enterprise SaaS Outbound — Q3', status: 'active', goal: 'Generate qualified sales meetings from enterprise SaaS leads.' },
      { id: crypto.randomUUID(), name: 'Inbound Lead Nurture', status: 'paused', goal: 'Nurture leads who downloaded the whitepaper.' },
      { id: crypto.randomUUID(), name: 'No Response Follow-up', status: 'draft', goal: 'Re-engage dead leads.' }
    ];

    for (const s of seqs) {
      await sqlClient\
        INSERT INTO sequences (id, org_id, name, description, goal, status, version)
        VALUES (\, \, \, 'Demo sequence', \, \, 1)
      \;

      // Add steps
      await sqlClient\
        INSERT INTO sequence_steps (id, sequence_id, day_offset, name, type, channel, template)
        VALUES (\, \, 0, 'Initial Outreach', 'email', 'email', 'Subject: Hi\nBody: Hello')
      \;
      await sqlClient\
        INSERT INTO sequence_steps (id, sequence_id, day_offset, name, type, channel, template)
        VALUES (\, \, 2, 'Wait 2 Days', 'wait', 'wait', '')
      \;
      await sqlClient\
        INSERT INTO sequence_steps (id, sequence_id, day_offset, name, type, channel, template)
        VALUES (\, \, 2, 'AI Follow-up', 'ai_email', 'email', 'Subject: Follow up\nBody: AI Generated')
      \;

      // Add enrollments
      if (s.status !== 'draft') {
        let currentStep = 0;
        let status = 'active';
        for (let i = 0; i < leads.length; i++) {
          if (i === 1) status = 'replied';
          else if (i === 2) status = 'completed';
          else status = s.status === 'paused' ? 'paused' : 'active';
          
          await sqlClient\
            INSERT INTO sequence_enrollments (id, org_id, sequence_id, lead_id, status, current_step)
            VALUES (\, \, \, \, \, \)
          \;
          currentStep = (currentStep + 1) % 3;
        }
      }
    }

    console.log("Seeding successful!");
  } catch (error) {
    console.error("Seeding failed", error);
  } finally {
    await sqlClient.end();
  }
}

seed();
