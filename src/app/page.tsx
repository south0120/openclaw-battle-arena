'use client'

import { useLocale } from '@/components/LocaleProvider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import Link from 'next/link'

export default function Home() {
  const { t } = useLocale()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <h1 className="text-5xl font-bold text-arena-primary mb-4">
        {t('home.title')}
      </h1>
      <p className="text-xl text-gray-400 mb-8">
        {t('home.subtitle')}
      </p>
      <div className="flex gap-4">
        <Link
          href="/summon"
          className="px-6 py-3 bg-arena-primary text-white rounded-lg hover:bg-opacity-80 transition"
        >
          {t('home.summon')}
        </Link>
        <Link
          href="/battles"
          className="px-6 py-3 border border-arena-primary text-arena-primary rounded-lg hover:bg-arena-primary hover:text-white transition"
        >
          {t('home.watch')}
        </Link>
      </div>
    </main>
  )
}
