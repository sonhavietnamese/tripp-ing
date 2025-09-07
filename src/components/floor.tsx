import { useFloorStore } from '@/stores/floor'
import { useTexture } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export default function Floor() {
  const ref = useRef<THREE.Mesh>(null!)

  const { setTarget } = useFloorStore()

  const texture = useTexture('/textures/paper.jpg')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 10)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const { x, z } = e.point
    setTarget(new THREE.Vector3(x, 0, z))
  }

  const guideBossTexture = useTexture('/elements/guide-boss.png')
  const guideCokeTexture = useTexture('/elements/guide-coke.png')

  return (
    <>
      <mesh ref={ref} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={handleClick}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      <mesh receiveShadow position={[2, 0.01, -4]} rotation={[THREE.MathUtils.degToRad(-90), 0, THREE.MathUtils.degToRad(60)]} scale={7}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={guideBossTexture} transparent alphaTest={0.5} />
      </mesh>

      <mesh receiveShadow position={[-5, 0.1, -7]} rotation={[THREE.MathUtils.degToRad(-90), 0, THREE.MathUtils.degToRad(20)]} scale={7}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial map={guideCokeTexture} transparent alphaTest={0.5} />
      </mesh>
    </>
  )
}
