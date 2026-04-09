// Middleware runs in Edge runtime - must NOT import mongodb or any Node.js modules
// Use NextAuth's built-in JWT check instead of the full auth() which touches the DB
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PROTECTED_PATHS = [
  '/dashboard',
  '/upload',
  '/chat',
  '/qa',
  '/reports',
  '/api/upload',
  '/api/analyze',
  '/api/chat',
  '/api/consultation',
  '/api/qa',
  '/api/reports',
  '/api/pubmed',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // getToken only reads the JWT cookie - no DB, no Node.js modules, Edge-safe
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/upload/:path*',
    '/chat/:path*',
    '/qa/:path*',
    '/reports/:path*',
    '/api/upload/:path*',
    '/api/analyze/:path*',
    '/api/chat/:path*',
    '/api/consultation/:path*',
    '/api/qa/:path*',
    '/api/reports/:path*',
    '/api/pubmed/:path*',
  ],
}
