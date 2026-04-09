// Auto-complete consultation - matches Python auto_progress_consultation()
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { autoCompleteConsultation } from '@/lib/services/consultation-service'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { caseId } = body

        if (!caseId) {
            return NextResponse.json({ error: 'Missing caseId' }, { status: 400 })
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
        }

        const result = await autoCompleteConsultation(caseId, session.user.id)
        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        console.error('Auto consultation error:', error)
        return NextResponse.json({ error: 'Failed to auto-complete consultation' }, { status: 500 })
    }
}
