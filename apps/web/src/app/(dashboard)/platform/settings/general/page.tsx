'use client';

import { Button } from '@/components/ui/button';
import { Building2, Save } from 'lucide-react';

export default function GeneralSettingsPage() {
  return (
    <div className="space-y-6">
      
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Organization Profile</h1>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <p className="text-sm text-gray-500">Manage your organization's basic information and branding.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">General Information</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization Name</label>
              <input 
                type="text" 
                defaultValue="Acme Corp" 
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">URL Slug</label>
              <input 
                type="text" 
                defaultValue="acme-corp" 
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Timezone</label>
              <select className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow">
                <option>UTC (Coordinated Universal Time)</option>
                <option>America/New_York (EST/EDT)</option>
                <option>America/Los_Angeles (PST/PDT)</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Branding</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs font-medium">
                  Logo
                </div>
                <Button variant="outline" size="sm" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm">
                  Upload new
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Primary Color</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden relative">
                  <input type="color" defaultValue="#4f46e5" className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                </div>
                <span className="text-sm font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md border border-gray-200">#4f46e5</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Branding
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-100">
          <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Once you delete your organization, there is no going back. All data will be permanently wiped.
          </p>
          <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
            Delete Organization
          </Button>
        </div>
      </div>

    </div>
  );
}
