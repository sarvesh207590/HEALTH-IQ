// QA messages route - matches Python qa_interface.py add_message_db / get_messages_db
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ReportQAChat, ReportQASystem } from '@/lib/services/qa-system'

const qaChat = new ReportQAChat()

export async function GET(
    request: NextRequest,
    { params }: { params: { roomId: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const messages = await qaChat.getMessages(params.roomId)
        return NextResponse.json({ success: true, data: messages })
    } catch (error) {
        console.error('Get QA messages error:', error)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { roomId: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { message } = body
        if (!message?.trim()) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 })
        }

        const userName = session.user.name || 'User'
        const userId = session.user.id

        // 1. Store user message (matches Python add_message_db)
        await qaChat.addMessage(params.roomId, userName, message)

        // 2. Get RAG-based AI answer (matches Python qa_system.answer_question)
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
        }

        const qaSystem = new ReportQASystem(apiKey)
        const answer = await qaSystem.answerQuestion(message, userId)

        // 3. Store AI response (matches Python add_message_db for "Report QA System")
        await qaChat.addMessage(params.roomId, 'Report QA System', answer)

        return NextResponse.json({ success: true, data: { answer } })
    } catch (error) {
        console.error('QA message error:', error)
        return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
    }
}
