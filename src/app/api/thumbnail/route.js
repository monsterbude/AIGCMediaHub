import fs from 'fs-extra'
import { NextResponse } from 'next/server'
import path from 'path'
import { getSetting } from '@/lib/settings'


export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name')

  if (!name) {
    return new NextResponse('Name is required', { status: 400 })
  }

  const configuredPath = await getSetting('cachePath', '.cache/thumbnails')
  const CACHE_DIR = path.isAbsolute(configuredPath) 
      ? configuredPath 
      : path.join(process.cwd(), configuredPath)

  const filePath = path.join(CACHE_DIR, name)

  try {
    if (!await fs.pathExists(filePath)) {
      return new NextResponse('Thumbnail not found', { status: 404 })
    }

    const fileBuffer = await fs.readFile(filePath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Error serving thumbnail:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
