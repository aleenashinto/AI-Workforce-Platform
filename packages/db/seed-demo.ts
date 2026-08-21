import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { v4 as uuidv4 } from 'uuid';
import { eq, sql } from 'drizzle-orm';
import * as schema from './schema';

const DB_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ai_workforce';
const sqlClient = postgres(DB_URL, { max: 1 });
const db = drizzle(sqlClient, { schema });

const ORG_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_TAG = 'seed:ai-workforce-demo-v1';

async function generateDemoData() {
  console.log('🌱 Starting Demo Data Seed for AI Customer Support...');

  // Set the RLS context so we can insert data
  await sqlClient`SELECT set_config('app.current_org_id', ${ORG_ID}, false)`;

  console.log('1. Checking for existing demo data...');
  const existingUsers = await db.select({ id: schema.end_users.id }).from(schema.end_users).where(sql`metadata->>'demo' = ${DEMO_TAG}`);
  if (existingUsers.length > 0) {
    console.log('⚠️  Demo data already exists! Safely skipping to avoid duplicates.');
    console.log('   To recreate, you must safely delete records with metadata->>demo = "seed:ai-workforce-demo-v1".');
    process.exit(0);
  }

  // --- 1. KNOWLEDGE BASE ---
  console.log('2. Creating Knowledge Base Sources and Documents...');
  const kbData = [
    { source: { type: 'text', name: 'Shipping Policy' }, doc: { title: 'Shipping Timeframes', content: 'Standard shipping takes 3-5 business days. International shipping takes 7-14 business days.' } },
    { source: { type: 'text', name: 'Refund Policy' }, doc: { title: 'Refund Processing Time', content: 'Refunds normally take 5-7 business days after the return has been approved and received.' } },
    { source: { type: 'text', name: 'Return Policy' }, doc: { title: '30-Day Returns', content: 'Customers can return products within 30 days of delivery. Items must be in original condition.' } },
    { source: { type: 'text', name: 'Payment Methods' }, doc: { title: 'Accepted Payments', content: 'We accept Visa, MasterCard, American Express, PayPal, and Apple Pay.' } },
    { source: { type: 'text', name: 'Subscription Plans' }, doc: { title: 'Upgrading Plans', content: 'To upgrade your plan, navigate to Account Settings > Billing > Change Plan. Upgrades are prorated immediately.' } },
    { source: { type: 'text', name: 'Discount Policy' }, doc: { title: 'Stacking Coupons', content: 'Customers cannot combine multiple discount coupons on a single order. Only one promo code per transaction is allowed.' } },
    { source: { type: 'text', name: 'Order Tracking' }, doc: { title: 'Tracking Link', content: 'Customers can track their order using the tracking link included in the shipping confirmation email.' } },
    { source: { type: 'text', name: 'Warranty Policy' }, doc: { title: '1-Year Warranty', content: 'All our hardware products come with a 1-year limited warranty covering manufacturing defects.' } },
    { source: { type: 'text', name: 'Delivery FAQ' }, doc: { title: 'Changing Delivery Address', content: 'Delivery addresses can be changed before an order is shipped. Once an order has shipped, customers must contact support for assistance.' } },
    { source: { type: 'text', name: 'International FAQ' }, doc: { title: 'Customs Duties', content: 'International orders may be subject to import taxes and customs duties, which are the responsibility of the recipient.' } }
  ];

  const sourceMap = new Map();
  for (const item of kbData) {
    const [source] = await db.insert(schema.knowledge_sources).values({
      id: uuidv4(),
      org_id: ORG_ID,
      type: item.source.type,
      name: item.source.name,
      status: 'ready',
      config: { text: item.doc.content, demo: DEMO_TAG },
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    }).returning();

    await db.insert(schema.knowledge_documents).values({
      id: uuidv4(),
      org_id: ORG_ID,
      source_id: source.id,
      title: item.doc.title,
      content_hash: `demo-hash-${source.id}`,
      sync_status: 'ready',
      metadata: { demo: DEMO_TAG }
    });
    sourceMap.set(item.source.name, source.id);
  }

  // --- 2. CUSTOMERS ---
  console.log('3. Creating 50 Demo Customers (End Users)...');
  const firstNames = ['Olivia', 'Daniel', 'Sophia', 'Liam', 'Emma', 'Noah', 'Ava', 'William', 'Isabella', 'James', 'Mia', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia', 'Henry', 'Harper', 'Alexander', 'Evelyn', 'Michael'];
  const lastNames = ['Carter', 'Wilson', 'Anderson', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Taylor', 'Moore', 'Jackson'];
  const countries = ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'India', 'Singapore', 'UAE'];
  
  const customerIds = [];
  for (let i = 0; i < 50; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    const [customer] = await db.insert(schema.end_users).values({
      id: uuidv4(),
      org_id: ORG_ID,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}.demo${i}@example.com`,
      metadata: { phone: `+1555${Math.floor(1000000 + Math.random() * 9000000)}`, country, demo: DEMO_TAG },
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    }).returning();
    
    customerIds.push(customer.id);
  }

  // --- 3. CONVERSATIONS & MESSAGES ---
  console.log('4. Creating 100 Demo Conversations & Messages...');
  
  const topics = [
    { title: 'Where is my order?', channel: 'widget', trigger: 'Order tracking' },
    { title: 'Refund request', channel: 'email', trigger: 'Refund' },
    { title: 'Item arrived damaged', channel: 'whatsapp', trigger: 'Return' },
    { title: 'Cannot login to my account', channel: 'widget', trigger: 'Account login' },
    { title: 'How to upgrade subscription', channel: 'widget', trigger: 'Subscription' },
    { title: 'Change delivery address', channel: 'email', trigger: 'Change delivery address' },
    { title: 'Discount code not working', channel: 'widget', trigger: 'Coupon' },
    { title: 'Need an invoice for tax', channel: 'email', trigger: 'Invoice' },
    { title: 'International shipping times', channel: 'widget', trigger: 'International shipping' },
    { title: 'Cryptocurrency payment', channel: 'widget', trigger: 'Payment' }, // Intended Knowledge Gap
    { title: 'Gift subscription transfer', channel: 'email', trigger: 'Subscription' } // Intended Knowledge Gap
  ];

  const statuses = ['active', 'active', 'active', 'escalated', 'resolved', 'resolved', 'resolved', 'resolved', 'active'];
  const now = Date.now();

  for (let i = 0; i < 100; i++) {
    const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const createdAt = new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000);
    const isResolved = status === 'resolved';

    const [conv] = await db.insert(schema.conversations).values({
      id: uuidv4(),
      org_id: ORG_ID,
      visitor_id: customerId,
      status: status,
      channel: topic.channel,
      tags: [topic.trigger, 'demo'],
      csat_score: isResolved ? (Math.random() > 0.2 ? String(Math.floor(Math.random() * 2) + 4) : String(Math.floor(Math.random() * 3) + 1)) : null,
      created_at: createdAt,
      updated_at: updatedAt
    }).returning();

    // Generate Messages
    let msgTime = createdAt.getTime();
    const addMessage = async (role: string, content: string) => {
      msgTime += 1000 * 60 * (1 + Math.random() * 10);
      await db.insert(schema.messages).values({
        id: uuidv4(),
        conversation_id: conv.id,
        role: role,
        content: content,
        created_at: new Date(msgTime)
      });
    };

    // Scenario A: AI Answers Successfully
    if (topic.trigger === 'Refund') {
      await addMessage('customer', 'Hi, I sent back my item. How long does a refund take?');
      await addMessage('ai', 'Refunds normally take 5-7 business days after the return has been approved and received.');
      if (status === 'resolved') {
        await addMessage('customer', 'Thank you!');
      }
    } 
    else if (topic.trigger === 'Change delivery address') {
      await addMessage('customer', 'Can I change my delivery address? The order has already shipped.');
      await addMessage('ai', 'Delivery addresses can be changed before an order is shipped. Once an order has shipped, customers must contact support for assistance.');
      if (status === 'escalated') {
        await addMessage('customer', 'I need help changing it then, it shipped to the wrong place!');
        await addMessage('ai', 'I am transferring you to a human agent who can help contact the courier.');
        await addMessage('agent', 'Hi, I can help you with this. I will contact the courier to request a redirect.');
      }
    }
    // Scenario B: Knowledge Gap (Cryptocurrency)
    else if (topic.trigger === 'Payment') {
      await addMessage('customer', 'Do you accept Bitcoin or other cryptocurrency?');
      await addMessage('ai', 'I am sorry, but I do not have enough information to reliably answer that question. Let me connect you with a human agent.');
      if (status === 'resolved') {
        await addMessage('agent', 'Hi! Currently, we only accept credit cards and PayPal. We do not support cryptocurrency payments at this time.');
      }
    }
    // Generic Fallback
    else {
      await addMessage('customer', `Hello, I have a question regarding: ${topic.title}`);
      await addMessage('ai', 'I am reviewing your request and will assist you shortly.');
      await addMessage('agent', 'Hello! How can I help you with this today?');
    }
  }

  // --- 4. KNOWLEDGE GAPS ---
  console.log('5. Creating Knowledge Gaps...');
  const gaps = [
    { q: 'Do you accept Bitcoin or cryptocurrency?', count: 18, status: 'open' },
    { q: 'Can I transfer my gift subscription to someone else?', count: 12, status: 'open' },
    { q: 'Are there partial refunds for annual plans?', count: 9, status: 'open' },
    { q: 'How do I change my billing date?', count: 24, status: 'resolved' },
    { q: 'Can I pause my subscription while on vacation?', count: 15, status: 'open' },
    { q: 'Is there a military or student discount?', count: 42, status: 'open' },
    { q: 'Can I ship to an APO/FPO box?', count: 7, status: 'open' },
    { q: 'Do you offer bulk order discounts?', count: 11, status: 'resolved' },
    { q: 'How can I request a custom invoice with my VAT number?', count: 19, status: 'open' },
    { q: 'Is the product compatible with older models?', count: 5, status: 'dismissed' }
  ];

  for (const gap of gaps) {
    await db.insert(schema.knowledge_gaps).values({
      id: uuidv4(),
      org_id: ORG_ID,
      question: gap.q,
      occurrence_count: String(gap.count),
      status: gap.status,
      created_at: new Date(now - Math.random() * 15 * 24 * 60 * 60 * 1000)
    });
  }

  console.log('✅ Demo data successfully seeded!');
  console.log('   Run your app to view the new data in the AI Customer Support module.');
  process.exit(0);
}

generateDemoData().catch(e => {
  console.error('Failed to seed demo data:', e);
  process.exit(1);
});
