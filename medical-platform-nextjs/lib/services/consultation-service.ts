// Consultation Service - aligned with Python chat_system.py consultation workflow
// Stage and specialist_opinions stored on the chat room doc (same as Python)
import { v4 as uuidv4 } from 'uuid'
import { chatsCol } from '@/lib/db/collections'
import { getSpecialistResponse, getMultidisciplinarySummary, addMessage } from './chat-service'
import type { SpecialistType } from '@/lib/ai/prompts'

const SPECIALISTS: Array<{ type: SpecialistType; name: string }> = [
  { type: 'radiologist', name: 'Dr. Michael Rodriguez (Radiologist)' },
  { type: 'cardiologist', name: 'Dr. Sarah Chen (Cardiologist)' },
  { type: 'pulmonologist', name: 'Dr. Emily Johnson (Pulmonologist)' },
]

// Matches Python render_chat_interface() "Start Step-by-Step" button
export async function startConsultation(
  caseId: string,
  userId: string,
  findings?: string[]
) {
  const col = await chatsCol()
  const room = await col.findOne({ _id: caseId as any, user_id: userId })
  if (!room) throw new Error('Chat room not found')

  // Update stage to specialists
  await col.updateOne(
    { _id: caseId as any, user_id: userId },
    { $set: { consultation_stage: 'specialists' } }
  )

  // Get first specialist opinion (Radiologist)
  const specialist = SPECIALISTS[0]
  const response = await getSpecialistResponse(specialist.type, room.description, findings)

  await addMessage(caseId, specialist.name, response, userId, 'ai_response')
  await col.updateOne(
    { _id: caseId as any, user_id: userId },
    { $push: { specialist_opinions: response } }
  )

  return { specialist: specialist.name, response, stage: 'specialists' }
}

// Matches Python "Get Next Specialist Opinion" button
export async function getNextSpecialistOpinion(
  caseId: string,
  userId: string,
  findings?: string[]
) {
  const col = await chatsCol()
  const room = await col.findOne({ _id: caseId as any, user_id: userId })
  if (!room) throw new Error('Chat room not found')

  const opinions = room.specialist_opinions || []
  const nextIndex = opinions.length

  if (nextIndex >= SPECIALISTS.length) {
    throw new Error('All specialists have provided opinions')
  }

  const specialist = SPECIALISTS[nextIndex]
  const response = await getSpecialistResponse(specialist.type, room.description, findings)

  await addMessage(caseId, specialist.name, response, userId, 'ai_response')
  await col.updateOne(
    { _id: caseId as any, user_id: userId },
    { $push: { specialist_opinions: response } }
  )

  return { specialist: specialist.name, response, stage: 'specialists', opinionsCount: nextIndex + 1 }
}

// Matches Python "Get Multidisciplinary Summary" button
export async function generateSummary(
  caseId: string,
  userId: string,
  findings?: string[]
) {
  const col = await chatsCol()
  const room = await col.findOne({ _id: caseId as any, user_id: userId })
  if (!room) throw new Error('Chat room not found')

  const opinions = room.specialist_opinions || []
  const summary = await getMultidisciplinarySummary(room.description, opinions, findings)

  await addMessage(
    caseId,
    'Dr. Lisa Thompson (Chief Medical Officer)',
    `**🏥 MULTIDISCIPLINARY SUMMARY**\n\n${summary}`,
    userId,
    'ai_response'
  )

  await col.updateOne(
    { _id: caseId as any, user_id: userId },
    { $set: { consultation_stage: 'summary' } }
  )

  return { summary, stage: 'summary' }
}

// Matches Python auto_progress_consultation()
export async function autoCompleteConsultation(
  caseId: string,
  userId: string,
  findings?: string[]
) {
  const col = await chatsCol()
  const room = await col.findOne({ _id: caseId as any, user_id: userId })
  if (!room) throw new Error('Chat room not found')

  // Start message
  await addMessage(
    caseId,
    'System',
    '🏥 **Starting Multidisciplinary Consultation**\n\nOur specialist team is now reviewing your case...',
    userId,
    'system'
  )

  const opinions: string[] = []

  for (const specialist of SPECIALISTS) {
    const response = await getSpecialistResponse(specialist.type, room.description, findings)
    await addMessage(
      caseId,
      specialist.name,
      `**${specialist.name.split('(')[1]?.replace(')', '') ?? specialist.name} Opinion:**\n\n${response}`,
      userId,
      'ai_response'
    )
    opinions.push(response)
  }

  await col.updateOne(
    { _id: caseId as any, user_id: userId },
    { $set: { consultation_stage: 'specialists', specialist_opinions: opinions } }
  )

  const summary = await getMultidisciplinarySummary(room.description, opinions, findings)

  await addMessage(
    caseId,
    'Dr. Lisa Thompson (Chief Medical Officer)',
    `**🏥 MULTIDISCIPLINARY SUMMARY**\n\n${summary}`,
    userId,
    'ai_response'
  )

  await addMessage(
    caseId,
    'System',
    '✅ **Consultation Complete**\n\nYour multidisciplinary consultation is now complete. You can ask follow-up questions or discuss the findings with our team.',
    userId,
    'system'
  )

  await col.updateOne(
    { _id: caseId as any, user_id: userId },
    { $set: { consultation_stage: 'summary' } }
  )

  return { opinions, summary }
}

// API route handler - processes consultation based on current stage
export class ConsultationWorkflow {
  async processConsultation(caseId: string, userMessage: string, userId: string) {
    const col = await chatsCol()
    const room = await col.findOne({ _id: caseId as any, user_id: userId })
    if (!room) throw new Error('Chat room not found')

    const stage = room.consultation_stage
    const opinions = room.specialist_opinions || []

    if (stage === 'initial') {
      return startConsultation(caseId, userId)
    } else if (stage === 'specialists') {
      if (opinions.length >= SPECIALISTS.length) {
        return generateSummary(caseId, userId)
      }
      return getNextSpecialistOpinion(caseId, userId)
    }
    return { message: 'Consultation is complete. You can ask follow-up questions.', stage }
  }
}
