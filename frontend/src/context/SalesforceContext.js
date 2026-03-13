/**
 * Salesforce Context
 * Global state for Salesforce session and org information
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import config from "../config";

const SalesforceContext = createContext();

export function useSalesforce() {
  const context = useContext(SalesforceContext);
  if (!context) {
    throw new Error("useSalesforce must be used within SalesforceProvider");
  }
  return context;
}

export function SalesforceProvider({ children }) {
  const [session, setSession] = useState(null);
  const [orgInfo, setOrgInfo] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // TODO: Need to check if sessionId is still valid or we need to generate new session as
  // right now it is using same sessionId without even verifing that it is valid or not.
  // Load session from localStorage on mount
  useEffect(() => {
    const sessionToken = localStorage.getItem(config.storage.sessionToken);
    const orgId = localStorage.getItem(config.storage.orgId);
    const savedOrgInfo = localStorage.getItem(config.storage.orgInfo);

    if (sessionToken && orgId) {
      setSession({ sessionToken, orgId });
      setIsAuthenticated(true);

      if (savedOrgInfo) {
        setOrgInfo(JSON.parse(savedOrgInfo));
      }
    }
  }, []);

  const authenticate = (sessionToken, orgId, orgData = null) => {
    localStorage.setItem(config.storage.sessionToken, sessionToken);
    localStorage.setItem(config.storage.orgId, orgId);

    if (orgData) {
      localStorage.setItem(config.storage.orgInfo, JSON.stringify(orgData));
      setOrgInfo(orgData);
    }

    setSession({ sessionToken, orgId });
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(config.storage.sessionToken);
    localStorage.removeItem(config.storage.orgId);
    localStorage.removeItem(config.storage.orgInfo);

    setSession(null);
    setOrgInfo(null);
    setIsAuthenticated(false);
  };

  const getAuthHeaders = () => {
    if (!session) return {};

    return {
      "X-Session-Token": session.sessionToken,
      "X-Org-Id": session.orgId,
    };
  };

  const value = {
    session,
    orgInfo,
    isAuthenticated,
    authenticate,
    logout,
    getAuthHeaders,
  };

  return (
    <SalesforceContext.Provider value={value}>
      {children}
    </SalesforceContext.Provider>
  );
}
