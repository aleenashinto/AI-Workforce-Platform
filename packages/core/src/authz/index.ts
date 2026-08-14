export type Role =
  | 'owner'
  | 'admin'
  | 'support_lead'
  | 'support_agent'
  | 'sales_lead'
  | 'sales_rep'
  | 'viewer';

export type Action =
  // Module A (Support)
  | 'READ_CONVERSATIONS'
  | 'ASSIGN_CONVERSATIONS'
  | 'RESPOND_TO_CONVERSATIONS'
  | 'MANAGE_KNOWLEDGE_BASE'
  // Module B (Sales)
  | 'READ_LEADS'
  | 'MANAGE_LEADS'
  | 'READ_CAMPAIGNS'
  | 'MANAGE_CAMPAIGNS'
  | 'APPROVE_DRAFT'
  // Global / Settings
  | 'READ_SETTINGS'
  | 'MANAGE_SETTINGS'
  | 'MANAGE_BILLING'
  | 'MANAGE_MEMBERS'
  | 'TOGGLE_APPROVAL_GATE'
  | 'MANAGE_API_KEYS'
  | 'MANAGE_INTEGRATIONS'
  | 'VIEW_AUDIT_LOGS';

const ACTION_MATRIX: Record<Action, Role[]> = {
  // Support
  READ_CONVERSATIONS: ['owner', 'admin', 'support_lead', 'support_agent'],
  ASSIGN_CONVERSATIONS: ['owner', 'admin', 'support_lead', 'support_agent'],
  RESPOND_TO_CONVERSATIONS: ['owner', 'admin', 'support_lead', 'support_agent'],
  MANAGE_KNOWLEDGE_BASE: ['owner', 'admin', 'support_lead'],

  // Sales
  READ_LEADS: ['owner', 'admin', 'sales_lead', 'sales_rep'],
  MANAGE_LEADS: ['owner', 'admin', 'sales_lead', 'sales_rep'],
  READ_CAMPAIGNS: ['owner', 'admin', 'sales_lead', 'sales_rep'],
  MANAGE_CAMPAIGNS: ['owner', 'admin', 'sales_lead'],
  APPROVE_DRAFT: ['owner', 'admin', 'sales_lead'],

  // Settings
  READ_SETTINGS: ['owner', 'admin', 'viewer', 'support_lead', 'support_agent', 'sales_lead', 'sales_rep'],
  MANAGE_SETTINGS: ['owner', 'admin'],
  MANAGE_BILLING: ['owner'],
  MANAGE_MEMBERS: ['owner', 'admin'],
  TOGGLE_APPROVAL_GATE: ['owner', 'admin'],
  MANAGE_API_KEYS: ['owner', 'admin'],
  MANAGE_INTEGRATIONS: ['owner', 'admin'],
  VIEW_AUDIT_LOGS: ['owner', 'admin'],
};

/**
 * Authorize checks if any of the user's roles has permission to perform the action.
 */
export function authorize(userRoles: string[], action: Action): boolean {
  if (!userRoles || userRoles.length === 0) return false;
  
  const allowedRoles = ACTION_MATRIX[action];
  if (!allowedRoles) return false;

  return userRoles.some(role => allowedRoles.includes(role as Role));
}

/**
 * Ensures the user has permission to perform the action. Throws an error if unauthorized.
 */
export function enforce(userRoles: string[], action: Action): void {
  if (!authorize(userRoles, action)) {
    throw new Error(`Unauthorized: Missing required role for action ${action}`);
  }
}
