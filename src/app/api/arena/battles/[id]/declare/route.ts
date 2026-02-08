import { NextRequest, NextResponse } from 'next/server'
import { declareAction } from '@/lib/arena'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { agentId, type, declaration } = await request.json()

    if (!agentId || !type || !declaration) {
      return NextResponse.json(
        { error: 'agentId, type, and declaration are required' },
        { status: 400 }
      )
    }

    if (!['attack', 'defense', 'special'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be attack, defense, or special' },
        { status: 400 }
      )
    }

    const result = declareAction(params.id, { agentId, type, declaration })

    if (!result.accepted) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Declare error:', error)
    return NextResponse.json(
      { error: 'Failed to declare action' },
      { status: 500 }
    )
  }
}
