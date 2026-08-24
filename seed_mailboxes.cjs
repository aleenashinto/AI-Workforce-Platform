const postgres = require("postgres");
const crypto = require("crypto");

async function seed() {
  const connectionString =
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/ai_workforce";
  const sql = postgres(connectionString);

  try {
    console.log("Fetching an organization...");
    const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
    if (orgs.length === 0) {
      console.log("No organization found, cannot seed.");
      return;
    }
    const orgId = orgs[0].id;

    console.log("Seeding mailboxes...");
    const mailboxesData = [
      {
        id: crypto.randomUUID(),
        org_id: orgId,
        provider: "google",
        email: "alex@company.com",
        display_name: "Alex Johnson",
        credentials: "mocked_oauth_token",
        status: "healthy",
        daily_cap: 150,
        warmup_stage: 3,
        health_score: 98,
        metrics: { bounces: 1, complaints: 0, opens: 45 },
        timezone: "America/New_York",
        working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        working_hours: { start: "08:00", end: "18:00" },
      },
      {
        id: crypto.randomUUID(),
        org_id: orgId,
        provider: "microsoft",
        email: "sarah@company.com",
        display_name: "Sarah Thomas",
        credentials: "mocked_oauth_token",
        status: "warning",
        daily_cap: 150,
        warmup_stage: 3,
        health_score: 75,
        metrics: { bounces: 5, complaints: 1, opens: 12 },
        timezone: "America/Los_Angeles",
        working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        working_hours: { start: "09:00", end: "17:00" },
      },
      {
        id: crypto.randomUUID(),
        org_id: orgId,
        provider: "google",
        email: "hello@acme-demo.com",
        display_name: "Acme Sales",
        credentials: "mocked_oauth_token",
        status: "paused",
        daily_cap: 50,
        warmup_stage: 1,
        health_score: 100,
        metrics: { bounces: 0, complaints: 0, opens: 0 },
        timezone: "Europe/London",
        working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        working_hours: { start: "09:00", end: "17:00" },
      },
    ];

    for (const mb of mailboxesData) {
      await sql`
        INSERT INTO mailboxes (
          id, org_id, provider, email, display_name, credentials, status, daily_cap, 
          warmup_stage, health_score, metrics, timezone, working_days, working_hours
        ) VALUES (
          ${mb.id}, ${mb.org_id}, ${mb.provider}, ${mb.email}, ${mb.display_name}, ${mb.credentials}, 
          ${mb.status}, ${mb.daily_cap}, ${mb.warmup_stage}, ${mb.health_score}, ${mb.metrics}, 
          ${mb.timezone}, ${mb.working_days}, ${mb.working_hours}
        ) ON CONFLICT (id) DO NOTHING
      `;
    }

    console.log("Seeding mailbox activities...");
    for (let i = 0; i < 40; i++) {
      const isSent = i % 2 === 0;
      await sql`
        INSERT INTO mailbox_activities (
          id, org_id, mailbox_id, event_type, metadata
        ) VALUES (
          ${crypto.randomUUID()}, ${orgId}, ${mailboxesData[0].id}, ${isSent ? "sent" : "replied"}, 
          ${{ to: "demo@lead.com", subject: "Checking in" }}
        )
      `;
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await sql.end();
  }
}

seed();
