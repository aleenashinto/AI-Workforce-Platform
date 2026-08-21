import { db } from '@ai-workforce/db';
import { organizations, users, end_users, conversations, messages } from '@ai-workforce/db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const args = process.argv.slice(2);
  const isReset = args.includes('--reset');

  console.log("========================================");
  console.log("AI WORKFORCE DEMO DATA SEED");
  console.log("========================================");

  // 1. Get or create an organization
  let org_id = process.env.DEMO_ORG_ID || '00000000-0000-0000-0000-000000000001';
  let org;

  [org] = await db.select().from(organizations).where(eq(organizations.id, org_id)).limit(1);

  if (!org) {
    console.log("No organization found. Creating a development organization...");
    [org] = await db.insert(organizations).values({
      id: org_id,
      name: 'Development Organization',
      slug: 'dev-org-' + Date.now()
    }).returning();
  } else {
    org_id = org.id;
  }
  console.log(`Organization: ${org.name} (${org_id})`);

  // 2. Handle Reset
  if (isReset) {
    console.log("Resetting demo data...");
    // Only delete end_users created by this script (metadata->>'is_demo' = 'true')
    // Since Drizzle JSONB querying is sometimes complex, we will fetch and delete by ID
    const demoUsers = await db.select().from(end_users).where(eq(end_users.org_id, org_id));
    const demoUserIds = demoUsers.filter(u => (u.metadata as any)?.is_demo).map(u => u.id);
    
    if (demoUserIds.length > 0) {
      // Find conversations for these users
      // In our schema, visitor_id maps to end_user.id
      for (const uid of demoUserIds) {
        const userConvs = await db.select().from(conversations).where(eq(conversations.visitor_id, uid));
        for (const c of userConvs) {
          await db.delete(messages).where(eq(messages.conversation_id, c.id));
          await db.delete(conversations).where(eq(conversations.id, c.id));
        }
        await db.delete(end_users).where(eq(end_users.id, uid));
      }
    }
    console.log("Reset complete.");
  }

  // 3. Fake Data Sources
  const firstNames = ["John", "Sarah", "David", "Emily", "Michael", "Anjali", "Rahul", "Priya", "Daniel", "Sophia", "Oliver", "Emma", "Liam", "Ava", "Noah", "Isabella", "William", "Mia", "James", "Charlotte", "Logan", "Amelia", "Benjamin", "Harper", "Elijah", "Evelyn", "Lucas", "Abigail", "Mason", "Emily", "Alexander", "Elizabeth", "Ethan", "Mila", "Jacob", "Ella", "Carter", "Avery", "Sebastian", "Sofia", "Jayden", "Camila", "Matthew", "Aria", "Jack", "Scarlett", "Luke", "Victoria", "Jayce", "Madison"];
  const lastNames = ["Mathew", "Williams", "Thomas", "Johnson", "Brown", "Nair", "Menon", "Sharma", "Wilson", "Martin", "Smith", "Jones", "Taylor", "Davies", "Evans", "Moore", "White", "Harris", "Clark", "Lewis", "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers"];
  
  const scenarios = [
    { type: "Order Tracking", count: 8, msgs: [{u: "Hi, I placed my order three days ago. Can you tell me where it is?", a: "I'd be happy to check that for you. I see your order #12345 is currently in transit.", u: "Can you tell me when it will arrive?", a: "The current estimated delivery date is tomorrow.", ai: true}] },
    { type: "Refund", count: 6, msgs: [{u: "I need a refund for my last purchase.", a: "I can help with that. Could you provide the reason for the refund?", u: "It arrived damaged.", a: "I'm sorry to hear that. I have initiated the refund process.", ai: true}] },
    { type: "Payment Problem", count: 5, msgs: [{u: "My payment was charged but my order wasn't created.", a: "Let me check the payment status and order record for you.", u: "Please do, it was for $50.", a: "I found the charge. I am manually creating the order now. You will receive a confirmation shortly.", ai: false}] },
    { type: "Product Information", count: 5, msgs: [{u: "Does the pro version include API access?", a: "Yes, the Pro version includes full API access with a limit of 10k requests per day.", u: "Great, thanks!", a: "You're welcome! Let me know if you have any other questions.", ai: true}] },
    { type: "Return/Exchange", count: 5, msgs: [{u: "I received the wrong product. How can I return it?", a: "I'm sorry about that. I'll help you start the return process. Please provide your order number.", u: "Order #9876", a: "Thank you. I have emailed you the return label.", ai: false}] },
    { type: "Account/Login", count: 4, msgs: [{u: "I can't log into my account.", a: "I can help with that. Are you seeing an error message?", u: "It says invalid password.", a: "I have sent a password reset link to your email.", ai: true}] },
    { type: "Shipping Delay", count: 4, msgs: [{u: "My package is late.", a: "I apologize for the delay. Let me check the tracking.", u: "It's been stuck in transit for 3 days.", a: "I see it. It is currently at the local distribution center and should be delivered today.", ai: false}] },
    { type: "Subscription", count: 3, msgs: [{u: "How do I upgrade my subscription?", a: "You can upgrade your subscription from the billing page in your account settings.", u: "Done, thanks.", a: "Thank you for upgrading!", ai: true}] },
    { type: "Cancellation", count: 3, msgs: [{u: "I want to cancel my subscription.", a: "I can assist with that. May I ask why you are cancelling?", u: "I don't need it anymore.", a: "I understand. I have processed the cancellation.", ai: false}] },
    { type: "Technical Support", count: 3, msgs: [{u: "The app keeps crashing.", a: "I'm sorry to hear that. What version of the app are you using?", u: "Version 2.0", a: "Please try updating to the latest version, 2.1.", ai: false}] },
    { type: "Complaints", count: 2, msgs: [{u: "The service I received was terrible.", a: "I sincerely apologize for your experience. I am escalating this to our support manager.", u: "Good.", a: "A manager will reach out to you shortly.", ai: false, escalate: true}] },
    { type: "General Questions", count: 2, msgs: [{u: "What are your business hours?", a: "Our business hours are 9 AM to 5 PM EST, Monday through Friday.", u: "Thanks", a: "You're welcome!", ai: true}] }
  ];

  // Helper for random items
  const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Create 50 Users
  process.stdout.write("Creating customers...\n");
  const usersCreated = [];
  for (let i = 0; i < 50; i++) {
    const fn = random(firstNames);
    const ln = random(lastNames);
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}.demo${i}@example.com`;
    const createdAt = new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000);
    
    const [u] = await db.insert(end_users).values({
      org_id,
      name: `${fn} ${ln}`,
      email,
      external_id: `CUST-${randomInt(1000, 9999)}`,
      metadata: { is_demo: true, phone: `+1555${randomInt(1000000, 9999999)}` },
      created_at: createdAt,
      updated_at: createdAt
    }).returning();
    usersCreated.push(u);
  }
  console.log(`[####################] 50/50`);

  // Target Status Distribution: Open(active): 20, Escalated: 8, Resolved: 15, Pending(active): 7 => Total active: 27
  let statusPool = [
    ...Array(27).fill("active"),
    ...Array(8).fill("escalated"),
    ...Array(15).fill("resolved")
  ];

  const channels = ["widget", "email", "whatsapp", "api"];
  const getChannel = () => {
    const r = Math.random();
    if (r < 0.5) return "widget"; // 25
    if (r < 0.74) return "email"; // 12
    if (r < 0.9) return "whatsapp"; // 8
    return "api"; // 5
  };

  // Find human agents
  const humanUsers = await db.select().from(users).limit(5);

  process.stdout.write("Creating conversations & messages...\n");
  let convCount = 0;
  let msgCount = 0;
  
  let scenarioPool: any[] = [];
  for (const s of scenarios) {
    for (let i = 0; i < s.count; i++) {
      scenarioPool.push(s);
    }
  }
  // Shuffle scenario pool
  scenarioPool.sort(() => Math.random() - 0.5);
  statusPool.sort(() => Math.random() - 0.5);

  for (let i = 0; i < 50; i++) {
    const customer = usersCreated[i];
    const scenario = scenarioPool[i % scenarioPool.length];
    const status = statusPool[i % statusPool.length];
    const channel = getChannel();
    
    // Assignment: AI vs Human
    let assigned_to = null;
    let ai_paused = false;
    
    if (status === 'escalated' || (!scenario.msgs[0].ai && status !== 'resolved')) {
      if (humanUsers.length > 0) {
        assigned_to = random(humanUsers).id;
      }
      ai_paused = true;
    }

    const tags = [scenario.type.split(" ")[0].toLowerCase(), random(['vip', 'returning', 'urgent', 'standard'])];
    const csat_score = status === 'resolved' ? (Math.random() > 0.3 ? randomInt(3, 5).toString() : null) : null;
    
    // Timestamps
    const now = Date.now();
    let convTime = now - randomInt(1, 30) * 24 * 60 * 60 * 1000;
    if (status === 'active') {
      convTime = now - randomInt(1, 60) * 60 * 1000; // last hour
    } else if (status === 'escalated') {
      convTime = now - randomInt(1, 24) * 60 * 60 * 1000; // last day
    }

    const [conv] = await db.insert(conversations).values({
      org_id,
      visitor_id: customer.id,
      status,
      csat_score,
      tags,
      channel,
      assigned_to,
      ai_paused,
      created_at: new Date(convTime),
      updated_at: new Date(now)
    }).returning();
    convCount++;

    // Messages
    const sequence = scenario.msgs[0];
    const msgData = [
      { role: 'user', content: sequence.u },
      { role: sequence.ai ? 'assistant' : 'agent', content: sequence.a },
      { role: 'user', content: sequence.u2 || "Okay, thank you." },
      { role: sequence.ai ? 'assistant' : 'agent', content: sequence.a2 || "Is there anything else I can help you with?" },
    ];
    
    if (scenario.msgs[0].escalate || status === 'escalated') {
      msgData.push({ role: 'system', content: 'Conversation escalated to human support.' });
      msgData.push({ role: 'agent', content: 'Hi, I am taking over this conversation to assist you.' });
    } else if (status === 'resolved') {
      msgData.push({ role: 'system', content: 'Conversation resolved.' });
    }

    let msgTime = convTime;
    for (const m of msgData) {
      if (!m.content) continue;
      msgTime += randomInt(1, 5) * 60 * 1000; // 1-5 mins between messages
      
      const confidence = m.role === 'assistant' ? (randomInt(70, 99) / 100) : undefined;
      
      await db.insert(messages).values({
        conversation_id: conv.id,
        role: m.role,
        content: m.content,
        metadata: confidence ? { confidence } : null,
        created_at: new Date(msgTime)
      });
      msgCount++;
    }
  }

  console.log(`[####################] ${convCount}/${convCount}`);
  console.log(`[####################] ${msgCount}/${msgCount} messages`);

  console.log("========================================");
  console.log("SEED COMPLETE");
  console.log("========================================");
  console.log(`Customers: ${usersCreated.length}`);
  console.log(`Conversations: ${convCount}`);
  console.log(`Messages: ${msgCount}`);
  console.log("========================================");

  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
