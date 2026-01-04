import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import path from 'path'

export async function GET() {
  try {
    // Get all unique parentPath values
    const paths = await prisma.fileMetaInfo.findMany({
      select: { parentPath: true },
      distinct: ['parentPath']
    })
    
    // We want to find "root" folders that the user scanned.
    // For now, let's just return all unique parentPaths and filter on frontend
    // Or try to infer the short list.
    return NextResponse.json(paths.map(p => p.parentPath))
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const targetPath = searchParams.get('path')

    if (!targetPath) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    // Delete files logic: 
    // Usually user wants to remove all files that start with this path 
    // OR exactly match this parentPath
    const deleted = await prisma.fileMetaInfo.deleteMany({
      where: {
        OR: [
          { parentPath: targetPath },
          { parentPath: { startsWith: targetPath + path.sep } }
        ]
      }
    })

    return NextResponse.json({ success: true, count: deleted.count })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
