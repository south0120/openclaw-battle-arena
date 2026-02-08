import { NextRequest, NextResponse } from 'next/server'
import { getBattle } from '@/lib/store'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const battle = getBattle(params.id)

  if (!battle) {
    return NextResponse.json(
      { error: 'Battle not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ battle })
}
