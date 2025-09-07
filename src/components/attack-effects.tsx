import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useFloorStore } from '@/stores/floor'

export default function AttackEffects() {
  const { showPlayerAttackFX, showBossAttackFX, agentPosition } = useFloorStore()

  const playerFxRef = useRef<THREE.Mesh>(null!)
  const bossFxRef = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if (playerFxRef.current) playerFxRef.current.rotation.z += delta * 4
    if (bossFxRef.current) bossFxRef.current.rotation.z -= delta * 4
  })

  const BOSS_POS = new THREE.Vector3(5, 2.8, -10)

  return (
    <>
      {showPlayerAttackFX && (
        <Billboard position={[BOSS_POS.x, BOSS_POS.y, BOSS_POS.z]}>
          <mesh ref={playerFxRef}>
            <ringGeometry args={[0.15, 0.45, 32]} />
            <meshBasicMaterial color={'#ffd54f'} transparent opacity={0.9} />
          </mesh>
        </Billboard>
      )}

      {showBossAttackFX && (
        <Billboard position={[agentPosition.x, 2, agentPosition.z]}>
          <mesh ref={bossFxRef}>
            <ringGeometry args={[0.15, 0.45, 32]} />
            <meshBasicMaterial color={'#ef4444'} transparent opacity={0.9} />
          </mesh>
        </Billboard>
      )}
    </>
  )
}
