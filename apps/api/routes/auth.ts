import { FastifyInstance } from 'fastify';
import { db } from '@ai-workforce/db';
import { users, organizations, memberships, membership_roles, organization_invitations, password_reset_tokens, email_verification_tokens } from '@ai-workforce/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import oauthPlugin from '@fastify/oauth2';
import crypto from 'crypto';

export default async function authRoutes(fastify: FastifyInstance) {
  // Register Google OAuth2
  fastify.register(oauthPlugin, {
    name: 'googleOAuth2',
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
        secret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret'
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION
    },
    startRedirectPath: '/auth/google/login',
    callbackUri: 'http://localhost:3001/auth/google/callback',
    scope: ['profile', 'email']
  });

  // Register Microsoft OAuth2
  fastify.register(oauthPlugin, {
    name: 'microsoftOAuth2',
    credentials: {
      client: {
        id: process.env.MICROSOFT_CLIENT_ID || 'dummy-microsoft-client-id',
        secret: process.env.MICROSOFT_CLIENT_SECRET || 'dummy-microsoft-client-secret'
      },
      auth: oauthPlugin.MICROSOFT_CONFIGURATION
    },
    startRedirectPath: '/auth/microsoft/login',
    callbackUri: 'http://localhost:3001/auth/microsoft/callback',
    scope: ['User.Read']
  });

  const handleOAuthCallback = async (req: any, reply: any, token: any, provider: string, fetchProfileUrl: string, profileMapper: (data: any) => { id: string, email: string, name: string }) => {
    try {
      const response = await fetch(fetchProfileUrl, {
        headers: { Authorization: `Bearer ${token.access_token}` }
      });
      const data = await response.json();
      
      const profile = profileMapper(data);
      const authProviderId = `${provider}:${profile.id}`;

      // Check if user exists
      let [user] = await db.select().from(users).where(eq(users.auth_provider_id, authProviderId)).limit(1);

      if (!user) {
        // Fallback to check by email (in case they signed up another way first)
        [user] = await db.select().from(users).where(eq(users.email, profile.email)).limit(1);

        if (!user) {
          // Create new user
          const [newUser] = await db.insert(users).values({
            email: profile.email,
            name: profile.name,
            auth_provider_id: authProviderId
          }).returning();
          user = newUser;

          // Auto-provision an organization and membership
          const [org] = await db.insert(organizations).values({
            name: `${profile.name || 'User'}'s Workspace`,
            slug: `workspace-${user.id.slice(0,8)}`,
          }).returning();

          const [membership] = await db.insert(memberships).values({
            org_id: org.id,
            user_id: user.id
          }).returning();

          // Assign owner role
          await db.insert(membership_roles).values({
            membership_id: membership.id,
            role: 'owner'
          });
        } else {
          // Update existing user with auth_provider_id
          await db.update(users).set({ auth_provider_id: authProviderId }).where(eq(users.id, user.id));
        }
      }

      // Find their first membership to use as active org
      const [membership] = await db.select().from(memberships).where(eq(memberships.user_id, user.id)).limit(1);
      
      const roles = await db.select({ role: membership_roles.role })
        .from(membership_roles)
        .where(eq(membership_roles.membership_id, membership.id));

      const payload = {
        user_id: user.id,
        org_id: membership.org_id,
        roles: roles.map(r => r.role)
      };

      const jwtToken = fastify.jwt.sign(payload);

      // Set cookie and redirect to dashboard
      reply.setCookie('auth_token', jwtToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return reply.redirect(process.env.FRONTEND_URL || 'http://localhost:3000/dashboard');
    } catch (err) {
      fastify.log.error(err);
      return reply.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  };

  fastify.get('/auth/google/callback', async (req, reply) => {
    const { token } = await (fastify as any).googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
    return handleOAuthCallback(req, reply, token, 'google', 'https://www.googleapis.com/oauth2/v2/userinfo', (data) => ({
      id: data.id,
      email: data.email,
      name: data.name
    }));
  });

  fastify.get('/auth/microsoft/callback', async (req, reply) => {
    const { token } = await (fastify as any).microsoftOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
    return handleOAuthCallback(req, reply, token, 'microsoft', 'https://graph.microsoft.com/v1.0/me', (data) => ({
      id: data.id,
      email: data.userPrincipalName, // Microsoft usually puts email here
      name: data.displayName
    }));
  });

  fastify.post('/auth/logout', async (req, reply) => {
    reply.clearCookie('auth_token', { path: '/' });
    return { success: true };
  });

  fastify.get('/auth/me', async (req: any, reply) => {
    try {
      await req.jwtVerify();
      const userId = req.user.user_id;
      
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) {
        return reply.status(401).send({ error: "User not found" });
      }

      // Find the org for context
      const [membership] = await db.select().from(memberships).where(eq(memberships.user_id, user.id)).limit(1);
      let orgData = null;
      if (membership) {
        const [org] = await db.select().from(organizations).where(eq(organizations.id, membership.org_id)).limit(1);
        if (org) {
          orgData = {
            id: org.id,
            name: org.name,
          };
        }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: "",
          roles: req.user.roles,
          organization: orgData ? {
            name: orgData.name,
            website: "",
            industry: "",
            timezone: "UTC",
            language: "English"
          } : null
        }
      };
    } catch (err) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  });

  fastify.post('/auth/forgot-password', async (req: any, reply) => {
    const { email } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user) {
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(password_reset_tokens).values({
        user_id: user.id,
        token: token,
        expires_at: expiresAt,
        used: false
      });

      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'dummy@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD || 'dummypass'
        }
      });

      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      
      try {
        await transporter.sendMail({
          from: `"AI Workforce" <${process.env.GMAIL_USER || 'dummy@gmail.com'}>`,
          to: email,
          subject: "Password Reset Request",
          text: `Click the following link to reset your password: ${resetLink}`
        });
      } catch (e) {
        fastify.log.error(e as Error, "Failed to send email");
      }
    }
    
    return { success: true, message: "If an account exists, a password reset link has been sent." };
  });

  fastify.post('/auth/reset-password', async (req: any, reply) => {
    const { token, password } = req.body;
    
    const [resetToken] = await db.select().from(password_reset_tokens).where(
      and(
        eq(password_reset_tokens.token, token),
        eq(password_reset_tokens.used, false),
        gt(password_reset_tokens.expires_at, new Date())
      )
    ).limit(1);

    if (!resetToken) {
      return reply.status(400).send({ error: "Invalid or expired token" });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.update(users).set({ password_hash: hashedPassword }).where(eq(users.id, resetToken.user_id));
    await db.update(password_reset_tokens).set({ used: true }).where(eq(password_reset_tokens.id, resetToken.id));

    return { success: true };
  });

  fastify.post('/auth/profile/update', async (req: any, reply) => {
    try {
      await req.jwtVerify(); // Requires auth
    } catch (err) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const { fullName, email, currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;
    const bcrypt = require('bcryptjs');

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return reply.status(404).send({ error: "User not found" });

    const updates: any = {};
    if (fullName) updates.name = fullName;

    if (email && email !== user.email) {
      // Check if email already in use
      const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing) return reply.status(400).send({ error: "Email already in use" });
      updates.email = email;
    }

    if (newPassword) {
      // If user has an existing password hash, require current password
      if (user.password_hash) {
        if (!currentPassword) {
          return reply.status(400).send({ error: "Current password is required to set a new password." });
        }
        const isValid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValid) {
          return reply.status(400).send({ error: "Incorrect current password." });
        }
      }
      
      updates.password_hash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, userId));
    }

    // Return the updated user info
    const [updatedUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return {
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name
      }
    };
  });

  fastify.post('/auth/register', async (req: any, reply) => {
    const { fullName, email, companyName, password } = req.body;
    const bcrypt = require('bcryptjs');

    if (!fullName || !email || !password) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    // Check for existing user
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser) {
      return reply.status(400).send({ error: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const [user] = await db.insert(users).values({
      email: email,
      name: fullName,
      password_hash: hashedPassword
    }).returning();

    // Generate email verification token and send email
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await db.insert(email_verification_tokens).values({
      user_id: user.id,
      token: token,
      expires_at: expiresAt,
      used: false
    });
    
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'dummy@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD || 'dummypass'
      }
    });

    const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    try {
      await transporter.sendMail({
        from: `"AI Workforce" <${process.env.GMAIL_USER || 'dummy@gmail.com'}>`,
        to: email,
        subject: "Verify Your Email",
        text: `Welcome! Please verify your email by clicking the following link: ${verifyLink}`
      });
    } catch (e) {
      fastify.log.error(e as Error, "Failed to send verification email");
    }

    // Auto-provision an organization and membership
    const [org] = await db.insert(organizations).values({
      name: companyName || `${fullName || 'User'}'s Workspace`,
      slug: `workspace-${user.id.slice(0,8)}`,
    }).returning();

    const [membership] = await db.insert(memberships).values({
      org_id: org.id,
      user_id: user.id
    }).returning();

    // Assign owner role
    await db.insert(membership_roles).values({
      membership_id: membership.id,
      role: 'owner'
    });

    const payload = {
      user_id: user.id,
      org_id: membership.org_id,
      roles: ['owner']
    };

    const jwtToken = fastify.jwt.sign(payload);

    reply.setCookie('auth_token', jwtToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return { success: true };
  });

  fastify.post('/auth/login', async (req: any, reply) => {
    const { email, password, rememberMe } = req.body;
    const bcrypt = require('bcryptjs');

    if (!email || !password) {
      return reply.status(400).send({ error: "Missing email or password" });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user || !user.password_hash) {
      return reply.status(400).send({ error: "Invalid email or password" });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return reply.status(400).send({ error: "Invalid email or password" });
    }

    // Find active membership
    const [membership] = await db.select().from(memberships).where(eq(memberships.user_id, user.id)).limit(1);
    if (!membership) {
      return reply.status(400).send({ error: "Account has no associated organization" });
    }

    const roles = await db.select({ role: membership_roles.role })
      .from(membership_roles)
      .where(eq(membership_roles.membership_id, membership.id));

    const payload = {
      user_id: user.id,
      org_id: membership.org_id,
      roles: roles.map(r => r.role)
    };

    const jwtToken = fastify.jwt.sign(payload);

    reply.setCookie('auth_token', jwtToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: rememberMe ? (60 * 60 * 24 * 30) : (60 * 60 * 24) // 30 days or 1 day
    });

    return { success: true };
  });

  fastify.post('/auth/verify-email', async (req: any, reply) => {
    const { token } = req.body;

    const [verifyToken] = await db.select().from(email_verification_tokens).where(
      and(
        eq(email_verification_tokens.token, token),
        eq(email_verification_tokens.used, false),
        gt(email_verification_tokens.expires_at, new Date())
      )
    ).limit(1);

    if (!verifyToken) {
      return reply.status(400).send({ error: "Invalid or expired token" });
    }

    await db.update(users).set({ email_verified: true }).where(eq(users.id, verifyToken.user_id));
    await db.update(email_verification_tokens).set({ used: true }).where(eq(email_verification_tokens.id, verifyToken.id));

    return { success: true };
  });

  fastify.post('/auth/resend-verification', async (req: any, reply) => {
    const { email } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user && !user.email_verified) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const { email_verification_tokens } = require('@ai-workforce/db/schema');

      await db.insert(email_verification_tokens).values({
        user_id: user.id,
        token: token,
        expires_at: expiresAt,
        used: false
      });

      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'dummy@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD || 'dummypass'
        }
      });

      const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

      try {
        await transporter.sendMail({
          from: `"AI Workforce" <${process.env.GMAIL_USER || 'dummy@gmail.com'}>`,
          to: email,
          subject: "Verify Your Email",
          text: `Please verify your email by clicking the following link: ${verifyLink}`
        });
      } catch (e) {
        fastify.log.error(e as Error, "Failed to send verification email");
      }
    }
    return { success: true };
  });

  fastify.post('/auth/invite/validate', async (req: any, reply) => {
    const { token } = req.body;
    if (!token) return reply.status(400).send({ error: "Token required" });

    const [invite] = await db.select().from(organization_invitations).where(eq(organization_invitations.token, token)).limit(1);
    
    if (!invite) {
      return reply.status(404).send({ error: "Invitation not found" });
    }
    
    if (invite.status !== 'pending') {
      return reply.status(400).send({ error: `Invitation is already ${invite.status}` });
    }
    
    if (new Date() > invite.expires_at) {
      return reply.status(400).send({ error: "Invitation expired" });
    }

    const [org] = await db.select().from(organizations).where(eq(organizations.id, invite.org_id)).limit(1);

    return {
      success: true,
      orgName: org?.name || "Unknown Organization",
      email: invite.email
    };
  });

  fastify.post('/auth/invite/accept', async (req: any, reply) => {
    const { token } = req.body;
    if (!token) return reply.status(400).send({ error: "Token required" });

    try {
      await req.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ error: "Must be logged in to accept invitation" });
    }

    const userId = req.user.user_id;

    const [invite] = await db.select().from(organization_invitations).where(eq(organization_invitations.token, token)).limit(1);
    
    if (!invite || invite.status !== 'pending' || new Date() > invite.expires_at) {
      return reply.status(400).send({ error: "Invalid or expired invitation" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return reply.status(403).send({ error: "This invitation was sent to a different email address." });
    }

    // Check if already a member
    const [existingMembership] = await db.select()
      .from(memberships)
      .where(and(eq(memberships.user_id, user.id), eq(memberships.org_id, invite.org_id)))
      .limit(1);

    if (!existingMembership) {
      const [membership] = await db.insert(memberships).values({
        org_id: invite.org_id,
        user_id: user.id
      }).returning();

      await db.insert(membership_roles).values({
        membership_id: membership.id,
        role: invite.role
      });
    }

    await db.update(organization_invitations)
      .set({ status: 'accepted' })
      .where(eq(organization_invitations.id, invite.id));

    return { success: true };
  });
}
