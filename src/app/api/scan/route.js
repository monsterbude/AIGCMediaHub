import { NextResponse } from 'next/server'
import { scanDirectory } from '@/lib/scanner'

/**
 * @swagger
 * /api/scan:
 *   post:
 *     description: Trigger a directory scan
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *     responses:
 *       200:
 *         description: Scan completed
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { path } = body
    
    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }
    
    await scanDirectory(path)
    
    return NextResponse.json({ success: true, message: 'Scan completed successfully' })
  } catch (error) {
    console.error('Scan error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
