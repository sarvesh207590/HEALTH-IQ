// Heatmap generation - matches Python utils_simple.py generate_heatmap()
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { imageData } = body
        if (!imageData) {
            return NextResponse.json({ error: 'No image data provided' }, { status: 400 })
        }

        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
        const imageBuffer = Buffer.from(base64Data, 'base64')

        // Grayscale → red-tinted heatmap (matches Python cv2.COLORMAP_JET approximation)
        const grayscale = await sharp(imageBuffer).grayscale().toBuffer()

        const heatmap = await sharp(grayscale)
            .tint({ r: 220, g: 50, b: 50 })
            .toBuffer()

        const overlay = await sharp(imageBuffer)
            .composite([{ input: heatmap, blend: 'multiply' }])
            .toBuffer()

        return NextResponse.json({
            success: true,
            data: {
                overlay: `data:image/png;base64,${overlay.toString('base64')}`,
                heatmap: `data:image/png;base64,${heatmap.toString('base64')}`,
            },
        })
    } catch (error) {
        console.error('Heatmap error:', error)
        return NextResponse.json({ error: 'Failed to generate heatmap' }, { status: 500 })
    }
}
