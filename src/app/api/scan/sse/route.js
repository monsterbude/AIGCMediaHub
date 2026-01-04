import { NextResponse } from 'next/server'
import { scanDirectory } from '@/lib/scanner'

export const dynamic = 'force-dynamic'

/**
 * @swagger
 * /api/scan/sse:
 *   get:
 *     description: Stream scan logs via SSE. Pass ?path=...
 *     responses:
 *       200:
 *         description: Stream
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('path')
  const force = searchParams.get('force') === 'true'

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 })
  }

  const encoder = new TextEncoder()
  const abortController = new AbortController()
  
  // Listen for request disconnect
  request.signal.addEventListener('abort', () => {
    console.log('[SSE] Client disconnected, aborting scan...')
    abortController.abort()
  })

  const customReadable = new ReadableStream({
    async start(controller) {
      const sendEvent = (data) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch (e) {
          // Controller might already be closed
        }
      }

      try {
        sendEvent({ type: 'start', message: `Start scanning: ${path} (force: ${force})` })
        
        await scanDirectory(path, (progress) => {
           sendEvent(progress)
        }, { force, signal: abortController.signal })
        
        if (abortController.signal.aborted) {
          sendEvent({ type: 'aborted', message: 'Scan aborted by user' })
        } else {
          sendEvent({ type: 'done', message: 'Scan completed' })
        }
        controller.close()
      } catch (error) {
        sendEvent({ type: 'error', message: error.message })
        controller.close() // Close on error too
      }
    },
    cancel() {
      // Stream cancelled by consumer
      abortController.abort()
    }
  })

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
