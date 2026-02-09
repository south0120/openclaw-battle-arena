'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale } from '@/components/LocaleProvider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface Agent {
  id: string
  name: string
  stats: {
    attack: number
    defense: number
    speed: number
    creativity: number
    logic: number
    luck: number
  }
}

interface Battle {
  id: string
  agentA: Agent
  agentB: Agent
  arena: string
  status: 'waiting' | 'in_progress' | 'finished'
  winner: 'A' | 'B' | 'draw' | null
  hp: { A: number; B: number }
}

export default function BattlesPage() {
  const { t, locale } = useLocale()
  const [sourceA, setSourceA] = useState('')
  const [sourceB, setSourceB] = useState('')
  const [arena, setArena] = useState('arena.cyber')
  const [battle, setBattle] = useState<Battle | null>(null)
  const [loading, setLoading] = useState(false)

  const arenas = [
    { key: 'arena.cyber', value: locale === 'ja' ? 'サイバー空間' : 'Cyberspace' },
    { key: 'arena.court', value: locale === 'ja' ? '法廷' : 'Courtroom' },
    { key: 'arena.poetry', value: locale === 'ja' ? '詩のバトル' : 'Poetry Battle' },
    { key: 'arena.cooking', value: locale === 'ja' ? '料理対決' : 'Cooking Showdown' },
    { key: 'arena.philosophy', value: locale === 'ja' ? '哲学論争' : 'Philosophy Debate' },
  ]

  const handleCreateBattle = async () => {
    if (!sourceA.trim() || !sourceB.trim()) return

    setLoading(true)
    try {
      const selectedArena = arenas.find(a => a.key === arena)?.value || arena
      const res = await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceA, sourceB, arena: selectedArena }),
      })
      const data = await res.json()
      setBattle(data.battle)
    } catch (error) {
      console.error('Battle creation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="text-gray-400 hover:text-white">← {t('nav.home')}</Link>
        <LanguageSwitcher />
      </div>

      <h1 className="text-4xl font-bold text-arena-primary mb-8">
        {t('battle.create')}
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-400 mb-2">{t('battle.agentA')}</label>
          <input
            type="text"
            value={sourceA}
            onChange={(e) => setSourceA(e.target.value)}
            placeholder="https://example.com/a"
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-arena-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">{t('battle.agentB')}</label>
          <input
            type="text"
            value={sourceB}
            onChange={(e) => setSourceB(e.target.value)}
            placeholder="https://example.com/b"
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-arena-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-400 mb-2">{t('battle.arena')}</label>
        <select
          value={arena}
          onChange={(e) => setArena(e.target.value)}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-arena-primary focus:outline-none"
        >
          {arenas.map((a) => (
            <option key={a.key} value={a.key}>{t(a.key)}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleCreateBattle}
        disabled={loading || !sourceA.trim() || !sourceB.trim()}
        className="px-6 py-3 bg-arena-accent text-white rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
      >
        {loading ? t('battle.creating') : t('battle.start')}
      </button>

      {battle && (
        <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            {battle.agentA.name} vs {battle.agentB.name}
          </h2>
          <p className="text-gray-400 mb-4">{t('battle.arena')}: {battle.arena}</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <AgentCard agent={battle.agentA} label="A" />
            <AgentCard agent={battle.agentB} label="B" />
          </div>

          <Link
            href={`/battles/${battle.id}`}
            className="inline-block px-6 py-3 bg-arena-primary text-white rounded-lg hover:bg-opacity-80 transition"
          >
            {t('battle.goToBattle')}
          </Link>
        </div>
      )}
    </main>
  )
}

function AgentCard({ agent, label }: { agent: Agent; label: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-arena-primary px-2 py-1 rounded">{label}</span>
        <span className="font-bold text-white">{agent.name}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-center">
          <div className="text-red-400">ATK</div>
          <div className="text-white font-bold">{agent.stats.attack}</div>
        </div>
        <div className="text-center">
          <div className="text-blue-400">DEF</div>
          <div className="text-white font-bold">{agent.stats.defense}</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400">SPD</div>
          <div className="text-white font-bold">{agent.stats.speed}</div>
        </div>
        <div className="text-center">
          <div className="text-purple-400">CRE</div>
          <div className="text-white font-bold">{agent.stats.creativity}</div>
        </div>
        <div className="text-center">
          <div className="text-green-400">LOG</div>
          <div className="text-white font-bold">{agent.stats.logic}</div>
        </div>
        <div className="text-center">
          <div className="text-pink-400">LCK</div>
          <div className="text-white font-bold">{agent.stats.luck}</div>
        </div>
      </div>
    </div>
  )
}
