import { Canvas } from '@react-three/fiber'
import { roninWallet } from '@sky-mavis/tanto-wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { saigon } from 'viem/chains'
import { createConfig, http, WagmiProvider } from 'wagmi'
import Agent from './components/agent'
import Footsteps from './components/footsteps'
import Floor from './components/floor'
import Hud from './components/hud/hud'
import * as THREE from 'three'
import BossV2 from './components/boss-v2'
import { GAME_CONFIG } from '@/config/game'
import { useFloorStore } from '@/stores/floor'
import AttackEffects from './components/attack-effects'
import { SevenEleven } from './components/seven-eleven'

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
  const { bossAnimation } = useFloorStore()

  return (
    <>
      <ambientLight intensity={1} />

      <Floor />

      <Agent />

      <Footsteps />
      <AttackEffects />

      {/* <VendingMachine
        position={GAME_CONFIG.positions.vending.toArray()}
        rotation={[0, THREE.MathUtils.degToRad(GAME_CONFIG.scene.vendingRotationYDeg), 0]}
      /> */}
      <SevenEleven
        position={GAME_CONFIG.positions.sevenEleven.toArray()}
        rotation={[0, THREE.MathUtils.degToRad(GAME_CONFIG.scene.sevenElevenRotationYDeg), 0]}
      />
      <BossV2
        position={GAME_CONFIG.scene.bossModelPosition.toArray()}
        rotation={[0, THREE.MathUtils.degToRad(GAME_CONFIG.scene.bossRotationYDeg), 0]}
        animation={bossAnimation}
      />
    </>
  )
}
