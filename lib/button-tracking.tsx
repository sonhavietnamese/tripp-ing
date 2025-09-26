// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client'

import posthog from 'posthog-js'

export interface ButtonTrackingProps {
  buttonName: string
  section?: string
  variant?: string
  metadata?: Record<string, unknown>
}

/**
 * Track button click events with PostHog
 * @param props - Button tracking properties
 */
export function trackButtonClick(props: ButtonTrackingProps): void {
  const { buttonName, section, variant, metadata = {} } = props

  try {
    posthog.capture('button_click', {
      button_name: buttonName,
      section: section || 'unknown',
      variant: variant || 'default',
      timestamp: Date.now(),
      url: window.location.href,
      ...metadata,
    })
  } catch (error) {
    console.error('Button tracking failed:', error)
  }
}

/**
 * Create an onClick handler that tracks the button click and then executes the original handler
 * @param buttonName - Name of the button being tracked
 * @param originalHandler - Original onClick handler
 * @param trackingProps - Additional tracking properties
 * @returns Enhanced onClick handler with tracking
 */
export function createTrackedClickHandler(
  buttonName: string,
  originalHandler: () => void,
  trackingProps: Omit<ButtonTrackingProps, 'buttonName'> = {},
) {
  return () => {
    trackButtonClick({
      buttonName,
      ...trackingProps,
    })
    originalHandler()
  }
}

/**
 * Higher-order component to wrap buttons with automatic click tracking
 * @param WrappedButton - Button component to wrap
 * @param trackingProps - Tracking properties
 * @returns Enhanced button component with tracking
 */
export function withButtonTracking<T extends React.ComponentProps<'button'>>(
  WrappedButton: React.ComponentType<T>,
  trackingProps: ButtonTrackingProps,
) {
  return function TrackedButton(props: T) {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      trackButtonClick(trackingProps)

      if (props.onClick) {
        props.onClick(event)
      }
    }

    return <WrappedButton {...props} onClick={handleClick} />
  }
}
