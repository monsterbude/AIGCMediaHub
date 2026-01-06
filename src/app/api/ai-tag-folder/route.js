import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
    try {
        const { folderPath } = await request.json()

        if (!folderPath) {
            return NextResponse.json({ error: 'Folder path is required' }, { status: 400 })
        }

        // Dynamically import tagger to avoid errors if not available
        const { tagImage, isAITaggerEnabled } = await import('@/lib/tagger')

        // Check if AI tagging is enabled
        const enabled = await isAITaggerEnabled()
        if (!enabled) {
            return NextResponse.json({ error: 'AI tagging is not enabled or plugin not found' }, { status: 400 })
        }

        // Find all image files in this folder
        const files = await prisma.fileMetaInfo.findMany({
            where: {
                parentPath: folderPath,
                fileType: 'image',
                isActive: true
            },
            select: { id: true, fileName: true }
        })

        // Tag all files
        const results = []
        for (const file of files) {
            try {
                const tags = await tagImage(file.id)
                results.push({ fileId: file.id, fileName: file.fileName, tags: tags, success: true })
            } catch (error) {
                results.push({ fileId: file.id, fileName: file.fileName, error: error.message, success: false })
            }
        }

        const successCount = results.filter(r => r.success).length
        const failCount = results.filter(r => !r.success).length

        return NextResponse.json({
            success: true,
            total: files.length,
            successCount,
            failCount,
            results
        })
    } catch (error) {
        console.error('[API] AI tag folder error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
