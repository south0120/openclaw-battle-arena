import { NextRequest, NextResponse } from 'next/server'
import { summonAgent } from '@/lib/summon'

export async function POST(request: NextRequest) {
  try {
    const { source } = await request.json()

    if (!source || typeof source !== 'string') {
      return NextResponse.json(
        { error: 'source is required' },
        { status: 400 }
      )
    }

    const agent = await summonAgent(source)

    return NextResponse.json({ agent })
  } catch (error) {
    console.error('Summon error:', error)
    return NextResponse.json(
      { error: 'Failed to summon agent' },
      { status: 500 }
    )
  }
}
