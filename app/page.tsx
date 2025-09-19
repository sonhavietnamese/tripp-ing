'use client'

import Agent from '@/components/agent'
import AttackEffects from '@/components/attack-effects'
import BossV2 from '@/components/boss-v2'
import Floor from '@/components/floor'
import Footsteps from '@/components/footsteps'
import Hud from '@/components/hud/hud'
import { SevenEleven } from '@/components/seven-eleven'
import { GAME_CONFIG } from '@/config/game'
import { useFloorStore } from '@/stores/floor'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

export default function Home() {
  return (
    <main className='w-dvw h-dvh'>
      <Hud />
      <Canvas gl={{ antialias: true }} camera={{ position: [0, 0, 3], fov: 75 }} shadows={true}>
        <Experience />
      </Canvas>
    </main>
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
