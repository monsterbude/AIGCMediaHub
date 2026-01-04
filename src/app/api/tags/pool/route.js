import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(tags)
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
    return NextResponse.json(tag)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
