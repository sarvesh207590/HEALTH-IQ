// Dashboard stats - matches Python dashboard.py stats functions
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { qaAnalysesCol, chatsCol } from '@/lib/db/collections'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = session.user.id
        const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

        const analysesCol = await qaAnalysesCol()
        const chats = await chatsCol()

        // Matches Python get_today_analysis_count()
        // Python stores date as "YYYY-MM-DD HH:MM:SS" so prefix match works
        const allUserAnalyses = await analysesCol
            .find({ user_id: userId })
            .project({ date: 1 })
            .toArray()

        const todayAnalyses = allUserAnalyses.filter(a =>
            String(a.date || '').startsWith(today)
        ).length

        const totalReports = allUserAnalyses.length

        // Matches Python get_active_discussions_count()
        const activeDiscussions = await chats.countDocuments({ user_id: userId })

        return NextResponse.json({
            success: true,
            data: { todayAnalyses, totalReports, activeDiscussions },
        })
    } catch (error) {
        console.error('Stats error:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
