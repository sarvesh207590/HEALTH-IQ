// Chat rooms route - aligned with Python chat_system.py
// Uses "chats" collection with Python field names
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createChatRoom, getAvailableRooms } from '@/lib/services/chat-service'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rooms = await getAvailableRooms(session.user.id)
    return NextResponse.json({ success: true, data: rooms })
  } catch (error) {
    console.error('Get rooms error:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { caseDescription, description, fileType } = body
    const desc = caseDescription || description

    if (!desc) {
      return NextResponse.json({ error: 'Case description is required' }, { status: 400 })
    }

    const prefix = fileType ? fileType.toUpperCase() : 'CASE'
    const caseId = `${prefix}-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}`

    await createChatRoom(caseId, session.user.name || 'User', desc, session.user.id)

    return NextResponse.json({ success: true, data: { roomId: caseId } })
  } catch (error) {
    console.error('Create room error:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}
