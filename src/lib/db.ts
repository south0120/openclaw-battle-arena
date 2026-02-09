import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

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

// ランキング取得
export async function getLeaderboard(limit: number = 20) {
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
