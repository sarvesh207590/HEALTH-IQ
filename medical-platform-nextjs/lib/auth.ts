// Authentication - aligned with Python auth_system.py
// Uses "users" collection with Python field names: full_name, user_id, last_login, role
import NextAuth, { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { usersCol } from '@/lib/db/collections'
import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .regex(/[A-Za-z]/, 'Password must contain at least one letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['patient', 'doctor']).default('patient'),
    medical_license: z.string().optional(),
    specialization: z.string().optional(),
})

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
}

// Python uses SHA-256 - support both for existing Python-created users
export function sha256Hash(password: string): string {
    return createHash('sha256').update(password).digest('hex')
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    // Try bcrypt first (Next.js registered users)
    if (storedHash.startsWith('$2')) {
        return bcrypt.compare(password, storedHash)
    }
    // Fall back to SHA-256 (Python registered users)
    return sha256Hash(password) === storedHash
}

export const authOptions: NextAuthConfig = {
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt' },
    pages: { signIn: '/login', signOut: '/login', error: '/login' },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please provide email and password')
                }

                const col = await usersCol()
                const user = await col.findOne({ email: credentials.email as string })
                if (!user || !user.password) throw new Error('User not found')

                const isValid = await verifyPassword(credentials.password as string, user.password)
                if (!isValid) throw new Error('Invalid password')

                // Update last_login (matches Python authenticate_user)
                await col.updateOne(
                    { email: credentials.email as string },
                    { $set: { last_login: new Date().toISOString() } }
                )

                return {
                    id: user.user_id,           // Python uses user_id (uuid string)
                    email: user.email,
                    name: user.full_name,       // Python field: full_name
                    role: user.role,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id || ''
                token.role = (user as any).role
                token.name = user.name || ''
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                    ; (session.user as any).role = token.role as string
                session.user.name = token.name as string
            }
            return session
        },
    },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)
