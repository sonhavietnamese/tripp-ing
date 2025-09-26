'use client'

import { useEffect, useCallback, useRef } from 'react'
import { getOrCreateSessionId, resetSession } from '../lib/tracking'

export function useTracking() {
  const sessionRef = useRef<string | null>(null)
  
  // Initialize session on first load
  useEffect(() => {
    sessionRef.current = getOrCreateSessionId()
  }, [])

  // Track screen view
  const trackScreenView = useCallback(async (screen: string, properties?: Record<string, any>) => {
    const userId = getUserId() // You'll need to implement this based on your auth system
    
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'screen',
          userId,
          screen,
          screenProperties: {
            ...properties,
            url: window.location.href,
            referrer: document.referrer,
            title: document.title,
          }
        })
      })
    } catch (error) {
      console.error('Screen tracking failed:', error)
    }
  }, [])

  // Track user event
  const trackUserEvent = useCallback(async (action: string, properties?: Record<string, any>) => {
    const userId = getUserId()
    
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'event',
          userId,
          action,
          actionProperties: {
            ...properties,
            url: window.location.href,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Event tracking failed:', error)
    }
  }, [])

  // Track user identification
  const identifyUser = useCallback(async (userId: string, roninAddress?: string, userProperties?: Record<string, any>) => {
    // Store user ID in localStorage or session for middleware to access
    if (typeof window !== 'undefined') {
      document.cookie = `user_id=${userId}; path=/; max-age=86400` // 24 hours
    }
    
    try {
      await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'identity',
          userId,
          roninAddress,
          userProperties: {
            ...userProperties,
            identified_at: new Date().toISOString(),
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      })
    } catch (error) {
      console.error('Identity tracking failed:', error)
    }
  }, [])

  // Reset session (for logout)
  const resetUserSession = useCallback(() => {
    resetSession()
    sessionRef.current = null
    // Clear user ID cookie
    if (typeof window !== 'undefined') {
      document.cookie = 'user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    }
  }, [])

  return {
    trackScreenView,
    trackUserEvent,
    identifyUser,
    resetUserSession,
    sessionId: sessionRef.current
  }
}

// Helper function to get user ID from cookie or localStorage
function getUserId(): string | undefined {
  if (typeof window === 'undefined') return undefined
  
  // Try to get from cookie first (set by identifyUser)
  const cookies = document.cookie.split(';')
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'user_id') {
      return value
    }
  }
  
  // Fallback to localStorage
  return localStorage.getItem('user_id') || undefined
}

// Auto-track screen changes with Next.js router
export function useAutoScreenTracking() {
  const { trackScreenView } = useTracking()
  
  useEffect(() => {
    // Track initial page view
    trackScreenView(window.location.pathname)
    
    // Track route changes in Next.js
    const handleRouteChange = (url: string) => {
      trackScreenView(url)
    }
    
    // For Next.js App Router, listen to popstate
    const handlePopState = () => {
      trackScreenView(window.location.pathname)
    }
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [trackScreenView])
}
