"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

export interface Organization {
  id: string;
  name: string;
}

interface OrganizationContextType {
  organization: Organization | null;
  setOrganization: (organization: Organization | null) => void;
}

const OrganizationContext =
  createContext<OrganizationContextType | null>(null);

export function OrganizationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [organization, setOrganization] =
    useState<Organization | null>(null);

  const value = useMemo(
    () => ({
      organization,
      setOrganization,
    }),
    [organization]
  );

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);

  if (!context) {
    throw new Error(
      "useOrganization must be used within OrganizationProvider"
    );
  }

  return context;
}