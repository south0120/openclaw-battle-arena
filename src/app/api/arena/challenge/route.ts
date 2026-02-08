import { NextRequest, NextResponse } from 'next/server'
import { challengeBattle, getRegisteredAgent } from '@/lib/arena'

export async function POST(request: NextRequest) {
  try {
    const { challengerId, targetId } = await request.json()

    if (!challengerId || typeof challengerId !== 'string') {
      return NextResponse.json(
        { error: 'challengerId is required' },
        { status: 400 }
      )
    }

    // 登録確認
    const challenger = getRegisteredAgent(challengerId)
    if (!challenger) {
      return NextResponse.json(
        { error: 'Challenger not registered. Call /api/arena/register first.' },
        { status: 400 }
      )
    }

    const result = challengeBattle({ challengerId, targetId })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Challenge error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
