// Player UUID and win code utilities

const PLAYER_UUID_KEY = 'axie-player-uuid'
const PLAYER_WINCODE_KEY = 'axie-player-wincode'

/**
 * Generates a simple UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Gets or creates a player UUID, storing it in localStorage
 */
export function getOrCreatePlayerUUID(): string {
  if (typeof window === 'undefined') return ''
  
  let uuid = localStorage.getItem(PLAYER_UUID_KEY)
  if (!uuid) {
    uuid = generateUUID()
    localStorage.setItem(PLAYER_UUID_KEY, uuid)
  }
  return uuid
}

/**
 * Gets win code from localStorage
 */
export function getStoredWinCode(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PLAYER_WINCODE_KEY)
}

/**
 * Stores win code in localStorage
 */
export function storeWinCode(winCode: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PLAYER_WINCODE_KEY, winCode)
}

/**
 * Fetches win code from API using player UUID
 */
export async function fetchWinCode(): Promise<string | null> {
  try {
    const uuid = getOrCreatePlayerUUID()
    if (!uuid) return null

    // First check if we already have a stored win code
    const storedCode = getStoredWinCode()
    if (storedCode) return storedCode

    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uuid }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch win code')
    }

    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }

    // Store the win code in localStorage
    if (data.code) {
      storeWinCode(data.code)
      return data.code
    }

    return null
  } catch (error) {
    console.error('Error fetching win code:', error)
    return null
  }
}
