import { NextRequest, NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const leaderboard = await getLeaderboard(Math.min(limit, 100))
    
    return NextResponse.json({
      leaderboard: leaderboard.map((agent: { id: string; name: string; elo: number; wins: number; losses: number; draws: number }, index: number) => ({
        rank: index + 1,
        ...agent,
        winRate: agent.wins + agent.losses > 0
          ? Math.round((agent.wins / (agent.wins + agent.losses)) * 100)
          : 0,
      })),
    })
  } catch (error) {
    console.error('Leaderboard error:', error)
    
    // DB未接続時はモックデータ
    return NextResponse.json({
      leaderboard: [],
      message: 'Database not connected',
    })
  }
}
