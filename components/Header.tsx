import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Locale } from '../types';

interface HeaderProps {
  onReset: () => void;
  disableLanguageChange: boolean;
}

const languageOptions: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
};

const Header: React.FC<HeaderProps> = ({ onReset, disableLanguageChange }) => {
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm shadow-lg shadow-purple-500/10 z-50">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
          {t('appTitle')}
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={disableLanguageChange}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.002 6.002 0 0111.336 0l2.122 2.121a1 1 0 01-1.414 1.415L14.142 9.32a4.001 4.001 0 00-8.284 0l-2.23 2.23a1 1 0 01-1.414-1.415l2.121-2.121z" clipRule="evenodd" /></svg>
              <span>{languageOptions[locale]}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {isOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-slate-800 rounded-md shadow-lg border border-slate-700">
                {(Object.keys(languageOptions) as Locale[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/50"
                  >
                    {languageOptions[lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onReset}
            className="bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
          >
            {t('startNewAnalysis')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;