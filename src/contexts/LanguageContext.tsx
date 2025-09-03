
import React, { createContext, useState, useContext, useCallback } from 'react';
import { Locale } from '../types';
import { translations } from '../locales';

type TranslationKey = keyof typeof translations.ko;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('ko');

  const t = useCallback((key: TranslationKey, replacements: Record<string, string> = {}): string => {
    let translation = (translations[locale] as Record<string, string>)[key] 
                   || (translations.en as Record<string, string>)[key] 
                   || key;
    
    Object.keys(replacements).forEach(placeholder => {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        translation = translation.replace(regex, replacements[placeholder]);
    });
    
    return translation;

  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};