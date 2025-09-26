import { NextRequest, NextResponse } from 'next/server'
import { trackEvent } from '../../../../lib/tracking'

// API route specifically for tracking requests from middleware
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { method, path, userAgent, ip, userId, duration, statusCode, timestamp } = body

    await trackEvent({
      userId: userId || undefined,
      action: 'page_request',
      actionProperties: {
        method,
        path,
        user_agent: userAgent,
        ip_address: ip,
        duration_ms: duration,
        status_code: statusCode,
        timestamp,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Request tracking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
