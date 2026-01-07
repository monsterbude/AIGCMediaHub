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
        tagCount: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Group tags by type and sort each group by count descending, then take top 20 per type
    const groupedTags = tags.reduce((acc, tag) => {
      const type = tag.type || 'other'
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push({
        id: tag.id,
        name: tag.name,
        type: tag.type,
        count: tag.tagCount?.count || 0,
        color: tag.color
      })
      return acc
    }, {})

    // Sort each group by count descending and take top 20
    Object.keys(groupedTags).forEach(type => {
      groupedTags[type].sort((a, b) => b.count - a.count)
      groupedTags[type] = groupedTags[type].slice(0, 20)
    })

    // Flatten the grouped tags back to a single array
    const flattenedTags = Object.values(groupedTags).flat()

    return NextResponse.json({ 
        success: true, 
        data: flattenedTags
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch tags' }, { status: 500 })
  }
}
