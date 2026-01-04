import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request, { params }) {
  const { id } = await params
  const fileId = parseInt(id)

  if (isNaN(fileId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  }

  try {
    const file = await prisma.fileMetaInfo.findUnique({
      where: { id: fileId },
      select: { isFavorite: true }
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const updated = await prisma.fileMetaInfo.update({
      where: { id: fileId },
      data: { isFavorite: !file.isFavorite }
    })

    return NextResponse.json({ success: true, isFavorite: updated.isFavorite })
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
