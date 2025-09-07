import { Canvas } from '@react-three/fiber'
import { roninWallet } from '@sky-mavis/tanto-wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { saigon } from 'viem/chains'
import { createConfig, http, WagmiProvider } from 'wagmi'
import Agent from './components/agent'
import Floor from './components/floor'
import Hud from './components/hud/hud'
import { VendingMachine } from './components/vending-machine'
import * as THREE from 'three'
import { Boss } from './components/boss'

const queryClient = new QueryClient()

const config = createConfig({
  chains: [saigon],
  transports: {
    [saigon.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
  connectors: [roninWallet()],
})

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <main className='w-dvw h-dvh'>
          <Hud />
          <Canvas gl={{ antialias: true }} camera={{ position: [0, 0, 3], fov: 75 }} shadows={true}>
            <Experience />
          </Canvas>
        </main>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function Experience() {
  return (
    <>
      <ambientLight intensity={1} />

      <Floor />

      <Agent />

      <VendingMachine position={[-10, 0, -4]} rotation={[0, THREE.MathUtils.degToRad(90), 0]} />
      <Boss position={[5, 0, -10]} rotation={[0, THREE.MathUtils.degToRad(0), 0]} />
    </>
  )
}
