import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const folders = await prisma.fileMetaInfo.findMany({
            where: { isActive: true },
            select: { parentPath: true },
            distinct: ['parentPath']
        })

        const paths = folders.map(f => f.parentPath)
        return NextResponse.json({ data: paths })
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
