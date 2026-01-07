import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany()
    const settingsMap = settings.reduce((acc, s) => {
      // Convert snake_case to camelCase for frontend compatibility
      const camelKey = s.key.replace(/(_[a-z])/g, group => group.toUpperCase().replace('_', ''))
      acc[camelKey] = s.value
      return acc
    }, {})
    
    // Default values if not set
    if (!settingsMap.cachePath) {
        settingsMap.cachePath = '.cache/thumbnails'
    }
    if (!settingsMap.scanConcurrency) {
        settingsMap.scanConcurrency = '4'
    }
    if (!settingsMap.aiTaggerEnabled) {
        settingsMap.aiTaggerEnabled = 'false'
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

    // Convert camelCase to snake_case for database storage
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()

    const setting = await prisma.systemSetting.upsert({
      where: { key: snakeKey },
      update: { value: String(value) },
      create: { key: snakeKey, value: String(value) }
    })

    return NextResponse.json(setting)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
