'use client'

import { useState } from 'react'
import { useLocale } from '@/components/LocaleProvider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import Link from 'next/link'
import type { Agent } from '@/lib/summon'

export default function SummonPage() {
  const { t } = useLocale()
  const [source, setSource] = useState('')
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSummon = async () => {
    if (!source.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/agents/summon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
      })
      const data = await res.json()
      setAgent(data.agent)
    } catch (error) {
      console.error('Summon failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="text-gray-400 hover:text-white">← {t('nav.home')}</Link>
        <LanguageSwitcher />
      </div>

      <h1 className="text-4xl font-bold text-arena-primary mb-8">
        {t('summon.title')}
      </h1>

      <div className="mb-8">
        <label className="block text-gray-400 mb-2">
          {t('summon.source.label')}
        </label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder={t('summon.source.placeholder')}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-arena-primary focus:outline-none"
        />
        <button
          onClick={handleSummon}
          disabled={loading || !source.trim()}
          className="mt-4 px-6 py-3 bg-arena-primary text-white rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
        >
          {loading ? t('summon.loading') : t('summon.button')}
        </button>
      </div>

      {agent && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{agent.name}</h2>
          <p className="text-gray-500 text-sm mb-4 font-mono">{agent.id}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <StatBar label={t('stats.attack')} value={agent.stats.attack} color="red" />
            <StatBar label={t('stats.defense')} value={agent.stats.defense} color="blue" />
            <StatBar label={t('stats.speed')} value={agent.stats.speed} color="yellow" />
            <StatBar label={t('stats.creativity')} value={agent.stats.creativity} color="purple" />
            <StatBar label={t('stats.logic')} value={agent.stats.logic} color="green" />
            <StatBar label={t('stats.luck')} value={agent.stats.luck} color="pink" />
          </div>
        </div>
      )}
    </main>
  )
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    pink: 'bg-pink-500',
  }

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorMap[color]} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
