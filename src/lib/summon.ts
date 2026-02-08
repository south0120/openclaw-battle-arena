import crypto from 'crypto'

export interface AgentStats {
  attack: number
  defense: number
  speed: number
  creativity: number
  logic: number
  luck: number
}

export interface Agent {
  id: string
  name: string
  source: string
  stats: AgentStats
  createdAt: Date
}

/**
 * ハッシュの一部を0-100の能力値に変換
 */
function hexToStat(hex: string): number {
  const value = parseInt(hex, 16)
  return Math.floor((value / 0xffffffff) * 100)
}

/**
 * URLやテキストからエージェントを召喚
 * 同じ入力からは同じエージェントが生成される（決定論的）
 */
export async function summonAgent(source: string): Promise<Agent> {
  const hash = crypto.createHash('sha256').update(source).digest('hex')

  const stats: AgentStats = {
    attack: hexToStat(hash.slice(0, 8)),
    defense: hexToStat(hash.slice(8, 16)),
    speed: hexToStat(hash.slice(16, 24)),
    creativity: hexToStat(hash.slice(24, 32)),
    logic: hexToStat(hash.slice(32, 40)),
    luck: hexToStat(hash.slice(40, 48)),
  }

  // 名前生成（ハッシュから決定論的に）
  const nameHash = hash.slice(48, 56)
  const name = generateName(nameHash)

  return {
    id: hash.slice(0, 16),
    name,
    source,
    stats,
    createdAt: new Date(),
  }
}

/**
 * ハッシュから名前を生成
 */
function generateName(hex: string): string {
  const prefixes = ['Shadow', 'Cyber', 'Neo', 'Alpha', 'Omega', 'Zero', 'Blaze', 'Storm']
  const suffixes = ['Walker', 'Blade', 'Core', 'Mind', 'Spirit', 'Force', 'Code', 'Logic']
  
  const prefixIndex = parseInt(hex.slice(0, 4), 16) % prefixes.length
  const suffixIndex = parseInt(hex.slice(4, 8), 16) % suffixes.length
  
  return `${prefixes[prefixIndex]}${suffixes[suffixIndex]}`
}
