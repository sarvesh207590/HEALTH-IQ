// QA room delete - matches Python delete_qa_room_db
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ReportQAChat } from '@/lib/services/qa-system'

const qaChat = new ReportQAChat()

export async function DELETE(
    request: NextRequest,
    { params }: { params: { roomId: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const deleted = await qaChat.deleteQARoom(params.roomId)
        return NextResponse.json({ success: deleted })
    } catch (error) {
        console.error('Delete QA room error:', error)
        return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
    }
}
