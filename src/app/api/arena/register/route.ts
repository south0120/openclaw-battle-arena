import { NextRequest, NextResponse } from 'next/server'
import { registerAgent, getRegisteredAgent } from '@/lib/arena'

export async function POST(request: NextRequest) {
  try {
    const { agentId, name, profile } = await request.json()

    if (!agentId || typeof agentId !== 'string') {
      return NextResponse.json(
        { error: 'agentId is required' },
        { status: 400 }
      )
    }

    // 既に登録済みならそれを返す
    const existing = getRegisteredAgent(agentId)
    if (existing) {
      return NextResponse.json({ 
        agent: existing, 
        message: 'Already registered' 
      })
    }

    const agent = registerAgent({ agentId, name, profile })

    return NextResponse.json({ 
      agent, 
      message: 'Registered successfully' 
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    )
  }
}
