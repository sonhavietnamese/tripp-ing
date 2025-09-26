export const TRACKING_ENDPOINT = 'https://x.skymavis.com/track'

// Session management
let sessionId: string | null = null
let sessionOffset = 0

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getOrCreateSessionId(): string {
  if (!sessionId) {
    sessionId = generateUUID()
    sessionOffset = 0
  }
  return sessionId
}

export function getNextOffset(): number {
  return sessionOffset++
}

export function resetSession(): void {
  sessionId = null
  sessionOffset = 0
}

function getPlatformInfo() {
  if (typeof window !== 'undefined') {
    return {
      platform_name: navigator.platform || 'Web',
      platform_version: navigator.userAgent || '',
      build_version: '1.0.0',
      internet_type: (navigator as { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
    }
  }
  return {
    platform_name: 'Server',
    platform_version: 'Node.js',
    build_version: '1.0.0',
    internet_type: 'ethernet',
  }
}

export async function sendTrackingData(events: Record<string, unknown>[]) {
  const apiKey = 'OWI2YzgyZDctN2RhZi00ZGI1LWJjYTUtYWU1MzQ5ZTljNzI2Og=='
  if (!apiKey) {
    console.warn('RONIN_TRACKING_API_KEY not found, skipping tracking')
    return
  }

  const credentials = btoa(apiKey + ':')

  try {
    const response = await fetch(TRACKING_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    })

    if (!response.ok) {
      console.error('Tracking request failed:', response.status, response.statusText)
    }

    return response.json()
  } catch (error) {
    console.error('Tracking error:', error)
  }
}

type IdentityPayload = {
  userId: string
  roninAddress?: string
  userProperties?: Record<string, unknown>
}

export async function trackIdentity({ userId, roninAddress, userProperties = {} }: IdentityPayload) {
  const platformInfo = getPlatformInfo()

  const eventData = {
    uuid: generateUUID(),
    ref: 'root',
    timestamp: new Date().toISOString(),
    session_id: getOrCreateSessionId(),
    offset: getNextOffset(),
    user_id: userId,
    ...platformInfo,
    ...(roninAddress && { ronin_address: roninAddress }),
    user_properties: userProperties,
  }

  return sendTrackingData([{ type: 'identify', data: eventData }])
}

type EventPayload = {
  userId?: string
  action: string
  actionProperties?: Record<string, unknown>
}

export async function trackEvent({ userId, action, actionProperties = {} }: EventPayload) {
  const eventData = {
    uuid: generateUUID(),
    ref: 'root',
    timestamp: new Date().toISOString(),
    session_id: getOrCreateSessionId(),
    offset: getNextOffset(),
    ...(userId && { user_id: userId }),
    action,
    action_properties: actionProperties,
  }

  return sendTrackingData([{ type: 'track', data: eventData }])
}

type ScreenPayload = {
  userId?: string
  screen: string
  screenProperties?: Record<string, unknown>
}

export async function trackScreen({ userId, screen, screenProperties = {} }: ScreenPayload) {
  const eventData = {
    uuid: generateUUID(),
    ref: 'root',
    timestamp: new Date().toISOString(),
    session_id: getOrCreateSessionId(),
    offset: getNextOffset(),
    ...(userId && { user_id: userId }),
    screen,
    screen_properties: screenProperties,
  }

  return sendTrackingData([{ type: 'screen', data: eventData }])
}

// Middleware-specific request tracking
export async function trackRequest({
  method,
  path,
  userAgent,
  ip,
  userId,
  duration,
  statusCode,
}: {
  method: string
  path: string
  userAgent?: string
  ip?: string
  userId?: string
  duration?: number
  statusCode?: number
}) {
  return trackEvent({
    userId,
    action: 'page_request',
    actionProperties: {
      method,
      path,
      user_agent: userAgent,
      ip_address: ip,
      duration_ms: duration,
      status_code: statusCode,
      timestamp: new Date().toISOString(),
    },
  })
}
