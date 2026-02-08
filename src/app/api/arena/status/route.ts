import { NextResponse } from 'next/server'
import { getAllRegisteredAgents, getQueueStatus } from '@/lib/arena'
import { getAllBattles } from '@/lib/store'

export async function GET() {
  const agents = getAllRegisteredAgents()
  const queue = getQueueStatus()
  const battles = getAllBattles()
  
  const activeBattles = battles.filter(b => b.status !== 'finished')
  const finishedBattles = battles.filter(b => b.status === 'finished')

  return NextResponse.json({
    registeredAgents: agents.length,
    queuedForMatch: queue.count,
    activeBattles: activeBattles.length,
    totalBattles: battles.length,
    recentBattles: finishedBattles.slice(0, 5).map(b => ({
      id: b.id,
      agentA: b.agentA.name,
      agentB: b.agentB.name,
      winner: b.winner,
      finishedAt: b.finishedAt,
    })),
  })
}
