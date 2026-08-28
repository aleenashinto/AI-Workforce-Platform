export interface CRMContact {
  externalId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  isCustomer: boolean;
}

export interface ICRMProvider {
  pullContacts(integrationId: string, credentials?: any): Promise<CRMContact[]>;
  pushLead(
    integrationId: string,
    lead: any,
    credentials?: any,
  ): Promise<boolean>;
}

export class MockCRMProvider implements ICRMProvider {
  async pullContacts(
    integrationId: string,
    credentials?: any,
  ): Promise<CRMContact[]> {
    return [
      {
        externalId: "crm-contact-1",
        email: "ceo@bigclient.com",
        firstName: "Big",
        lastName: "Client",
        companyName: "Big Client Inc",
        isCustomer: true,
      },
    ];
  }

  async pushLead(
    integrationId: string,
    lead: any,
    credentials?: any,
  ): Promise<boolean> {
    console.log(`[CRM] Pushed lead ${lead.email} to CRM ${integrationId}`);
    return true;
  }
}

import { PipedriveProvider } from "./pipedrive-provider";

export class HubSpotProvider implements ICRMProvider {
  async pullContacts(
    integrationId: string,
    credentials?: any,
  ): Promise<CRMContact[]> {
    const token = credentials?.accessToken || credentials?.apiKey || process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token) {
      console.log(`[HubSpot] Credentials not configured. Returning mock contacts.`);
      return [
        {
          externalId: "hubspot-contact-1",
          email: "ceo@hubspot-client.com",
          firstName: "Hub",
          lastName: "Spot",
          companyName: "HubSpot Client Inc",
          isCustomer: true,
        },
      ];
    }

    try {
      const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?properties=email,firstname,lastname,company,lifecyclestage", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`HubSpot API error: ${res.statusText}`);
      const data = await res.json() as any;
      return (data.results || []).map((c: any) => ({
        externalId: c.id,
        email: c.properties.email || "",
        firstName: c.properties.firstname || "",
        lastName: c.properties.lastname || "",
        companyName: c.properties.company || "",
        isCustomer: c.properties.lifecyclestage === "customer",
      }));
    } catch (e: any) {
      console.warn(`[HubSpot] Error pulling contacts: ${e.message}. Using mock.`);
      return [
        {
          externalId: "hubspot-contact-1",
          email: "ceo@hubspot-client.com",
          firstName: "Hub",
          lastName: "Spot",
          companyName: "HubSpot Client Inc",
          isCustomer: true,
        },
      ];
    }
  }

  async pushLead(
    integrationId: string,
    lead: any,
    credentials?: any,
  ): Promise<boolean> {
    const token = credentials?.accessToken || credentials?.apiKey || process.env.HUBSPOT_ACCESS_TOKEN;
    if (!token) {
      console.log(`[HubSpot] Pushed lead ${lead.email} to HubSpot (Simulated)`);
      return true;
    }

    try {
      const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            email: lead.email,
            firstname: lead.name?.split(" ")[0] || "",
            lastname: lead.name?.split(" ").slice(1).join(" ") || "",
            company: lead.company,
          },
        }),
      });
      if (!res.ok && res.status !== 409) { // 409 means contact already exists
        throw new Error(`HubSpot push failed: ${res.statusText}`);
      }
      return true;
    } catch (e: any) {
      console.warn(`[HubSpot] Push failed: ${e.message}`);
      return false;
    }
  }
}

export class CRMProviderFactory {
  static getProvider(providerName: string): ICRMProvider {
    switch (providerName) {
      case "mock":
        return new MockCRMProvider();
      case "pipedrive":
        return new PipedriveProvider();
      case "hubspot":
        return new HubSpotProvider();
      default:
        throw new Error(`Unsupported CRM provider: ${providerName}`);
    }
  }
}
