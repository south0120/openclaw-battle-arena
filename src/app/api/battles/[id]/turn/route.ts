import { NextRequest, NextResponse } from 'next/server'
import { getBattle, updateBattle } from '@/lib/store'
import { generateAgentAction, judgeActions } from '@/lib/ai'
import type { TurnResult } from '@/lib/battle'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const battle = getBattle(params.id)

  if (!battle) {
    return NextResponse.json(
      { error: 'Battle not found' },
      { status: 404 }
    )
  }

  if (battle.status === 'finished') {
    return NextResponse.json(
      { error: 'Battle already finished' },
      { status: 400 }
    )
  }

  const turnNumber = battle.turns.length + 1

  // バトル開始
  if (battle.status === 'waiting') {
    battle.status = 'in_progress'
  }

  // 両エージェントの行動を生成
  const [actionA, actionB] = await Promise.all([
    generateAgentAction(battle.agentA, battle.agentB, battle.arena, battle.turns, 'A'),
    generateAgentAction(battle.agentB, battle.agentA, battle.arena, battle.turns, 'B'),
  ])

  // ジャッジ評価
  const { scoreA, scoreB } = await judgeActions(
    battle.agentA,
    battle.agentB,
    actionA,
    actionB,
    battle.arena,
    turnNumber
  )

  // 勝敗判定
  let turnWinner: 'A' | 'B' | 'draw' = 'draw'
  let damageToA = 0
  let damageToB = 0

  if (scoreA.total > scoreB.total) {
    turnWinner = 'A'
    damageToB = Math.floor((scoreA.total - scoreB.total) * 3)
  } else if (scoreB.total > scoreA.total) {
    turnWinner = 'B'
    damageToA = Math.floor((scoreB.total - scoreA.total) * 3)
  }

  // HP更新
  battle.hp.A = Math.max(0, battle.hp.A - damageToA)
  battle.hp.B = Math.max(0, battle.hp.B - damageToB)

  // ターン結果を記録
  const turnResult: TurnResult = {
    turnNumber,
    actionA,
    actionB,
    scoreA,
    scoreB,
    turnWinner,
    damageToA,
    damageToB,
  }
  battle.turns.push(turnResult)

  // 終了判定（3ターン経過 or HP0）
  if (turnNumber >= 3 || battle.hp.A <= 0 || battle.hp.B <= 0) {
    battle.status = 'finished'
    battle.finishedAt = new Date()
    
    if (battle.hp.A <= 0 && battle.hp.B <= 0) {
      battle.winner = 'draw'
    } else if (battle.hp.A <= 0) {
      battle.winner = 'B'
    } else if (battle.hp.B <= 0) {
      battle.winner = 'A'
    } else if (battle.hp.A > battle.hp.B) {
      battle.winner = 'A'
    } else if (battle.hp.B > battle.hp.A) {
      battle.winner = 'B'
    } else {
      battle.winner = 'draw'
    }
  }

  updateBattle(battle)

  return NextResponse.json({ battle, turn: turnResult })
}
