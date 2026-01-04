import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.tag.delete({
      where: { id: parseInt(id) }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
