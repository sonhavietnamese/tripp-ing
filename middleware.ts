import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = url.pathname.startsWith('/relay-1bHN/static/') ? 'us-assets.i.posthog.com' : 'us.i.posthog.com'
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('host', hostname)

  url.protocol = 'https'
  url.hostname = hostname
  url.port = '443'
  url.pathname = url.pathname.replace(/^\/relay-1bHN/, '')

  return NextResponse.rewrite(url, {
    headers: requestHeaders,
  })
}

export const config = {
  matcher: '/relay-1bHN/:path*',
}
