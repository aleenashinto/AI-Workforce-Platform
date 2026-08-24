const postgres = require('postgres');
const { randomUUID } = require('crypto');

async function seedSalesAnalytics() {
  const sqlClient = postgres(process.env.DATABASE_URL || 'postgres://postgres:postgres@127.0.0.1:5435/ai_workforce', { max: 1 });
  
  try {
    const orgs = await sqlClient`SELECT id FROM organizations LIMIT 1`;
    const users = await sqlClient`SELECT id FROM users LIMIT 1`;
    const org_id = orgs[0]?.id || '00000000-0000-0000-0000-000000000001';
    const owner_id = users[0]?.id || '00000000-0000-0000-0000-000000000002';
    
    console.log('Seeding sales analytics data for org:', org_id);

    const mailboxes = await sqlClient`SELECT id, email FROM mailboxes WHERE org_id = ${org_id}`;
    if (mailboxes.length === 0) {
      console.log('No mailboxes found. Please run seed_mailboxes.cjs first.');
      process.exit(1);
    }
    const sequences = await sqlClient`SELECT id, name FROM sequences WHERE org_id = ${org_id}`;
    if (sequences.length === 0) {
      console.log('No sequences found. Please run seed_sequences_final.cjs first.');
      process.exit(1);
    }

    const totalLeads = 1200;
    const now = new Date();
    const sources = ['Lead Discovery', 'Website', 'Referral', 'Import'];
    const sourcesWeights = [0.4, 0.3, 0.1, 0.2];
    
    function weightedRandom(items, weights) {
      const r = Math.random();
      let sum = 0;
      for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (r <= sum) return items[i];
      }
      return items[items.length - 1];
    }
    
    const allLeads = [];
    const qualifiedLeads = [];
    const positiveLeads = [];
    
    const industries = ['SaaS', 'FinTech', 'Healthcare', 'E-commerce', 'Education'];
    
    console.log(`Generating ${totalLeads} leads...`);
    
    for (let i = 0; i < totalLeads; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (Math.random() * 24 * 60 * 60 * 1000));
      
      const leadId = randomUUID();
      const source = weightedRandom(sources, sourcesWeights);
      const industry = industries[Math.floor(Math.random() * industries.length)];
      const isQualified = Math.random() < 0.5;
      const status = isQualified ? 'qualified' : 'new';
      
      const lead = {
        id: leadId,
        org_id: org_id,
        name: `Demo Lead ${i}`,
        email: `lead${i}@demo.com`,
        status: status,
        source: source,
        score: Math.floor(Math.random() * 100),
        owner_id: owner_id,
        created_at: createdAt,
        metadata: { industry }
      };
      
      allLeads.push(lead);
      if (isQualified) qualifiedLeads.push(lead);
    }
    
    for (let i = 0; i < allLeads.length; i += 500) {
      const chunk = allLeads.slice(i, i + 500);
      await sqlClient`
        INSERT INTO leads ${sqlClient(chunk, 'id', 'org_id', 'name', 'email', 'status', 'source', 'score', 'owner_id', 'created_at', 'metadata')}
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log(`Inserted ${allLeads.length} leads.`);
    
    console.log('Generating mailbox activities...');
    const activities = [];
    
    for (const lead of qualifiedLeads) {
      if (Math.random() < 0.88) { // contacted
        const seq = sequences[Math.floor(Math.random() * sequences.length)];
        const mb = mailboxes[Math.floor(Math.random() * mailboxes.length)];
        const emailCount = 1 + Math.floor(Math.random() * 3);
        let lastEmailDate = lead.created_at;
        let repliedToThisLead = false;
        
        for (let e = 0; e < emailCount; e++) {
          const sentDate = new Date(lastEmailDate.getTime() + (1 + Math.random() * 3) * 24 * 60 * 60 * 1000);
          if (sentDate > now) break;
          
          activities.push({
            id: randomUUID(),
            org_id: org_id,
            mailbox_id: mb.id,
            lead_id: lead.id,
            sequence_id: seq.id,
            event_type: 'sent',
            metadata: null,
            created_at: sentDate
          });
          
          activities.push({
            id: randomUUID(),
            org_id: org_id,
            mailbox_id: mb.id,
            lead_id: lead.id,
            sequence_id: seq.id,
            event_type: 'delivered',
            metadata: null,
            created_at: new Date(sentDate.getTime() + 5000)
          });
          
          lastEmailDate = sentDate;
          
          if (!repliedToThisLead && Math.random() < 0.1) {
            repliedToThisLead = true;
            const replyDate = new Date(sentDate.getTime() + (Math.random() * 24 * 60 * 60 * 1000));
            if (replyDate < now) {
              const isPositive = Math.random() < 0.45;
              if (isPositive) positiveLeads.push(lead);
              
              activities.push({
                id: randomUUID(),
                org_id: org_id,
                mailbox_id: mb.id,
                lead_id: lead.id,
                sequence_id: seq.id,
                event_type: 'replied',
                metadata: { classification: isPositive ? 'positive' : 'negative' },
                created_at: replyDate
              });
              break;
            }
          } else if (Math.random() < 0.02) {
            activities.push({
              id: randomUUID(),
              org_id: org_id,
              mailbox_id: mb.id,
              lead_id: lead.id,
              sequence_id: seq.id,
              event_type: 'bounced',
              metadata: null,
              created_at: new Date(sentDate.getTime() + 10000)
            });
            break;
          }
        }
      }
    }
    
    for (let i = 0; i < activities.length; i += 1000) {
      const chunk = activities.slice(i, i + 1000);
      await sqlClient`
        INSERT INTO mailbox_activities ${sqlClient(chunk, 'id', 'org_id', 'mailbox_id', 'lead_id', 'sequence_id', 'event_type', 'metadata', 'created_at')}
        ON CONFLICT (id) DO NOTHING
      `;
    }
    console.log(`Inserted ${activities.length} mailbox activities.`);
    
    const meetings = [];
    const opportunities = [];
    
    console.log('Generating meetings and opportunities...');
    for (const lead of positiveLeads) {
      if (Math.random() < 0.5) {
        const meetingDate = new Date(lead.created_at.getTime() + (5 + Math.random() * 10) * 24 * 60 * 60 * 1000);
        if (meetingDate < now) {
          meetings.push({
            id: randomUUID(),
            org_id: org_id,
            owner_id: owner_id,
            status: 'scheduled',
            type: 'Discovery',
            created_at: meetingDate
          });
          
          if (Math.random() < 0.4) {
            const oppDate = new Date(meetingDate.getTime() + (1 + Math.random() * 3) * 24 * 60 * 60 * 1000);
            if (oppDate < now) {
              const isWon = Math.random() < 0.35;
              let stage = 'Qualified';
              if (isWon) stage = 'Won';
              else if (Math.random() < 0.3) stage = 'Lost';
              else stage = ['Demo', 'Proposal', 'Negotiation'][Math.floor(Math.random() * 3)];
              
              const value = 5000 + Math.floor(Math.random() * 45000);
              opportunities.push({
                id: randomUUID(),
                org_id: org_id,
                lead_id: lead.id,
                owner_id: owner_id,
                name: `Opportunity for ${lead.name}`,
                value: value,
                stage: stage,
                created_at: oppDate
              });
            }
          }
        }
      }
    }
    
    if (meetings.length > 0) {
      await sqlClient`
        INSERT INTO meetings ${sqlClient(meetings, 'id', 'org_id', 'owner_id', 'status', 'type', 'created_at')}
        ON CONFLICT (id) DO NOTHING
      `;
    }
    
    if (opportunities.length > 0) {
      await sqlClient`
        INSERT INTO opportunities ${sqlClient(opportunities, 'id', 'org_id', 'lead_id', 'owner_id', 'name', 'value', 'stage', 'created_at')}
        ON CONFLICT (id) DO NOTHING
      `;
    }
    
    console.log(`Inserted ${meetings.length} meetings and ${opportunities.length} opportunities.`);
    console.log('Seeding complete!');
    await sqlClient.end();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedSalesAnalytics();
