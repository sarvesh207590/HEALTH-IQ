// Consultation route - aligned with Python chat_system.py consultation workflow
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  startConsultation,
  getNextSpecialistOpinion,
  generateSummary,
  ConsultationWorkflow,
} from '@/lib/services/consultation-service'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { caseId, action } = body

    if (!caseId) {
      return NextResponse.json({ error: 'Missing caseId' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    let response
    if (action === 'start') {
      response = await startConsultation(caseId, session.user.id)
    } else if (action === 'next') {
      response = await getNextSpecialistOpinion(caseId, session.user.id)
    } else if (action === 'summary') {
      response = await generateSummary(caseId, session.user.id)
    } else {
      // Default: process based on current stage
      const workflow = new ConsultationWorkflow()
      response = await workflow.processConsultation(caseId, '', session.user.id)
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error('Consultation error:', error)
    return NextResponse.json({ error: 'Failed to process consultation' }, { status: 500 })
  }
}
