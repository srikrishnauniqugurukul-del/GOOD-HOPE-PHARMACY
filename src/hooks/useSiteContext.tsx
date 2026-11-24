import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AdminProfile, LanguageCode, PublicSitePayload } from '../types/domain';
import { fetchPublicSite } from '../lib/api';
import { TRANSLATIONS, type TranslationBundle } from '../lib/i18n';

interface SiteContextValue {
  data: PublicSitePayload | null;
  loading: boolean;
  error: string | null;
  refreshSite: () => Promise<void>;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationBundle;
  // Admin auth held strictly in JS/React memory (never localStorage)
  adminToken: string | null;
  adminProfile: AdminProfile | null;
  setAdminSession: (token: string | null, profile: AdminProfile | null) => void;
  logoutAdmin: () => void;
}

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<PublicSitePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  const refreshSite = useCallback(async () => {
    try {
      const payload = await fetchPublicSite();
      setData(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load Good Hope Pharmacy data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSite();
  }, [refreshSite]);

  useEffect(() => {
    document.documentElement.setAttribute('data-lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
  }, []);

  const setAdminSession = useCallback((token: string | null, profile: AdminProfile | null) => {
    setAdminToken(token);
    setAdminProfile(profile);
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdminToken(null);
    setAdminProfile(null);
  }, []);

  return (
    <SiteContext.Provider
      value={{
        data,
        loading,
        error,
        refreshSite,
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        adminToken,
        adminProfile,
        setAdminSession,
        logoutAdmin,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside SiteProvider');
  return ctx;
}
