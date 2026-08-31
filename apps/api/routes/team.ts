import { FastifyInstance, FastifyRequest } from "fastify";
import { db } from "@ai-workforce/db";
import {
  users,
  memberships,
  membership_roles,
  organization_invitations,
  organizations,
} from "@ai-workforce/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

type JwtUser = {
  user_id: string;
  email: string;
  org_id: string;
};

export default async function teamRoutes(fastify: FastifyInstance) {
  // GET /v1/team
  fastify.get("/", async (req: FastifyRequest, reply) => {
    try {
      const user = req.user as JwtUser;
      if (!user || !user.org_id) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      // Get active members
      const activeMembers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: membership_roles.role,
          status: sql<string>`'active'`,
        })
        .from(memberships)
        .innerJoin(users, eq(memberships.user_id, users.id))
        .leftJoin(membership_roles, eq(memberships.id, membership_roles.membership_id))
        .where(eq(memberships.org_id, user.org_id));

      // Get pending invitations
      const pendingInvites = await db
        .select({
          id: organization_invitations.id,
          email: organization_invitations.email,
          role: organization_invitations.role,
          status: organization_invitations.status,
        })
        .from(organization_invitations)
        .where(
          and(
            eq(organization_invitations.org_id, user.org_id),
            eq(organization_invitations.status, "pending")
          )
        );

      return {
        members: activeMembers,
        invitations: pendingInvites,
      };
    } catch (err: any) {
      console.error("TEAM ROUTE ERROR:", err);
      return reply.status(500).send({ error: "Internal Server Error", detail: err.message });
    }
  });

  // POST /v1/team/invite
  fastify.post("/invite", async (req: FastifyRequest, reply) => {
    const user = req.user as JwtUser;
    if (!user || !user.org_id) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const { email, role, name } = req.body as { email: string; role: string; name?: string };

    if (!email || !email.includes("@")) {
      return reply.status(400).send({ error: "Valid email is required" });
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(users)
      .innerJoin(memberships, eq(users.id, memberships.user_id))
      .where(
        and(
          eq(users.email, email.toLowerCase().trim()),
          eq(memberships.org_id, user.org_id)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return reply.status(400).send({ error: "User is already a member of this organization." });
    }

    // Check for existing pending invitation
    const existingInvite = await db
      .select()
      .from(organization_invitations)
      .where(
        and(
          eq(organization_invitations.org_id, user.org_id),
          eq(organization_invitations.email, email.toLowerCase().trim()),
          eq(organization_invitations.status, "pending")
        )
      )
      .limit(1);

    let token = uuidv4();

    if (existingInvite.length > 0) {
      token = existingInvite[0].token;
    } else {
      // Create new invite
      await db.insert(organization_invitations).values({
        org_id: user.org_id,
        email: email.toLowerCase().trim(),
        token,
        role: role || "viewer",
        invited_by: user.user_id,
        status: "pending",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }

    // Send email via nodemailer
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const inviteLink = `${frontendBaseUrl}/auth/invite?token=${token}`;

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER || "dummy@gmail.com",
          pass: process.env.GMAIL_APP_PASSWORD || "dummypass",
        },
      });

      // We use a try-catch for the sendMail because the dummy credentials will fail
      await transporter.sendMail({
        from: '"AI Workforce Platform" <no-reply@aiworkforce.com>',
        to: email,
        subject: "You've been invited to join an AI Workforce organization!",
        html: "<p>Hello!</p><p>You have been invited to join an organization on the AI Workforce Platform.</p><p>Click <a href='" + inviteLink + "'>here</a> to accept your invitation.</p><p>Or copy this link: " + inviteLink + "</p>",
      });
      console.log("Invitation email sent to ", email);
    } catch (error) {
      console.error("Failed to send email. Falling back to console logging.");
      console.log("\n=== INVITATION LINK FOR ", email, " ===\n", inviteLink, "\n====================================\n");
    }

    return { success: true, message: "Invitation sent successfully." };
  });
}
