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
  searchCompanies(
    criteria: ICPCriteria,
    limit?: number,
  ): Promise<
    { name: string; domain: string; industry: string; employee_count: number }[]
  >;
  searchContacts(
    companyDomain: string,
    persona: Persona,
    limit?: number,
  ): Promise<DiscoveredLead[]>;
}

export class ApolloLeadProvider implements LeadProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.APOLLO_API_KEY || "";
  }

  async searchCompanies(criteria: ICPCriteria, limit = 5) {
    if (!this.apiKey) {
      console.warn(
        "[ApolloProvider] APOLLO_API_KEY missing. Returning mock data.",
      );
      return [
        {
          name: "TechCorp Solutions",
          domain: "techcorp.example.com",
          industry: criteria.industries[0] || "Software",
          employee_count: 150,
        },
        {
          name: "Innovate AI",
          domain: "innovate-ai.example.com",
          industry: criteria.industries[0] || "Technology",
          employee_count: 50,
        },
      ].slice(0, limit);
    }

    try {
      const res = await fetch(
        "https://api.apollo.io/v1/mixed_companies/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            api_key: this.apiKey,
            q_organization_keyword_tags: criteria.industries.join(","),
            organization_num_employees_ranges: criteria.companySize.join(","),
            organization_locations: criteria.geography,
            per_page: limit,
          }),
        },
      );

      if (!res.ok) {
        throw new Error(`Apollo API error: ${await res.text()}`);
      }

      const data = (await res.json()) as any;

      return (data.organizations || []).map((org: any) => ({
        name: org.name,
        domain: org.primary_domain,
        industry: org.industry,
        employee_count: org.estimated_num_employees,
      }));
    } catch (err) {
      console.error("[ApolloProvider] Failed to fetch companies:", err);
      return [];
    }
  }

  async searchContacts(companyDomain: string, persona: Persona, limit = 3) {
    if (!this.apiKey) {
      console.warn(
        "[ApolloProvider] APOLLO_API_KEY missing. Returning mock data.",
      );
      return [
        {
          name: `Alice Leader`,
          email: `alice@${companyDomain}`,
          company: companyDomain.split(".")[0],
          company_domain: companyDomain,
          linkedin_url: `https://linkedin.com/in/alice-leader-${Math.floor(Math.random() * 1000)}`,
          metadata: { title: persona.titles[0] || "Director" },
        },
        {
          name: `Bob Manager`,
          email: `bob@${companyDomain}`,
          company: companyDomain.split(".")[0],
          company_domain: companyDomain,
          linkedin_url: `https://linkedin.com/in/bob-manager-${Math.floor(Math.random() * 1000)}`,
          metadata: { title: persona.titles[1] || "Manager" },
        },
      ].slice(0, limit);
    }

    try {
      const res = await fetch("https://api.apollo.io/v1/mixed_people/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          q_organization_domains: companyDomain,
          person_titles: persona.titles,
          person_seniorities: persona.seniority,
          per_page: limit,
        }),
      });

      if (!res.ok) {
        throw new Error(`Apollo API error: ${await res.text()}`);
      }

      const data = (await res.json()) as any;

      return (data.people || []).map((person: any) => ({
        name: `${person.first_name} ${person.last_name}`,
        email: person.email,
        company: person.organization?.name || companyDomain.split(".")[0],
        company_domain: companyDomain,
        linkedin_url: person.linkedin_url,
        metadata: { title: person.title, seniority: person.seniority },
      }));
    } catch (err) {
      console.error("[ApolloProvider] Failed to fetch contacts:", err);
      return [];
    }
  }
}
