'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from './translations';

const STORAGE_KEY = 'postx_language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with fixed value to prevent hydration mismatch
  const [language, setLanguageState] = useState<Language>('ja');

  // Load from localStorage/navigator only on client side
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'ja' || stored === 'en')) {
      setLanguageState(stored);
      return;
    }

    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    const detected = browserLang === 'ja' ? 'ja' : 'en';
    setLanguageState(detected);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const { t } = useLanguage();
  return t;
}
