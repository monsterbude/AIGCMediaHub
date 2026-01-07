import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { updateTagCount } from '@/lib/tagCountUtils.js'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '500')

    const tags = await prisma.tag.findMany({
      include: {
        tagCount: true,
        _count: { select: { files: true } }
      },
      orderBy: { name: 'asc' },
      skip,
      take
    })

    // 处理标签数据，添加计数信息
    const processedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      type: tag.type,
      color: tag.color,
      count: tag.tagCount?.count || tag._count.files || 0
    }))

    const total = await prisma.tag.count()

    return NextResponse.json({ tags: processedTags, total })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, type, color } = await request.json()
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    const tag = await prisma.tag.upsert({
      where: { name },
      update: { type, color },
      create: { name, type, color }
    })

    // 初始化或更新标签计数
    await updateTagCount(tag.id)

    return NextResponse.json(tag)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
