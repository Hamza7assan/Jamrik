"use client";

import React, { createContext, useState, ReactNode, useEffect } from "react";
import { dictionary, Language } from "../utils/dictionary";

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('jamrik_language') as Language;
    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const next = prev === 'en' ? 'ar' : 'en';
      localStorage.setItem('jamrik_language', next);
      return next;
    });
  };

  const t = (key: string) => {
    return dictionary[language][key as keyof typeof dictionary['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};
