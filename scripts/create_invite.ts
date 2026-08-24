import { db } from "@ai-workforce/db";
import {
  organizations,
  users,
  organization_invitations,
} from "@ai-workforce/db/schema";
import crypto from "crypto";

async function createInvite() {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Assuming an org and user exists, let's just grab the first one
  const [org] = await db.select().from(organizations).limit(1);
  const [user] = await db.select().from(users).limit(1);

  if (!org) {
    console.log("No organization found. Please create a user/org first.");
    process.exit(1);
  }

  await db.insert(organization_invitations).values({
    org_id: org.id,
    email: "test_invitee@example.com",
    role: "viewer",
    token: token,
    status: "pending",
    invited_by: user?.id,
    expires_at: expiresAt,
  });

  console.log(`Invitation created successfully!`);
  console.log(`Token: ${token}`);
  console.log(`Test Link: http://localhost:3000/auth/invite?token=${token}`);
  process.exit(0);
}

createInvite().catch((err) => {
  console.error(err);
  process.exit(1);
});
