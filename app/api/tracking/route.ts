import { NextRequest, NextResponse } from 'next/server'
import { trackEvent, trackScreen, trackIdentity } from '../../../lib/tracking'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    let result
    switch (type) {
      case 'event':
        result = await trackEvent(data)
        break
      case 'screen':
        result = await trackScreen(data)
        break
      case 'identity':
        result = await trackIdentity(data)
        break
      default:
        return NextResponse.json({ error: 'Invalid tracking type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Tracking API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
