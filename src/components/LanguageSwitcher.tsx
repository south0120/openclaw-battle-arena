'use client'

import { useLocale } from './LocaleProvider'
import { Locale, locales } from '@/lib/i18n'

const localeNames: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="flex gap-2">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`px-3 py-1 rounded text-sm transition ${
            locale === l
              ? 'bg-arena-primary text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {localeNames[l]}
        </button>
      ))}
    </div>
  )
}
