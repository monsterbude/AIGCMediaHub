import fs from 'fs-extra'
import { NextResponse } from 'next/server'
import path from 'path'
import mime from 'mime-types'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const filePath = searchParams.get('path')

  if (!filePath) {
    return new NextResponse('Path is required', { status: 400 })
  }

  try {
    // Security check: ensure path exists and is a file
    if (!await fs.pathExists(filePath) || !(await fs.stat(filePath)).isFile()) {
      return new NextResponse('File not found', { status: 404 })
    }

    const fileBuffer = await fs.readFile(filePath)
    const mimeType = mime.lookup(filePath) || 'application/octet-stream'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
