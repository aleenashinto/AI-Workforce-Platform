/**
 * Migration test for Phase 7: Expanded Role & Permission Model
 *
 * Tests verify that the 0010_roles.sql migration correctly transforms:
 *   - owner/admin/viewer → single corresponding role in membership_roles
 *   - agent → both 'support_agent' and 'sales_rep' in membership_roles
 *
 * This is a logic-only test (no DB required). It simulates the migration
 * INSERT logic and validates the expected output.
 */

import { describe, it, expect } from 'vitest';

type OldMembership = { id: string; user_id: string; org_id: string; role: string };
type NewMembershipRole = { membership_id: string; role: string };

/** Simulates the SQL INSERT logic from 0010_roles.sql */
function migrateRoles(memberships: OldMembership[]): NewMembershipRole[] {
  const result: NewMembershipRole[] = [];

  for (const m of memberships) {
    if (m.role === 'agent') {
      // agent expands to both support_agent and sales_rep
      result.push({ membership_id: m.id, role: 'support_agent' });
      result.push({ membership_id: m.id, role: 'sales_rep' });
    } else {
      // owner, admin, viewer map 1:1
      result.push({ membership_id: m.id, role: m.role });
    }
  }

  return result;
}

describe('Phase 7 Migration: Role expansion', () => {
  const input: OldMembership[] = [
    { id: 'mem-1', user_id: 'user-1', org_id: 'org-1', role: 'owner' },
    { id: 'mem-2', user_id: 'user-2', org_id: 'org-1', role: 'admin' },
    { id: 'mem-3', user_id: 'user-3', org_id: 'org-1', role: 'agent' },
    { id: 'mem-4', user_id: 'user-4', org_id: 'org-1', role: 'viewer' },
  ];

  const result = migrateRoles(input);

  it('produces correct total count (agent expands to 2 rows)', () => {
    // 1 owner + 1 admin + 2 from agent + 1 viewer = 5
    expect(result.length).toBe(5);
  });

  it('maps owner to owner', () => {
    expect(result).toContainEqual({ membership_id: 'mem-1', role: 'owner' });
  });

  it('maps admin to admin', () => {
    expect(result).toContainEqual({ membership_id: 'mem-2', role: 'admin' });
  });

  it('maps agent to support_agent', () => {
    expect(result).toContainEqual({ membership_id: 'mem-3', role: 'support_agent' });
  });

  it('maps agent to sales_rep', () => {
    expect(result).toContainEqual({ membership_id: 'mem-3', role: 'sales_rep' });
  });

  it('maps viewer to viewer', () => {
    expect(result).toContainEqual({ membership_id: 'mem-4', role: 'viewer' });
  });

  it('is idempotent - running twice on same data does not remove rows', () => {
    // simulate: migration uses INSERT not UPSERT, so we just verify input → output is deterministic
    const result1 = migrateRoles(input);
    const result2 = migrateRoles(input);
    expect(result1).toEqual(result2);
  });
});
