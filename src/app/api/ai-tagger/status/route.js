import { NextResponse } from 'next/server'
import { getPluginStatus } from '@/lib/tagger'

export async function GET() {
    try {
        const status = await getPluginStatus()
        return NextResponse.json(status)
    } catch (error) {
        return NextResponse.json({ available: false, labelsCount: 0, error: error.message }, { status: 500 })
    }
}
