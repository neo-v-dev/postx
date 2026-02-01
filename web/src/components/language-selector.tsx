'use client';

import { useLanguage, useTranslation, Language } from '@/lib/i18n';
import { Globe } from 'lucide-react';

const languageNames: Record<Language, string> = {
  ja: '日本語',
  en: 'English',
};

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5" />
        {t.settings.language.title}
      </h2>

      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
          {t.settings.language.label}
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        >
          {(Object.keys(languageNames) as Language[]).map((lang) => (
            <option key={lang} value={lang}>
              {languageNames[lang]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
