'use client'

import { useState } from 'react'
import Link from 'next/link'

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
  const [sourceA, setSourceA] = useState('')
  const [sourceB, setSourceB] = useState('')
  const [arena, setArena] = useState('サイバー空間')
  const [battle, setBattle] = useState<Battle | null>(null)
  const [loading, setLoading] = useState(false)

  const arenas = [
    'サイバー空間',
    '法廷',
    '詩のバトル',
    '料理対決',
    '哲学論争',
  ]

  const handleCreateBattle = async () => {
    if (!sourceA.trim() || !sourceB.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/battles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceA, sourceB, arena }),
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
      <h1 className="text-4xl font-bold text-arena-primary mb-8">
        ⚔️ バトル作成
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-gray-400 mb-2">Agent A 召喚ソース</label>
          <input
            type="text"
            value={sourceA}
            onChange={(e) => setSourceA(e.target.value)}
            placeholder="https://example.com/a"
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-arena-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-400 mb-2">Agent B 召喚ソース</label>
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
        <label className="block text-gray-400 mb-2">舞台設定</label>
        <select
          value={arena}
          onChange={(e) => setArena(e.target.value)}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:border-arena-primary focus:outline-none"
        >
          {arenas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleCreateBattle}
        disabled={loading || !sourceA.trim() || !sourceB.trim()}
        className="px-6 py-3 bg-arena-accent text-white rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
      >
        {loading ? 'バトル作成中...' : 'バトル作成'}
      </button>

      {battle && (
        <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            {battle.agentA.name} vs {battle.agentB.name}
          </h2>
          <p className="text-gray-400 mb-4">舞台: {battle.arena}</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <AgentCard agent={battle.agentA} label="A" />
            <AgentCard agent={battle.agentB} label="B" />
          </div>

          <Link
            href={`/battles/${battle.id}`}
            className="inline-block px-6 py-3 bg-arena-primary text-white rounded-lg hover:bg-opacity-80 transition"
          >
            バトル開始 →
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
