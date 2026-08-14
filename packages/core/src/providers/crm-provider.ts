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
  pushLead(integrationId: string, lead: any, credentials?: any): Promise<boolean>;
}

export class MockCRMProvider implements ICRMProvider {
  async pullContacts(integrationId: string, credentials?: any): Promise<CRMContact[]> {
    return [
      {
        externalId: 'crm-contact-1',
        email: 'ceo@bigclient.com',
        firstName: 'Big',
        lastName: 'Client',
        companyName: 'Big Client Inc',
        isCustomer: true
      }
    ];
  }

  async pushLead(integrationId: string, lead: any, credentials?: any): Promise<boolean> {
    console.log(`[CRM] Pushed lead ${lead.email} to CRM ${integrationId}`);
    return true;
  }
}

import { PipedriveProvider } from './pipedrive-provider';

export class CRMProviderFactory {
  static getProvider(providerName: string): ICRMProvider {
    switch (providerName) {
      case 'mock':
        return new MockCRMProvider();
      case 'pipedrive':
        return new PipedriveProvider();
      default:
        throw new Error(`Unsupported CRM provider: ${providerName}`);
    }
  }
}
