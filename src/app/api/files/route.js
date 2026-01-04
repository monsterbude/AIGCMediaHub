import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const skip = (page - 1) * limit

  try {
    const [files, total] = await prisma.$transaction([
      prisma.fileMetaInfo.findMany({
        skip,
        take: limit,
        orderBy: { modifiedTime: 'desc' },
        where: { isActive: true },
        include: { 
          aigcMetaInfo: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      }),
      prisma.fileMetaInfo.count({ where: { isActive: true } })
    ])

    const filesSerialized = files.map(f => ({
      ...f,
      fileSize: f.fileSize.toString(),
      tags: f.tags.map(ft => ft.tag), // Flatten tag structure
      aigcMetaInfo: f.aigcMetaInfo ? {
        ...f.aigcMetaInfo,
        seed: f.aigcMetaInfo.seed ? f.aigcMetaInfo.seed.toString() : null
      } : null
    }))

    return NextResponse.json({
      data: filesSerialized,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
