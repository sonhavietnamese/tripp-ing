import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/relay-1bHN',
  ui_host: 'https://us.posthog.com',
})
