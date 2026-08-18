import { FastifyRequest, FastifyReply } from 'fastify';
import postgres from 'postgres';
import { db } from '@ai-workforce/db';
import { memberships, membership_roles } from '@ai-workforce/db/schema';
import { eq, and } from 'drizzle-orm';
import { authorize, Action } from '@ai-workforce/core';

/**
 * Loads the membership roles for the current user from the database,
 * attaches them to `request.user.roles`, and optionally enforces an action.
 */
export async function loadUserRoles(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const user = (request as any).user;
  if (!user?.user_id || !user?.org_id) {
    reply.code(401).send({ error: 'Unauthorized' });
    return;
  }

  try {
    // Load this user's membership roles for the org
    const rows = await db
      .select({ role: membership_roles.role })
      .from(membership_roles)
      .innerJoin(memberships, eq(memberships.id, membership_roles.membership_id))
      .where(
        and(
          eq(memberships.user_id, user.user_id),
          eq(memberships.org_id, user.org_id)
        )
      );

    user.roles = rows.map(r => r.role);
  } catch {
    // In dev mode or if DB is down, fall back to legacy role
    user.roles = user.role ? [user.role] : ['viewer'];
  }
}

/**
 * Factory: creates a Fastify preHandler that loads roles then enforces the action.
 */
export function requireAction(action: Action) {
  return async function authzHook(request: FastifyRequest, reply: FastifyReply) {
    await loadUserRoles(request, reply);
    const user = (request as any).user;

    // Dev mock: grant admin if no DB
    if (!user.roles || user.roles.length === 0) {
      user.roles = ['admin'];
    }

    if (!authorize(user.roles, action)) {
      reply.code(403).send({ error: 'Forbidden', action });
    }
  };
}
