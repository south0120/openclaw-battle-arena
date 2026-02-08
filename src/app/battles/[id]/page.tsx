'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Agent {
  id: string
  name: string
  stats: Record<string, number>
}

interface TurnResult {
  turnNumber: number
  actionA: { type: string; declaration: string }
  actionB: { type: string; declaration: string }
  scoreA: { total: number; reasoning: string }
  scoreB: { total: number; reasoning: string }
  turnWinner: 'A' | 'B' | 'draw'
  damageToA: number
  damageToB: number
}

interface Battle {
  id: string
  agentA: Agent
  agentB: Agent
  arena: string
  status: 'waiting' | 'in_progress' | 'finished'
  turns: TurnResult[]
  winner: 'A' | 'B' | 'draw' | null
  hp: { A: number; B: number }
}

export default function BattlePage() {
  const params = useParams()
  const battleId = params.id as string

  const [battle, setBattle] = useState<Battle | null>(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [currentTurn, setCurrentTurn] = useState(0)

  useEffect(() => {
    fetchBattle()
  }, [battleId])

  const fetchBattle = async () => {
    try {
      const res = await fetch(`/api/battles/${battleId}`)
      const data = await res.json()
      setBattle(data.battle)
      setCurrentTurn(data.battle.turns.length)
    } catch (error) {
      console.error('Failed to fetch battle:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeTurn = async () => {
    if (!battle || executing) return

    setExecuting(true)
    try {
      const res = await fetch(`/api/battles/${battleId}/turn`, {
        method: 'POST',
      })
      const data = await res.json()
      setBattle(data.battle)
      setCurrentTurn(data.battle.turns.length)
    } catch (error) {
      console.error('Turn execution failed:', error)
    } finally {
      setExecuting(false)
    }
  }

  const executeAllTurns = async () => {
    if (!battle || executing) return

    setExecuting(true)
    try {
      // 3ターン実行
      for (let i = 0; i < 3 - (battle.turns?.length || 0); i++) {
        const res = await fetch(`/api/battles/${battleId}/turn`, {
          method: 'POST',
        })
        const data = await res.json()
        setBattle(data.battle)
        setCurrentTurn(data.battle.turns.length)
        
        if (data.battle.status === 'finished') break
        
        // 演出用のディレイ
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('Battle execution failed:', error)
    } finally {
      setExecuting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </main>
    )
  }

  if (!battle) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-400">Battle not found</div>
      </main>
    )
  }

  const isFinished = battle.status === 'finished'

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {battle.agentA.name} ⚔️ {battle.agentB.name}
        </h1>
        <p className="text-gray-400">舞台: {battle.arena}</p>
      </div>

      {/* HP Bars */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-arena-primary font-bold">{battle.agentA.name}</span>
            <span className="text-white">{battle.hp.A} HP</span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-arena-primary transition-all duration-500"
              style={{ width: `${battle.hp.A}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-arena-accent font-bold">{battle.agentB.name}</span>
            <span className="text-white">{battle.hp.B} HP</span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-arena-accent transition-all duration-500"
              style={{ width: `${battle.hp.B}%` }}
            />
          </div>
        </div>
      </div>

      {/* Battle Controls */}
      {!isFinished && (
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={executeTurn}
            disabled={executing}
            className="px-6 py-3 bg-arena-primary text-white rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
          >
            {executing ? '実行中...' : '次のターン'}
          </button>
          <button
            onClick={executeAllTurns}
            disabled={executing}
            className="px-6 py-3 bg-arena-accent text-white rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
          >
            {executing ? '実行中...' : '最後まで実行'}
          </button>
        </div>
      )}

      {/* Winner Banner */}
      {isFinished && battle.winner && (
        <div className={`text-center py-6 mb-8 rounded-lg ${
          battle.winner === 'draw' 
            ? 'bg-gray-800' 
            : battle.winner === 'A' 
              ? 'bg-arena-primary/20 border border-arena-primary' 
              : 'bg-arena-accent/20 border border-arena-accent'
        }`}>
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-white">
            {battle.winner === 'draw' 
              ? '引き分け！' 
              : `${battle.winner === 'A' ? battle.agentA.name : battle.agentB.name} の勝利！`}
          </div>
        </div>
      )}

      {/* Turn History */}
      <div className="space-y-6">
        {battle.turns.map((turn) => (
          <TurnCard key={turn.turnNumber} turn={turn} battle={battle} />
        ))}
      </div>
    </main>
  )
}

function TurnCard({ turn, battle }: { turn: TurnResult; battle: Battle }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white">Turn {turn.turnNumber}</h3>
        <span className={`px-3 py-1 rounded text-sm font-bold ${
          turn.turnWinner === 'draw'
            ? 'bg-gray-700 text-gray-300'
            : turn.turnWinner === 'A'
              ? 'bg-arena-primary text-white'
              : 'bg-arena-accent text-white'
        }`}>
          {turn.turnWinner === 'draw' 
            ? 'DRAW' 
            : `${turn.turnWinner === 'A' ? battle.agentA.name : battle.agentB.name} WIN`}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Agent A */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-arena-primary px-2 py-1 rounded">A</span>
            <span className="font-bold text-white">{battle.agentA.name}</span>
            <span className="text-xs text-gray-400">[{turn.actionA.type}]</span>
          </div>
          <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">
            "{turn.actionA.declaration}"
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Score</span>
            <span className="text-arena-primary font-bold">{turn.scoreA.total}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{turn.scoreA.reasoning}</p>
          {turn.damageToB > 0 && (
            <div className="text-xs text-arena-win mt-2">→ {turn.damageToB} ダメージ</div>
          )}
        </div>

        {/* Agent B */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-arena-accent px-2 py-1 rounded">B</span>
            <span className="font-bold text-white">{battle.agentB.name}</span>
            <span className="text-xs text-gray-400">[{turn.actionB.type}]</span>
          </div>
          <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">
            "{turn.actionB.declaration}"
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Score</span>
            <span className="text-arena-accent font-bold">{turn.scoreB.total}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{turn.scoreB.reasoning}</p>
          {turn.damageToA > 0 && (
            <div className="text-xs text-arena-win mt-2">→ {turn.damageToA} ダメージ</div>
          )}
        </div>
      </div>
    </div>
  )
}
