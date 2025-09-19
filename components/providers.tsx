'use client'

import '@/styles/globals.css'
import { roninWallet } from '@sky-mavis/tanto-wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { saigon } from 'viem/chains'
import { createConfig, http, WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

const config = createConfig({
  chains: [saigon],
  transports: {
    [saigon.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
  connectors: [roninWallet()],
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
