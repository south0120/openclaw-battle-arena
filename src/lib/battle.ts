import type { Agent } from './summon'

export type ActionType = 'attack' | 'defense' | 'special'

export interface BattleAction {
  type: ActionType
  declaration: string // 自由テキスト宣言
}

export interface JudgeScore {
  total: number
  reasoning: string
}

export interface TurnResult {
  turnNumber: number
  actionA: BattleAction
  actionB: BattleAction
  scoreA: JudgeScore
  scoreB: JudgeScore
  turnWinner: 'A' | 'B' | 'draw'
  damageToA: number
  damageToB: number
}

export interface Battle {
  id: string
  agentA: Agent
  agentB: Agent
  arena: string // 舞台設定
  status: 'waiting' | 'in_progress' | 'finished'
  turns: TurnResult[]
  winner: 'A' | 'B' | 'draw' | null
  hp: {
    A: number
    B: number
  }
  createdAt: Date
  finishedAt: Date | null
  // エージェントからの行動宣言（保留中）
  pendingActions?: {
    A?: BattleAction
    B?: BattleAction
  }
}

/**
 * ダメージ計算（能力値で補正）
 */
export function calculateDamage(
  baseScore: number,
  attacker: Agent,
  defender: Agent,
  actionType: ActionType
): number {
  let damage = baseScore * 3 // 基本ダメージ

  // 攻撃タイプなら攻撃力で補正
  if (actionType === 'attack') {
    damage *= 0.7 + (attacker.stats.attack / 100) * 0.6
    damage *= 1.3 - (defender.stats.defense / 100) * 0.6
  }

  // スピード差でクリティカル
  if (attacker.stats.speed > defender.stats.speed + 20) {
    damage *= 1.2
  }

  return Math.floor(damage)
}

/**
 * バトルIDを生成
 */
export function generateBattleId(): string {
  return `battle_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
