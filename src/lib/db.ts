// ELOレーティング計算
export function calculateElo(
  winnerElo: number,
  loserElo: number,
  isDraw: boolean = false
): { newWinnerElo: number; newLoserElo: number } {
  const K = 32 // K-factor
  
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400))
  
  if (isDraw) {
    const newWinnerElo = Math.round(winnerElo + K * (0.5 - expectedWinner))
    const newLoserElo = Math.round(loserElo + K * (0.5 - expectedLoser))
    return { newWinnerElo, newLoserElo }
  }
  
  const newWinnerElo = Math.round(winnerElo + K * (1 - expectedWinner))
  const newLoserElo = Math.round(loserElo + K * (0 - expectedLoser))
  
  return { newWinnerElo, newLoserElo }
}

// Prismaクライアント（遅延初期化）
let prismaClient: any = null

export async function getPrisma() {
  if (!process.env.DATABASE_URL) {
    return null
  }
  
  if (!prismaClient) {
    const { PrismaClient } = await import('@prisma/client')
    prismaClient = new PrismaClient()
  }
  
  return prismaClient
}

// ランキング取得
export async function getLeaderboard(limit: number = 20) {
  const prisma = await getPrisma()
  
  if (!prisma) {
    // DB未接続時は空配列
    return []
  }
  
  return prisma.agent.findMany({
    orderBy: { elo: 'desc' },
    take: limit,
    select: {
      id: true,
      name: true,
      elo: true,
      wins: true,
      losses: true,
      draws: true,
    },
  })
}

// エージェント統計
export async function getAgentStats(agentId: string) {
  const prisma = await getPrisma()
  
  if (!prisma) {
    return null
  }
  
  const agent = await prisma.agent.findUnique({
    where: { agentId },
    include: {
      battlesAsA: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { agentB: { select: { name: true } } },
      },
      battlesAsB: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { agentA: { select: { name: true } } },
      },
    },
  })
  
  return agent
}
