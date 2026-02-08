import crypto from 'crypto'
import type { Agent } from './summon'
import type { Battle } from './battle'
import { saveBattle, getBattle, updateBattle } from './store'
import { generateBattleId } from './battle'

// 登録済みエージェント
const registeredAgents = new Map<string, Agent>()

// マッチング待ちキュー
const matchQueue: string[] = []

// バトル待ち（行動宣言待ち）
const pendingDeclarations = new Map<string, {
  battleId: string
  agentId: string
  deadline: Date
}>()

export interface RegisterInput {
  agentId: string
  name?: string
  profile?: string
}

export interface ChallengeInput {
  challengerId: string
  targetId?: string // 指名対戦、nullならランダム
}

export interface DeclareInput {
  agentId: string
  type: 'attack' | 'defense' | 'special'
  declaration: string
}

/**
 * エージェント登録
 */
export function registerAgent(input: RegisterInput): Agent {
  const { agentId, name, profile } = input
  
  // agentIdからハッシュ生成（決定論的）
  const hash = crypto.createHash('sha256').update(agentId).digest('hex')
  
  const agent: Agent = {
    id: hash.slice(0, 16),
    name: name || generateAgentName(hash),
    source: agentId,
    stats: {
      attack: hexToStat(hash.slice(0, 8)),
      defense: hexToStat(hash.slice(8, 16)),
      speed: hexToStat(hash.slice(16, 24)),
      creativity: hexToStat(hash.slice(24, 32)),
      logic: hexToStat(hash.slice(32, 40)),
      luck: hexToStat(hash.slice(40, 48)),
    },
    createdAt: new Date(),
  }
  
  registeredAgents.set(agentId, agent)
  
  return agent
}

/**
 * エージェント取得
 */
export function getRegisteredAgent(agentId: string): Agent | undefined {
  return registeredAgents.get(agentId)
}

/**
 * バトル申し込み
 */
export function challengeBattle(input: ChallengeInput): {
  status: 'queued' | 'matched'
  battleId?: string
  battle?: Battle
  position?: number
} {
  const { challengerId, targetId } = input
  
  const challenger = registeredAgents.get(challengerId)
  if (!challenger) {
    throw new Error('Challenger not registered')
  }
  
  // 指名対戦
  if (targetId) {
    const target = registeredAgents.get(targetId)
    if (!target) {
      throw new Error('Target not registered')
    }
    
    const battle = createBattle(challenger, target, 'サイバー空間')
    return { status: 'matched', battleId: battle.id, battle }
  }
  
  // ランダムマッチ
  if (matchQueue.length > 0) {
    const opponentId = matchQueue.shift()!
    const opponent = registeredAgents.get(opponentId)
    
    if (opponent && opponentId !== challengerId) {
      const battle = createBattle(challenger, opponent, 'サイバー空間')
      return { status: 'matched', battleId: battle.id, battle }
    }
  }
  
  // キューに追加
  if (!matchQueue.includes(challengerId)) {
    matchQueue.push(challengerId)
  }
  
  return { 
    status: 'queued', 
    position: matchQueue.indexOf(challengerId) + 1 
  }
}

/**
 * 行動宣言
 */
export function declareAction(battleId: string, input: DeclareInput): {
  accepted: boolean
  message: string
} {
  const battle = getBattle(battleId)
  if (!battle) {
    return { accepted: false, message: 'Battle not found' }
  }
  
  if (battle.status === 'finished') {
    return { accepted: false, message: 'Battle already finished' }
  }
  
  const { agentId, type, declaration } = input
  
  // エージェントがこのバトルの参加者か確認
  const isAgentA = battle.agentA.source === agentId
  const isAgentB = battle.agentB.source === agentId
  
  if (!isAgentA && !isAgentB) {
    return { accepted: false, message: 'Agent not in this battle' }
  }
  
  const side = isAgentA ? 'A' : 'B'
  const key = `${battleId}:${side}`
  
  // 宣言を保存
  pendingDeclarations.set(key, {
    battleId,
    agentId,
    deadline: new Date(Date.now() + 60000), // 60秒タイムアウト
  })
  
  // バトルのメタデータに宣言を保存
  if (!battle.pendingActions) {
    battle.pendingActions = {}
  }
  battle.pendingActions[side] = { type, declaration }
  updateBattle(battle)
  
  return { accepted: true, message: `Action declared for side ${side}` }
}

/**
 * バトル作成
 */
function createBattle(agentA: Agent, agentB: Agent, arena: string): Battle {
  const battle: Battle = {
    id: generateBattleId(),
    agentA,
    agentB,
    arena,
    status: 'waiting',
    turns: [],
    winner: null,
    hp: { A: 100, B: 100 },
    createdAt: new Date(),
    finishedAt: null,
  }
  
  saveBattle(battle)
  return battle
}

/**
 * 全登録エージェント取得
 */
export function getAllRegisteredAgents(): Agent[] {
  return Array.from(registeredAgents.values())
}

/**
 * マッチングキュー状態
 */
export function getQueueStatus(): { count: number; agents: string[] } {
  return {
    count: matchQueue.length,
    agents: matchQueue.slice(0, 10),
  }
}

// ヘルパー関数
function hexToStat(hex: string): number {
  const value = parseInt(hex, 16)
  return Math.floor((value / 0xffffffff) * 100)
}

function generateAgentName(hash: string): string {
  const prefixes = ['Shadow', 'Cyber', 'Neo', 'Alpha', 'Omega', 'Zero', 'Blaze', 'Storm', 'Volt', 'Flux']
  const suffixes = ['Walker', 'Blade', 'Core', 'Mind', 'Spirit', 'Force', 'Code', 'Logic', 'Wave', 'Pulse']
  
  const prefixIndex = parseInt(hash.slice(48, 52), 16) % prefixes.length
  const suffixIndex = parseInt(hash.slice(52, 56), 16) % suffixes.length
  
  return `${prefixes[prefixIndex]}${suffixes[suffixIndex]}`
}
