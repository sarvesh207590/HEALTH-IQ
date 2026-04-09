// Reports route - aligned with Python app.py Reports tab
// Reads from "qa_analyses" collection with Python field names
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { qaAnalysesCol } from '@/lib/db/collections'
import { generateReport } from '@/lib/services/report-generator'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const limit = parseInt(searchParams.get('limit') || '10')
        const statsOnly = searchParams.get('stats') === 'true'

        const col = await qaAnalysesCol()

        if (statsOnly) {
            // Return counts for dashboard stats
            const today = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
            const [totalReports, todayAnalyses] = await Promise.all([
                col.countDocuments({ user_id: session.user.id }),
                col.countDocuments({
                    user_id: session.user.id,
                    date: { $regex: `^${today}` }, // Python stores "YYYY-MM-DD HH:MM:SS"
                }),
            ])
            return NextResponse.json({ success: true, data: { totalReports, todayAnalyses } })
        }

        // Matches Python: find({"user_id": user_id}).sort("date", -1).limit(10)
        const docs = await col
            .find({ user_id: session.user.id })
            .sort({ date: -1 })
            .limit(limit)
            .toArray()

        const data = docs.map(d => ({ ...d, _id: d._id?.toString() }))
        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error('Get reports error:', error)
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { analysisId, includeReferences } = body

        if (!analysisId) {
            return NextResponse.json({ error: 'Analysis ID is required' }, { status: 400 })
        }

        const col = await qaAnalysesCol()
        // Python stores id as uuid string field, not _id
        const analysis = await col.findOne({ id: analysisId, user_id: session.user.id })
        if (!analysis) {
            return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
        }

        const pdfBlob = await generateReport(
            {
                id: analysis.id,
                analysis: analysis.analysis,
                findings: analysis.findings,
                keywords: analysis.keywords,
                filename: analysis.filename,
                createdAt: analysis.date,
            },
            includeReferences !== false
        )

        const buffer = Buffer.from(await pdfBlob.arrayBuffer())
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="report-${analysisId}.pdf"`,
            },
        })
    } catch (error) {
        console.error('Generate report error:', error)
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }
}
