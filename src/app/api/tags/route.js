import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/tags:
 *   get:
 *     description: Get all tags used in the system, grouped by type.
 *     responses:
 *       200:
 *         description: Success
 */
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { files: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ 
        success: true, 
        data: tags.map(t => ({
            id: t.id,
            name: t.name,
            type: t.type,
            count: t._count.files
        }))
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch tags' }, { status: 500 })
  }
}
