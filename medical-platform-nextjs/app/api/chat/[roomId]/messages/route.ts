// Chat messages route - aligned with Python chat_system.py
// POST stores user message AND generates RAG-based AI response (same as Streamlit)
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getMessages, addMessage } from '@/lib/services/chat-service'
import { chatsCol, qaAnalysesCol } from '@/lib/db/collections'
import { openai } from '@/lib/ai/openai'

// RAG: fetch relevant analyses from qa_analyses using cosine similarity
async function getRelevantContext(query: string, userId: string, topK = 3): Promise<string> {
  try {
    const col = await qaAnalysesCol()
    const docs = await col.find({ user_id: userId }).toArray()
    if (!docs.length) return ''

    // Get query embedding
    const embRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })
    const queryVec = embRes.data[0].embedding

    // Score each analysis
    const scored = await Promise.all(docs.map(async (doc) => {
      let text = doc.analysis || ''
      if (doc.findings?.length) text += `\nFindings: ${doc.findings.join(', ')}`
      text += `\nFile: ${doc.filename} | Date: ${String(doc.date).slice(0, 10)}`

      const docEmb = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.slice(0, 2000), // limit tokens
      })
      const docVec = docEmb.data[0].embedding

      // cosine similarity
      const dot = queryVec.reduce((s, v, i) => s + v * docVec[i], 0)
      const magA = Math.sqrt(queryVec.reduce((s, v) => s + v * v, 0))
      const magB = Math.sqrt(docVec.reduce((s, v) => s + v * v, 0))
      const score = dot / (magA * magB)

      return { score, text }
    }))

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, topK).map(c => c.text).join('\n\n---\n\n')
  } catch (e) {
    console.error('RAG context error:', e)
    return ''
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const messages = await getMessages(params.roomId, session.user.id)
    return NextResponse.json({ success: true, data: messages })
  } catch (error) {
    console.error('Get messages error:', error)
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
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const roomId = params.roomId
    const userId = session.user.id
    const userName = session.user.name || 'User'

    // 1. Store user message
    const userMsg = await addMessage(roomId, userName, message, userId, 'text')
    if (!userMsg) {
      return NextResponse.json({ error: 'Failed to add message' }, { status: 500 })
    }

    // 2. Generate RAG-based AI response - matches Python chat_system.py behavior
    const col = await chatsCol()
    const room = await col.findOne({ _id: roomId as any, user_id: userId })

    if (room) {
      try {
        const stage = room.consultation_stage || 'initial'
        const opinions: string[] = room.specialist_opinions || []

        // Pick responder based on stage (matches Python specialist rotation)
        const responderName =
          stage === 'summary' || stage === 'complete'
            ? 'Dr. Lisa Thompson (Chief Medical Officer)'
            : stage === 'specialists' && opinions.length >= 2
              ? 'Dr. Emily Johnson (Pulmonologist)'
              : stage === 'specialists' && opinions.length >= 1
                ? 'Dr. Sarah Chen (Cardiologist)'
                : 'Dr. Michael Rodriguez (Radiologist)'

        // RAG: retrieve relevant medical analyses for this user
        const ragContext = await getRelevantContext(message, userId)

        // Build conversation history from last 6 messages
        const recentMsgs = (room.messages || []).slice(-6)
        const conversationHistory = recentMsgs
          .filter((m: any) => m.type === 'text' || m.type === 'ai_response')
          .map((m: any) => ({
            role: (m.type === 'ai_response' ? 'assistant' : 'user') as 'assistant' | 'user',
            content: `${m.user}: ${m.content}`,
          }))

        // System prompt with RAG context + case context (matches Python)
        const systemPrompt = [
          `You are ${responderName}, a specialist in an ongoing multidisciplinary case discussion.`,
          `Case: "${room.description}"`,
          ragContext
            ? `Relevant medical analyses from this patient's records:\n${ragContext}`
            : '',
          opinions.length > 0
            ? `Specialist opinions so far:\n${opinions.map((o, i) => `${i + 1}. ${o}`).join('\n')}`
            : '',
          `Consultation stage: ${stage}`,
          '',
          'Answer the question directly and concisely using the case context and patient records above.',
          'Do NOT re-describe the image from scratch. Respond as a specialist in a live discussion.',
        ].filter(Boolean).join('\n')

        const aiRes = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: message },
          ],
          max_tokens: 350,
          temperature: 0.3,
        })

        const aiResponse = aiRes.choices[0].message.content?.trim() || 'No response generated.'
        await addMessage(roomId, responderName, aiResponse, userId, 'ai_response')
      } catch (e) {
        console.error('AI response error:', e)
        await addMessage(roomId, 'System', '⚠️ AI response failed. Please try again.', userId, 'system')
      }
    }

    return NextResponse.json({ success: true, data: userMsg })
  } catch (error) {
    console.error('Add message error:', error)
    return NextResponse.json({ error: 'Failed to add message' }, { status: 500 })
  }
}
