export interface Persona {
  titles: string[];
  seniority: string[];
  departments: string[];
}

export interface ICPCriteria {
  industries: string[];
  companySize: string[];
  geography: string[];
  keywords: string[];
  targetTitles: string[];
  valueProp: string;
  proofPoints: string;
}

export interface DiscoveredLead {
  name: string;
  email: string;
  company: string;
  company_domain: string;
  linkedin_url?: string;
  metadata?: any;
}

export interface LeadProvider {
  searchCompanies(criteria: ICPCriteria, limit?: number): Promise<{ name: string; domain: string; industry: string; employee_count: number }[]>;
  searchContacts(companyDomain: string, persona: Persona, limit?: number): Promise<DiscoveredLead[]>;
}

export class ApolloLeadProvider implements LeadProvider {
  // Using mocks per Implementation Plan
  async searchCompanies(criteria: ICPCriteria, limit = 5) {
    // Mock implementation for Apollo API
    console.log(`[ApolloProvider] Searching companies for industries: ${criteria.industries.join(', ')}`);
    return [
      {
        name: 'TechCorp Solutions',
        domain: 'techcorp.example.com',
        industry: criteria.industries[0] || 'Software',
        employee_count: 150
      },
      {
        name: 'Innovate AI',
        domain: 'innovate-ai.example.com',
        industry: criteria.industries[0] || 'Technology',
        employee_count: 50
      }
    ].slice(0, limit);
  }

  async searchContacts(companyDomain: string, persona: Persona, limit = 3) {
    console.log(`[ApolloProvider] Searching contacts for domain: ${companyDomain} matching persona: ${persona.titles.join(', ')}`);
    return [
      {
        name: `Alice Leader`,
        email: `alice@${companyDomain}`,
        company: companyDomain.split('.')[0],
        company_domain: companyDomain,
        linkedin_url: `https://linkedin.com/in/alice-leader-${Math.floor(Math.random()*1000)}`,
        metadata: { title: persona.titles[0] || 'Director' }
      },
      {
        name: `Bob Manager`,
        email: `bob@${companyDomain}`,
        company: companyDomain.split('.')[0],
        company_domain: companyDomain,
        linkedin_url: `https://linkedin.com/in/bob-manager-${Math.floor(Math.random()*1000)}`,
        metadata: { title: persona.titles[1] || 'Manager' }
      }
    ].slice(0, limit);
  }
}
