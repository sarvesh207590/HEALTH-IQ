// Typed collection accessors - aligned with Python/Streamlit MongoDB structure
// Collection names and document shapes match db.py exactly
import { ObjectId, Collection } from 'mongodb'
import { getDb } from './mongodb'

// ── Types matching Python document shapes ────────────────────────────────────

export type Role = 'doctor' | 'patient' | 'admin'
export type ConsultationStage = 'initial' | 'specialists' | 'summary' | 'complete'

// Matches Python auth_system.py register_user()
export interface DbUser {
    _id?: ObjectId
    user_id: string          // Python uses uuid string, not ObjectId
    email: string
    password: string         // SHA-256 hex in Python; bcrypt in Next.js new registrations
    full_name: string
    medical_license?: string
    specialization?: string
    created_at: string       // ISO string (Python datetime.now().isoformat())
    last_login?: string
    is_verified?: boolean
    role: Role
}

// Matches Python chat_system.py message shape (embedded in chat room)
export interface EmbeddedMessage {
    id: string               // uuid string
    user: string             // display name
    content: string
    type: 'text' | 'system' | 'annotation' | 'ai_response'
    timestamp: string        // ISO string
}

// Matches Python chat_system.py create_chat_room() - messages embedded
export interface DbChatRoom {
    _id?: string | ObjectId  // Python uses string IDs like "IMAGE-20240115120000"
    user_id: string
    created_at: string
    creator: string
    description: string
    participants: string[]
    consultation_stage: ConsultationStage
    specialist_opinions: string[]
    messages: EmbeddedMessage[]
}

// Matches Python qa_chats collection - messages embedded
export interface EmbeddedQAMessage {
    id: string
    user: string
    content: string
    timestamp: string
}

export interface DbQARoom {
    _id?: string | ObjectId  // Python uses string IDs like "QA-20240115120000"
    user_id: string
    name: string
    creator: string
    created_at: string
    messages: EmbeddedQAMessage[]
}

// Matches Python qa_analyses collection (from utils_simple.py save_analysis / app.py insert_one)
export interface DbAnalysis {
    _id?: ObjectId
    id: string               // Python generates uuid string id
    user_id: string
    filename: string
    analysis: string
    findings: string[]
    keywords: string[]
    date: string             // ISO string "YYYY-MM-DD HH:MM:SS"
    type?: string            // 'image' | 'dicom' | 'nifti'
}

// ── Collection accessors (matching Python db.py collection names) ─────────────

export async function usersCol(): Promise<Collection<DbUser>> {
    return (await getDb()).collection<DbUser>('users')
}

// Python: chats_collection = db["chats"]
export async function chatsCol(): Promise<Collection<DbChatRoom>> {
    return (await getDb()).collection<DbChatRoom>('chats')
}

// Python: qa_chat_collection = db["qa_chats"]
export async function qaChatsCol(): Promise<Collection<DbQARoom>> {
    return (await getDb()).collection<DbQARoom>('qa_chats')
}

// Python: qa_analysis_collection = db["qa_analyses"]
export async function qaAnalysesCol(): Promise<Collection<DbAnalysis>> {
    return (await getDb()).collection<DbAnalysis>('qa_analyses')
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function toObjectId(id: string): ObjectId {
    return new ObjectId(id)
}

/** Serialize a doc for API response - converts _id to string */
export function serializeDoc<T extends { _id?: ObjectId | string }>(doc: T) {
    const { _id, ...rest } = doc as any
    return { _id: _id?.toString?.() ?? _id, ...rest }
}
