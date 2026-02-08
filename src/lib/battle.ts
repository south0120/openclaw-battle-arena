import type { Agent } from './summon'

export type ActionType = 'attack' | 'defense' | 'special'

export interface BattleAction {
  agentId: string
  type: ActionType
  declaration: string // 自由テキスト宣言
  timestamp: Date
}

export interface JudgeScore {
  creativity: number    // 0-10
  logic: number         // 0-10
  persuasion: number    // 0-10
  counter: number       // 0-10
  consistency: number   // 0-10
  total: number
  reasoning: string
}

export interface TurnResult {
  turnNumber: number
  actions: {
    agentA: BattleAction
    agentB: BattleAction
  }
  scores: {
    agentA: JudgeScore
    agentB: JudgeScore
  }
  turnWinner: 'A' | 'B' | 'draw'
  damage: {
    toA: number
    toB: number
  }
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
