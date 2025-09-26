# Mavis App Tracking Integration

This project includes a comprehensive tracking system that integrates with the [Mavis App Tracking API](https://docs.skymavis.com/mavis/app-tracking/overview) to monitor all server requests, user interactions, and screen views.

## Features

- **Server-side request tracking**: Automatically tracks all requests including API calls and asset requests via Next.js middleware
- **Client-side event tracking**: Track user interactions, screen views, and user identification
- **Session management**: Maintains user sessions with proper offset tracking
- **Edge Runtime compatible**: Works with Next.js middleware edge runtime
- **Type-safe**: Full TypeScript support with proper type definitions

## Setup

### 1. Environment Configuration

Create a `.env.local` file with your Ronin tracking API key:

```bash
RONIN_TRACKING_API_KEY=your_ronin_app_tracking_api_key_here
```

To get your API key:
1. Go to the [Ronin Developer Console](https://developers.roninchain.com/console)
2. Navigate to **App Tracking > Settings**
3. Click **Generate API key**

### 2. Files Created

- `middleware.ts` - Next.js middleware for request tracking
- `lib/tracking.ts` - Core tracking functions and API integration
- `hooks/useTracking.ts` - React hooks for client-side tracking
- `app/api/tracking/route.ts` - API route for client-side tracking calls
- `app/api/tracking/request/route.ts` - API route for middleware request tracking
- `components/TrackingExample.tsx` - Example component showing usage

## Usage

### Server-side Request Tracking (Automatic)

The middleware automatically tracks all requests:

```typescript
// Automatically tracks:
// - Method, path, duration, status code
// - User agent, IP address
// - User ID (if available in cookies)
```

### Client-side Tracking

#### Basic Setup

```typescript
import { useTracking, useAutoScreenTracking } from '../hooks/useTracking'

function MyComponent() {
  const { trackUserEvent, identifyUser } = useTracking()
  
  // Auto-track screen changes
  useAutoScreenTracking()
  
  // Identify user
  const handleLogin = async () => {
    await identifyUser('user_123', '0x...', {
      username: 'player1',
      subscription_tier: 'premium'
    })
  }
  
  // Track custom events
  const handleAction = async () => {
    await trackUserEvent('button_click', {
      button_name: 'start_game',
      level: 5
    })
  }
}
```

#### Available Tracking Functions

```typescript
// User identification
identifyUser(userId: string, roninAddress?: string, userProperties?: Record<string, unknown>)

// Event tracking
trackUserEvent(action: string, properties?: Record<string, unknown>)

// Screen tracking
trackScreenView(screen: string, properties?: Record<string, unknown>)

// Session management
resetUserSession() // Call on logout
```

### Direct API Usage

You can also call the tracking API directly:

```typescript
// POST /api/tracking
{
  "type": "event", // or "screen", "identity"
  "userId": "user_123",
  "action": "game_action",
  "actionProperties": {
    "action_type": "character_summon",
    "energy_cost": 2
  }
}
```

## Event Types

### 1. Identity Events
Track when users are identified:
```typescript
{
  type: 'identify',
  userId: 'user_123',
  roninAddress: '0xe514d9deb7966c8be0ca922de8a064264ea6bcd4',
  userProperties: {
    username: 'player1',
    email: 'user@example.com',
    subscription_tier: 'premium'
  }
}
```

### 2. Screen Events
Track page/screen views:
```typescript
{
  type: 'screen',
  userId: 'user_123',
  screen: '/game/battle',
  screenProperties: {
    level: 5,
    game_mode: 'pvp'
  }
}
```

### 3. Track Events
Track user actions:
```typescript
{
  type: 'track',
  userId: 'user_123',
  action: 'purchase_item',
  actionProperties: {
    item_id: 'sword_001',
    price: 50,
    currency: 'RON'
  }
}
```

## Data Flow

1. **Server Requests**: Middleware intercepts → Adds headers → API routes send to tracking API
2. **Client Events**: React hooks → POST to `/api/tracking` → Server sends to Mavis API
3. **Session Management**: UUID generation → Offset tracking → Session persistence

## Middleware Configuration

The middleware is configured to track all requests except Next.js internals:

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image).*)',
  ],
}
```

This includes:
- Page routes (/, /game, etc.)
- API routes (/api/*)
- Static assets (images, CSS, JS)
- All other requests

## Error Handling

- All tracking functions include try-catch blocks
- Failed tracking calls are logged but don't break the application
- Missing API key shows console warnings but doesn't crash

## Example Use Cases

### Game Events
```typescript
// Character summoning
trackUserEvent('character_summon', {
  character_type: 'axie',
  element: 'fire',
  energy_cost: 2,
  success: true
})

// Battle completion
trackUserEvent('battle_complete', {
  battle_type: 'pvp',
  duration_seconds: 180,
  winner: true,
  exp_gained: 50
})
```

### E-commerce Events
```typescript
// Purchase tracking
trackUserEvent('purchase', {
  item_id: 'premium_pass',
  price: 9.99,
  currency: 'USD',
  payment_method: 'ronin_wallet'
})
```

## Viewing Data

Track your app's performance in the [Ronin Developer Console](https://developers.roninchain.com/console) under the App Tracking section.

## Troubleshooting

1. **No tracking data**: Check that `RONIN_TRACKING_API_KEY` is set correctly
2. **Client errors**: Check browser network tab for failed API calls
3. **Build errors**: Ensure all TypeScript types are properly defined
4. **Session issues**: Verify cookies are being set properly for user identification
