import { FastifyInstance, FastifyRequest } from 'fastify';
import { db } from '@ai-workforce/db';
import { organizations, organization_invitations, memberships } from '@ai-workforce/db/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

interface JwtUser {
  user_id: string;
  org_id: string;
  roles: string[];
}

export default async function onboardingRoutes(fastify: FastifyInstance) {
  // All onboarding routes require auth
  fastify.addHook('preHandler', async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  fastify.get('/state', async (req: FastifyRequest, reply) => {
    const user = req.user as JwtUser;
    if (!user || !user.org_id) return reply.status(401).send({ error: 'Unauthorized' });

    const [org] = await db.select().from(organizations).where(eq(organizations.id, user.org_id)).limit(1);
    if (!org) return reply.status(404).send({ error: 'Organization not found' });
    
    return reply.send({
      success: true,
      data: {
        name: org.name,
        settings: org.settings || {}
      }
    });
  });

  fastify.post('/organization', async (req: FastifyRequest, reply) => {
    const user = req.user as JwtUser;
    if (!user || !user.org_id) return reply.status(401).send({ error: 'Unauthorized' });

    const { name, website, industry, size, country, timezone } = req.body as any;

    if (!name || name.trim() === '') {
      return reply.status(400).send({ error: 'Organization name is required' });
    }

    if (website && !website.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)) {
       return reply.status(400).send({ error: 'Invalid website URL format' });
    }

    const [org] = await db.select().from(organizations).where(eq(organizations.id, user.org_id)).limit(1);
    if (!org) return reply.status(404).send({ error: 'Organization not found' });

    const settings = {
      ...(org.settings as any || {}),
      website: website || '',
      industry: industry || '',
      size: size || '',
      country: country || '',
      timezone: timezone || ''
    };

    await db.update(organizations)
      .set({ name: name.trim(), settings })
      .where(eq(organizations.id, user.org_id));

    return reply.send({ success: true, message: 'Organization updated' });
  });

  fastify.post('/modules', async (req: FastifyRequest, reply) => {
    const user = req.user as JwtUser;
    if (!user || !user.org_id) return reply.status(401).send({ error: 'Unauthorized' });

    const { support, sales } = req.body as any;

    const [org] = await db.select().from(organizations).where(eq(organizations.id, user.org_id)).limit(1);
    if (!org) return reply.status(404).send({ error: 'Organization not found' });

    const settings = {
      ...(org.settings as any || {}),
      modules: { support: !!support, sales: !!sales }
    };

    await db.update(organizations)
      .set({ settings })
      .where(eq(organizations.id, user.org_id));

    return reply.send({ success: true, message: 'Modules updated' });
  });

  fastify.post('/team', async (req: FastifyRequest, reply) => {
    const user = req.user as JwtUser;
    if (!user || !user.org_id) return reply.status(401).send({ error: 'Unauthorized' });

    const { invites } = req.body as any; // Array of { email, role }

    if (!Array.isArray(invites)) {
      return reply.status(400).send({ error: 'Invites must be an array' });
    }

    const validRoles = ['owner', 'admin', 'agent', 'viewer'];
    const newInvites = [];

    // Filter out empty emails before validating
    const validInvites = invites.filter(inv => inv.email && inv.email.trim() !== '');

    for (const inv of validInvites) {
      if (!inv.email.includes('@') || !inv.email.includes('.')) {
        return reply.status(400).send({ error: `Invalid email: ${inv.email}` });
      }
      if (!validRoles.includes(inv.role)) {
        return reply.status(400).send({ error: `Invalid role: ${inv.role}` });
      }
      
      const token = crypto.randomBytes(32).toString('hex');
      newInvites.push({
        org_id: user.org_id,
        email: inv.email.toLowerCase().trim(),
        role: inv.role,
        token: token,
        invited_by: user.user_id,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    }

    if (newInvites.length > 0) {
      // Check for existing pending invitations for these emails in this org
      const existingInvites = await db.select({ email: organization_invitations.email })
        .from(organization_invitations)
        .where(eq(organization_invitations.org_id, user.org_id));
        
      const existingEmails = new Set(existingInvites.map(i => i.email));
      
      const filteredNewInvites = newInvites.filter(i => !existingEmails.has(i.email));

      if (filteredNewInvites.length > 0) {
        await db.insert(organization_invitations).values(filteredNewInvites as any[]);
      }
    }

    return reply.send({ success: true, message: 'Invitations sent' });
  });

  fastify.post('/preferences', async (req: FastifyRequest, reply) => {
    const user = req.user as JwtUser;
    if (!user || !user.org_id) return reply.status(401).send({ error: 'Unauthorized' });

    const { role } = req.body as any;
    
    if (role) {
      await db.update(memberships)
        .set({ role })
        .where(and(eq(memberships.user_id, user.user_id), eq(memberships.org_id, user.org_id)));
    }

    return reply.send({ success: true, message: 'Preferences updated' });
  });

  fastify.post('/complete', async (req: FastifyRequest, reply) => {
    const user = req.user as JwtUser;
    if (!user || !user.org_id) return reply.status(401).send({ error: 'Unauthorized' });
    
    const [org] = await db.select().from(organizations).where(eq(organizations.id, user.org_id)).limit(1);
    if (!org) return reply.status(404).send({ error: 'Organization not found' });

    const settings = {
      ...(org.settings as any || {}),
      onboarding_completed: true
    };

    await db.update(organizations)
      .set({ settings })
      .where(eq(organizations.id, user.org_id));

    return reply.send({ success: true, message: 'Onboarding completed' });
  });
}
