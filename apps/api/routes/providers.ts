export interface Company {
  name: string;
  domain: string;
  industry: string;
  size: string;
  location: string;
}

export interface Contact {
  name: string;
  email: string;
  title: string;
  linkedin_url: string;
}

export abstract class LeadProvider {
  protected cache: Map<string, any> = new Map();

  abstract findCompanies(criteria: any): Promise<Company[]>;
  abstract findContacts(companyDomain: string, persona: any): Promise<Contact[]>;
  abstract enrichCompany(domain: string): Promise<any>;

  protected getFromCache(key: string) {
    // 30 days cache simulation
    return this.cache.get(key);
  }

  protected setCache(key: string, value: any) {
    this.cache.set(key, value);
  }
}

export class ApolloProvider extends LeadProvider {
  async findCompanies(criteria: any): Promise<Company[]> {
    return [
      { name: 'Acme Corp', domain: 'acme.com', industry: 'Software', size: '50-200', location: 'USA' },
      { name: 'TechFlow', domain: 'techflow.io', industry: 'Fintech', size: '10-50', location: 'UK' }
    ];
  }

  async findContacts(companyDomain: string, persona: any): Promise<Contact[]> {
    return [
      { name: 'Alice Smith', email: `alice@${companyDomain}`, title: 'CTO', linkedin_url: `https://linkedin.com/in/alicesmith` },
      { name: 'Bob Jones', email: `bob@${companyDomain}`, title: 'VP Engineering', linkedin_url: `https://linkedin.com/in/bobjones` }
    ];
  }

  async enrichCompany(domain: string): Promise<any> {
    return { funding: '$10M Series A', tech_stack: ['React', 'Node.js'] };
  }
}

export class PDLProvider extends LeadProvider {
  async findCompanies(criteria: any): Promise<Company[]> {
    return [
      { name: 'DataWorks', domain: 'dataworks.net', industry: 'Analytics', size: '200-500', location: 'Canada' }
    ];
  }

  async findContacts(companyDomain: string, persona: any): Promise<Contact[]> {
    return [
      { name: 'Charlie Davis', email: `charlie@${companyDomain}`, title: 'Director of Data', linkedin_url: `https://linkedin.com/in/charliedavis` }
    ];
  }

  async enrichCompany(domain: string): Promise<any> {
    return { signals: ['Hiring Data Engineers'] };
  }
}

export class ZeroBounceService {
  async verifyEmails(emails: string[]): Promise<{ email: string; status: 'valid' | 'risky' | 'invalid' }[]> {
    // Mock batch verification
    return emails.map(email => {
      let status: 'valid' | 'risky' | 'invalid' = 'valid';
      if (email.includes('test')) status = 'invalid';
      else if (Math.random() > 0.8) status = 'risky';
      return { email, status };
    });
  }
}
