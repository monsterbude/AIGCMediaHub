import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany()
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {})
    
    // Default values if not set
    if (!settingsMap.cachePath) {
        settingsMap.cachePath = '.cache/thumbnails'
    }

    return NextResponse.json(settingsMap)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 })

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) }
    })

    return NextResponse.json(setting)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
