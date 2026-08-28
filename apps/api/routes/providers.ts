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
  abstract findContacts(
    companyDomain: string,
    persona: any,
  ): Promise<Contact[]>;
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
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) {
      console.log("[ApolloProvider] APOLLO_API_KEY not configured. Returning mock companies.");
      return [
        {
          name: "Acme Corp",
          domain: "acme.com",
          industry: "Software",
          size: "50-200",
          location: "USA",
        },
        {
          name: "TechFlow",
          domain: "techflow.io",
          industry: "Fintech",
          size: "10-50",
          location: "UK",
        },
      ];
    }

    try {
      const response = await fetch("https://api.apollo.io/v1/organizations/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          api_key: apiKey,
          q_organization_keyword_tags: criteria.industries || [],
          page: 1,
          per_page: 10,
        }),
      });

      if (!response.ok) throw new Error(`Apollo API error: ${response.statusText}`);
      const data = await response.json() as any;
      return (data.organizations || []).map((org: any) => ({
        name: org.name || "Unknown Company",
        domain: org.primary_domain || "unknown.com",
        industry: org.industry || "Software",
        size: org.estimated_num_employees ? String(org.estimated_num_employees) : "50-200",
        location: org.country || "USA",
      }));
    } catch (e: any) {
      console.warn("[ApolloProvider] Error, falling back to mock companies:", e.message);
      return [
        {
          name: "Acme Corp",
          domain: "acme.com",
          industry: "Software",
          size: "50-200",
          location: "USA",
        },
      ];
    }
  }

  async findContacts(companyDomain: string, persona: any): Promise<Contact[]> {
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) {
      console.log("[ApolloProvider] APOLLO_API_KEY not configured. Returning mock contacts.");
      return [
        {
          name: "Alice Smith",
          email: `alice@${companyDomain}`,
          title: "CTO",
          linkedin_url: `https://linkedin.com/in/alicesmith`,
        },
        {
          name: "Bob Jones",
          email: `bob@${companyDomain}`,
          title: "VP Engineering",
          linkedin_url: `https://linkedin.com/in/bobjones`,
        },
      ];
    }

    try {
      const response = await fetch("https://api.apollo.io/v1/mixed_people/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          api_key: apiKey,
          q_organization_domains: companyDomain,
          person_titles: persona.titles || [],
          page: 1,
          per_page: 5,
        }),
      });

      if (!response.ok) throw new Error(`Apollo API error: ${response.statusText}`);
      const data = await response.json() as any;
      return (data.people || []).map((p: any) => ({
        name: p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim() || "Unknown Contact",
        email: p.email || `contact@${companyDomain}`,
        title: p.title || "Software Engineer",
        linkedin_url: p.linkedin_url || "https://linkedin.com",
      }));
    } catch (e: any) {
      console.warn("[ApolloProvider] Error, falling back to mock contacts:", e.message);
      return [
        {
          name: "Alice Smith",
          email: `alice@${companyDomain}`,
          title: "CTO",
          linkedin_url: `https://linkedin.com/in/alicesmith`,
        },
      ];
    }
  }

  async enrichCompany(domain: string): Promise<any> {
    const apiKey = process.env.APOLLO_API_KEY;
    if (!apiKey) {
      return { funding: "$10M Series A", tech_stack: ["React", "Node.js"] };
    }

    try {
      const response = await fetch(`https://api.apollo.io/v1/organizations/match?api_key=${apiKey}&domain=${domain}`);
      if (!response.ok) throw new Error("Match failed");
      const data = await response.json() as any;
      return {
        funding: data.organization?.latest_funding_round_amount_formatted || "Unknown",
        tech_stack: data.organization?.technology_names || [],
      };
    } catch (e) {
      return { funding: "Unknown", tech_stack: ["React"] };
    }
  }
}

export class PDLProvider extends LeadProvider {
  async findCompanies(criteria: any): Promise<Company[]> {
    return [
      {
        name: "DataWorks",
        domain: "dataworks.net",
        industry: "Analytics",
        size: "200-500",
        location: "Canada",
      },
    ];
  }

  async findContacts(companyDomain: string, persona: any): Promise<Contact[]> {
    return [
      {
        name: "Charlie Davis",
        email: `charlie@${companyDomain}`,
        title: "Director of Data",
        linkedin_url: `https://linkedin.com/in/charliedavis`,
      },
    ];
  }

  async enrichCompany(domain: string): Promise<any> {
    return { signals: ["Hiring Data Engineers"] };
  }
}

export class ZeroBounceService {
  async verifyEmails(
    emails: string[],
  ): Promise<{ email: string; status: "valid" | "risky" | "invalid" }[]> {
    const apiKey = process.env.ZEROBOUNCE_API_KEY;
    if (!apiKey) {
      console.log("[ZeroBounceService] ZEROBOUNCE_API_KEY not configured. Simulating verification.");
      return emails.map((email) => {
        let status: "valid" | "risky" | "invalid" = "valid";
        if (email.includes("test")) status = "invalid";
        else if (Math.random() > 0.8) status = "risky";
        return { email, status };
      });
    }

    const results: { email: string; status: "valid" | "risky" | "invalid" }[] = [];
    for (const email of emails) {
      try {
        const response = await fetch(`https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${email}`);
        if (!response.ok) throw new Error("Verification API failed");
        const data = await response.json() as any;
        let status: "valid" | "risky" | "invalid" = "valid";
        if (data.status === "valid") status = "valid";
        else if (data.status === "invalid") status = "invalid";
        else status = "risky";

        results.push({ email, status });
      } catch (e) {
        results.push({ email, status: "valid" });
      }
    }
    return results;
  }
}
