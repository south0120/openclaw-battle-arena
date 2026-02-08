import { NextRequest, NextResponse } from 'next/server'
import { generateBattleId, type Battle } from '@/lib/battle'
import { summonAgent } from '@/lib/summon'

// インメモリストレージ（MVP用）
const battles = new Map<string, Battle>()

export async function POST(request: NextRequest) {
  try {
    const { sourceA, sourceB, arena } = await request.json()

    if (!sourceA || !sourceB) {
      return NextResponse.json(
        { error: 'sourceA and sourceB are required' },
        { status: 400 }
      )
    }

    const [agentA, agentB] = await Promise.all([
      summonAgent(sourceA),
      summonAgent(sourceB),
    ])

    const battle: Battle = {
      id: generateBattleId(),
      agentA,
      agentB,
      arena: arena || 'サイバー空間 - デジタルの戦場',
      status: 'waiting',
      turns: [],
      winner: null,
      hp: { A: 100, B: 100 },
      createdAt: new Date(),
      finishedAt: null,
    }

    battles.set(battle.id, battle)

    return NextResponse.json({ battle })
  } catch (error) {
    console.error('Battle creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create battle' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const allBattles = Array.from(battles.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20)

  return NextResponse.json({ battles: allBattles })
}
