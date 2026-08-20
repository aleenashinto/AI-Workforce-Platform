export interface SupportTicket {
  subject: string;
  description: string;
  requesterEmail?: string;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
}

export interface SupportProvider {
  createTicket(ticket: SupportTicket): Promise<string>;
}

export class ZendeskSupportProvider implements SupportProvider {
  private apiToken: string;
  private subdomain: string;
  private agentEmail: string;

  constructor() {
    this.apiToken = process.env.ZENDESK_API_TOKEN || '';
    this.subdomain = process.env.ZENDESK_SUBDOMAIN || '';
    this.agentEmail = process.env.ZENDESK_AGENT_EMAIL || '';
  }

  async createTicket(ticket: SupportTicket): Promise<string> {
    if (!this.apiToken || !this.subdomain) {
      console.warn('[ZendeskSupportProvider] API Token or Subdomain missing. Simulating ticket creation.');
      return `MOCK-TICKET-${Math.floor(Math.random() * 10000)}`;
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${this.agentEmail}/token:${this.apiToken}`).toString('base64')}`;
      
      const res = await fetch(`https://${this.subdomain}.zendesk.com/api/v2/tickets.json`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticket: {
            subject: ticket.subject,
            comment: { body: ticket.description },
            priority: ticket.priority || 'normal',
            requester: ticket.requesterEmail ? { email: ticket.requesterEmail } : undefined
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Zendesk API error: ${await res.text()}`);
      }

      const data = await res.json() as any;
      return data.ticket.id.toString();
    } catch (err) {
      console.error('[ZendeskSupportProvider] Failed to create ticket:', err);
      // Fallback so application doesn't crash
      return `ERROR-TICKET-${Math.floor(Math.random() * 10000)}`;
    }
  }
}
