'use client'

import { useTracking, useAutoScreenTracking } from '../hooks/useTracking'
import { useEffect } from 'react'

export default function TrackingExample() {
  const { trackUserEvent, identifyUser } = useTracking()
  
  // Auto-track screen views
  useAutoScreenTracking()

  // Example: Identify user on component mount
  useEffect(() => {
    // This would typically come from your authentication system
    const userId = 'user_12345'
    const roninAddress = '0xe514d9deb7966c8be0ca922de8a064264ea6bcd4'
    
    identifyUser(userId, roninAddress, {
      username: 'testuser',
      email: 'user@example.com',
      subscription_tier: 'premium'
    })
  }, [identifyUser])

  const handleButtonClick = () => {
    trackUserEvent('button_click', {
      button_name: 'example_button',
      section: 'tracking_demo',
      click_timestamp: Date.now()
    })
  }

  const handleGameAction = () => {
    trackUserEvent('game_action', {
      action_type: 'character_summon',
      character_type: 'axie',
      energy_cost: 2,
      success: true
    })
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Tracking Demo</h2>
      <p className="text-sm text-gray-600">
        This component demonstrates the tracking system. Check your browser&apos;s
        network tab to see tracking requests being sent.
      </p>
      
      <div className="space-x-2">
        <button 
          onClick={handleButtonClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Track Button Click
        </button>
        
        <button 
          onClick={handleGameAction}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Track Game Action
        </button>
      </div>
    </div>
  )
}
