import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import postgres from "postgres";
import { v4 as uuidv4 } from "uuid";
const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
const ORG = "00000000-0000-0000-0000-000000000001";

async function main() {
  console.log("?? Seeding missing demo data...");

  // -- 1. ICPs ---------------------------------------------------------------
  const icp1 = uuidv4();
  const icp2 = uuidv4();
  await sql.unsafe(`
    INSERT INTO icps (id, org_id, name, description, status, criteria, disqualifiers, persona, match_rate, performance_metrics)
    VALUES
      ('${icp1}', '${ORG}', 'SaaS Growth Companies', 'B2B SaaS companies 50-500 employees actively scaling', 'active',
       '{"industries":["SaaS","FinTech","AI"],"companySize":["50-200","200-500"],"geography":["North America","Europe"],"revenue":["$1M-$10M","$10M-$50M"],"technologies":["Salesforce","HubSpot","AWS"],"funding":["Series A","Series B"],"growth":"20%+"}',
       '["Government","Non-profit","Education"]',
       '{"titles":["CTO","VP Engineering","Head of Product","Engineering Manager"],"seniority":["Director","VP","C-Suite"],"departments":["Engineering","Product","IT"]}',
       '78', '{"companies_discovered":1240,"matched_companies":967,"qualified_leads":312,"opportunities":48,"won_deals":12}'),
      ('${icp2}', '${ORG}', 'Enterprise FinTech', 'Enterprise financial technology companies 500+ employees', 'draft',
       '{"industries":["FinTech","Banking","Insurance"],"companySize":["500-1000","1000+"],"geography":["North America","UK"],"revenue":["$50M+"],"technologies":["AWS","Azure","Kubernetes"]}',
       '["Startups","Retail"]',
       '{"titles":["CTO","CISO","VP Technology"],"seniority":["C-Suite","VP"],"departments":["Technology","Security"]}',
       '62', '{"companies_discovered":340,"matched_companies":211,"qualified_leads":87,"opportunities":14,"won_deals":3}')
    ON CONFLICT DO NOTHING
  `);
  console.log("? ICPs seeded");

  // -- 2. Mailboxes ----------------------------------------------------------
  const mb1 = uuidv4(); const mb2 = uuidv4(); const mb3 = uuidv4();
  await sql.unsafe(`
    INSERT INTO mailboxes (id, org_id, provider, email, display_name, credentials, status, daily_cap, warmup_stage, health_score, metrics, timezone, working_days, working_hours, tracking_settings)
    VALUES
      ('${mb1}', '${ORG}', 'gmail', 'outreach@novastack.ai', 'Outreach - NovaStack', 'bW9ja19jcmVk', 'connected', '150', '5', '96', '{"bounces":2,"complaints":0,"opens":847}', 'America/New_York', '["Monday","Tuesday","Wednesday","Thursday","Friday"]', '{"start":"08:00","end":"17:00"}', '{"opens":true,"clicks":true}'),
      ('${mb2}', '${ORG}', 'gmail', 'sales@novastack.ai', 'Sales - NovaStack', 'bW9ja19jcmVk', 'connected', '100', '3', '88', '{"bounces":5,"complaints":1,"opens":423}', 'America/Los_Angeles', '["Monday","Tuesday","Wednesday","Thursday","Friday"]', '{"start":"09:00","end":"18:00"}', '{"opens":true,"clicks":false}'),
      ('${mb3}', '${ORG}', 'gmail', 'alex.j@novastack.ai', 'Alex Johnson', 'bW9ja19jcmVk', 'warming', '50', '2', '72', '{"bounces":1,"complaints":0,"opens":89}', 'UTC', '["Monday","Tuesday","Wednesday","Thursday","Friday"]', '{"start":"09:00","end":"17:00"}', '{"opens":true,"clicks":true}')
    ON CONFLICT DO NOTHING
  `);
  console.log("? Mailboxes seeded");

  // -- 3. Sequences ----------------------------------------------------------
  const seq1 = uuidv4(); const seq2 = uuidv4(); const seq3 = uuidv4();
  await sql.unsafe(`
    INSERT INTO sequences (id, org_id, name, description, status, mailbox_id, settings)
    VALUES
      ('${seq1}', '${ORG}', 'SaaS Cold Outreach v2', '7-step sequence for SaaS engineering leaders', 'active', '${mb1}',
       '{"timezone":"America/New_York","working_days":["Monday","Tuesday","Wednesday","Thursday","Friday"],"daily_limit":50,"track_opens":true,"track_clicks":true}'),
      ('${seq2}', '${ORG}', 'FinTech Enterprise Nurture', '5-step nurture for FinTech enterprise', 'active', '${mb2}',
       '{"timezone":"America/New_York","working_days":["Monday","Tuesday","Wednesday","Thursday","Friday"],"daily_limit":30,"track_opens":true,"track_clicks":true}'),
      ('${seq3}', '${ORG}', 'Warm Leads Re-engagement', 'Revive stalled deals', 'paused', '${mb1}',
       '{"timezone":"UTC","working_days":["Monday","Tuesday","Wednesday","Thursday","Friday"],"daily_limit":20,"track_opens":true,"track_clicks":false}')
    ON CONFLICT DO NOTHING
  `);

  // Sequence Steps
  await sql.unsafe(`
    INSERT INTO sequence_steps (id, sequence_id, day_offset, channel, template, name, type)
    VALUES
      ('${uuidv4()}', '${seq1}', 0, 'email', 'Hi {{first_name}}, saw you are scaling engineering at {{company}}...', 'Step 1: Introduction', 'email'),
      ('${uuidv4()}', '${seq1}', 3, 'email', 'Hi {{first_name}}, just following up...', 'Step 2: Follow-up', 'email'),
      ('${uuidv4()}', '${seq1}', 5, 'linkedin', 'Sent you a LinkedIn request', 'Step 3: LinkedIn Connect', 'linkedin'),
      ('${uuidv4()}', '${seq1}', 7, 'email', 'Last one from me...', 'Step 4: Breakup', 'email'),
      ('${uuidv4()}', '${seq2}', 0, 'email', 'Hi {{first_name}}, I saw {{company}} is expanding...', 'Step 1: Value Prop', 'email'),
      ('${uuidv4()}', '${seq2}', 4, 'email', 'Hi {{first_name}}, companies like yours typically see...', 'Step 2: Social Proof', 'email'),
      ('${uuidv4()}', '${seq2}', 8, 'email', 'Hi {{first_name}}, here is a relevant case study...', 'Step 3: Case Study', 'email'),
      ('${uuidv4()}', '${seq3}', 0, 'email', 'Hi {{first_name}}, it has been a while...', 'Step 1: Checking In', 'email'),
      ('${uuidv4()}', '${seq3}', 5, 'email', 'Hi {{first_name}}, we just launched something...', 'Step 2: Product Update', 'email')
    ON CONFLICT DO NOTHING
  `);
  console.log("? Sequences & Steps seeded");

  // -- 4. Mailbox Activities (outreach history) ------------------------------
  const leadRows = await sql.unsafe(`SELECT id FROM leads WHERE org_id = '${ORG}' LIMIT 40`);
  let actCount = 0;
  const now = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(now); date.setDate(date.getDate() - d);
    const dailyCount = Math.floor(Math.random() * 20) + 10; // 10-30 per day
    for (let i = 0; i < dailyCount && i < leadRows.length; i++) {
      const lead = leadRows[Math.floor(Math.random() * leadRows.length)];
      const mb = [mb1, mb2, mb3][Math.floor(Math.random() * 3)];
      const seq = [seq1, seq2][Math.floor(Math.random() * 2)];
      const evType = d > 20 ? "sent" : d > 15 ? (Math.random() > 0.3 ? "delivered" : "bounced") : (Math.random() > 0.6 ? "opened" : (Math.random() > 0.7 ? "replied" : "sent"));
      const actId = uuidv4();
      await sql.unsafe(`
        INSERT INTO mailbox_activities (id, org_id, mailbox_id, lead_id, sequence_id, event_type, metadata, created_at)
        VALUES ('${actId}', '${ORG}', '${mb}', '${lead.id}', '${seq}', '${evType}', '{}', '${date.toISOString()}')
        ON CONFLICT DO NOTHING
      `);
      actCount++;
    }
  }
  console.log(`? Mailbox activities seeded: ${actCount} events`);

  // -- 5. Sequence Enrollments -----------------------------------------------
  let enrollCount = 0;
  for (let i = 0; i < Math.min(leadRows.length, 30); i++) {
    const lead = leadRows[i];
    const seq = i < 20 ? seq1 : seq2;
    const statuses = ["active","completed","replied","bounced"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const enrId = uuidv4();
    await sql.unsafe(`
      INSERT INTO sequence_enrollments (id, org_id, sequence_id, lead_id, status, current_step, created_at)
      VALUES ('${enrId}', '${ORG}', '${seq}', '${lead.id}', '${status}', ${Math.floor(Math.random()*3)+1}, NOW() - INTERVAL '${Math.floor(Math.random()*20)} days')
      ON CONFLICT DO NOTHING
    `);
    enrollCount++;
  }
  console.log(`? Sequence enrollments seeded: ${enrollCount}`);

  // -- 6. Final counts -------------------------------------------------------
  for (const t of ["icps","mailboxes","sequences","mailbox_activities","sequence_enrollments"]) {
    const r = await sql.unsafe(`SELECT COUNT(*) as cnt FROM ${t} WHERE org_id = '${ORG}'`);
    console.log(`  ${t}: ${r[0].cnt}`);
  }

  await sql.end(); process.exit(0);
}
main().catch(e => { console.error(e.message); process.exit(1); });
