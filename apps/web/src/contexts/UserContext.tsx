'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type MemberRole =
  | 'owner'
  | 'admin'
  | 'support_lead'
  | 'support_agent'
  | 'sales_lead'
  | 'sales_rep'
  | 'viewer';

type UserProfile = {
  fullName: string;
  email: string;
  role: string;
  roles: MemberRole[];
  avatarUrl: string;
  organization: {
    name: string;
    website: string;
    industry: string;
    timezone: string;
    language: string;
  };
};

type UserContextType = {
  user: UserProfile | null;
  loading: boolean;
  updateUser: (updates: Partial<UserProfile>) => void;
  updateOrganization: (updates: Partial<UserProfile['organization']>) => void;
  hasRole: (...roles: MemberRole[]) => boolean;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/me`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(data => {
        if (data.user) {
          setUser({
            fullName: data.user.name || "",
            email: data.user.email || "",
            role: data.user.roles?.[0] || "User",
            roles: data.user.roles || [],
            avatarUrl: data.user.avatarUrl || "",
            organization: data.user.organization || {
              name: "Your Workspace",
              website: "",
              industry: "",
              timezone: "UTC",
              language: "English"
            }
          });
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) setUser({ ...user, ...updates });
  };

  const updateOrganization = (updates: Partial<UserProfile['organization']>) => {
    if (user) setUser({ ...user, organization: { ...user.organization, ...updates } });
  };

  const hasRole = (...roles: MemberRole[]) => {
    if (!user) return false;
    return roles.some(r => user.roles.includes(r));
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (e) {
      // ignore
    }
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUser, updateOrganization, hasRole, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
