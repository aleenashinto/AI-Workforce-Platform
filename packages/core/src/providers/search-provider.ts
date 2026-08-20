export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface SearchProvider {
  searchCompanyNews(companyDomain: string, limit?: number): Promise<SearchResult[]>;
  searchCompanyProduct(companyDomain: string, limit?: number): Promise<SearchResult[]>;
}

export class ExaSearchProvider implements SearchProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.EXA_API_KEY || '';
  }

  async searchCompanyNews(companyDomain: string, limit = 5): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn('[ExaSearchProvider] EXA_API_KEY missing. Returning mock news.');
      return [
        {
          title: `Mock News: ${companyDomain} raises Series B`,
          url: `https://news.example.com/${companyDomain}-series-b`,
          snippet: `${companyDomain} just announced a $20M Series B to expand their sales team.`,
          publishedDate: new Date().toISOString()
        }
      ];
    }

    try {
      const res = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `${companyDomain} (recent news OR funding OR expansion OR hiring)`,
          numResults: limit,
          useAutoprompt: true
        })
      });

      if (!res.ok) {
        throw new Error(`Exa API error: ${await res.text()}`);
      }

      const data = await res.json() as any;
      return (data.results || []).map((result: any) => ({
        title: result.title,
        url: result.url,
        snippet: result.text || result.snippet || '',
        publishedDate: result.publishedDate
      }));
    } catch (err) {
      console.error('[ExaSearchProvider] Failed to search company news:', err);
      return [];
    }
  }

  async searchCompanyProduct(companyDomain: string, limit = 5): Promise<SearchResult[]> {
    if (!this.apiKey) {
      console.warn('[ExaSearchProvider] EXA_API_KEY missing. Returning mock product data.');
      return [
        {
          title: `Mock Product: ${companyDomain} AI Features`,
          url: `https://${companyDomain}/product`,
          snippet: `The new AI features launched by ${companyDomain} are revolutionary.`,
          publishedDate: new Date().toISOString()
        }
      ];
    }

    try {
      const res = await fetch('https://api.exa.ai/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `site:${companyDomain} OR "${companyDomain}" (product launch OR new features OR pricing)`,
          numResults: limit,
          useAutoprompt: true
        })
      });

      if (!res.ok) {
        throw new Error(`Exa API error: ${await res.text()}`);
      }

      const data = await res.json() as any;
      return (data.results || []).map((result: any) => ({
        title: result.title,
        url: result.url,
        snippet: result.text || result.snippet || '',
        publishedDate: result.publishedDate
      }));
    } catch (err) {
      console.error('[ExaSearchProvider] Failed to search company products:', err);
      return [];
    }
  }
}
