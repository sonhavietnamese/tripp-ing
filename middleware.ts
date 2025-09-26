import { NextRequest, NextResponse } from 'next/server'

// Track all requests including static assets
export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  // Get request details
  const method = request.method
  const path = request.nextUrl.pathname
  const userAgent = request.headers.get('user-agent') || ''
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIP || 'unknown'
  
  // Get user ID from session/cookies if available
  const userId = request.cookies.get('user_id')?.value || ''
  
  // Continue with the request
  const response = NextResponse.next()
  
  // Calculate response time
  const duration = Date.now() - startTime
  
  // Add tracking headers to response for client-side pickup
  response.headers.set('X-Track-Method', method)
  response.headers.set('X-Track-Path', path)
  response.headers.set('X-Track-Duration', duration.toString())
  response.headers.set('X-Track-User-Agent', userAgent)
  response.headers.set('X-Track-IP', ip)
  if (userId) {
    response.headers.set('X-Track-User-ID', userId)
  }
  
  // For API routes, send tracking data immediately
  if (path.startsWith('/api/')) {
    try {
      await fetch(`${request.nextUrl.origin}/api/tracking/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method,
          path,
          userAgent,
          ip,
          userId: userId || undefined,
          duration,
          statusCode: response.status || 200,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      // Silent error handling for tracking failures
      console.error('API tracking failed:', error)
    }
  }
  
  return response
}

// Configure middleware to run on all paths including assets
export const config = {
  matcher: [
    /*
     * Match ALL request paths including:
     * - pages and app routes
     * - api routes
     * - static assets (images, CSS, JS)
     * - but exclude Next.js internal files
     */
    '/((?!_next/static|_next/image).*)',
  ],
}
