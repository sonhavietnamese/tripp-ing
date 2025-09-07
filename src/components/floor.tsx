import { useFloorStore } from '@/stores/floor'
import { useTexture } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

export default function Floor() {
  const ref = useRef<THREE.Mesh>(null!)

  // Destructure controlLocked to gate clicks when movement is locked
  // Also pull showGuideCoke flag to conditionally render the vending-machine hint
  const { target, setTarget, agentPosition, controlLocked, showGuideCoke } = useFloorStore()

  const texture = useTexture('/textures/paper.jpg')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 10)

  const [showIndicator, setShowIndicator] = useState(false)
  const [indicatorOpacity, setIndicatorOpacity] = useState(0)
  const opacityRef = useRef(0)
  const indicatorRef = useRef<THREE.Mesh>(null!)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    // Ignore clicks while player control is locked
    if (controlLocked) return

    const { x, z } = e.point
    setTarget(new THREE.Vector3(x, 0, z))
    setShowIndicator(true)
    setIndicatorOpacity(1)
    opacityRef.current = 1
  }

  const guideBossTexture = useTexture('/elements/guide-boss.png')
  const guideCokeTexture = useTexture('/elements/guide-coke.png')

  // Target indicator texture
  const indicatorTexture = useTexture('/textures/indicator-target.png')

  // Fade logic
  useFrame((_, delta) => {
    if (!showIndicator) return

    // Spin animation
    if (showIndicator && indicatorRef.current) {
      indicatorRef.current.rotation.z += delta * 2 // ~2 rad/s
    }

    const dist = agentPosition.distanceTo(target)

    if (dist < 0.15) {
      setIndicatorOpacity((prev) => {
        const next = Math.max(0, prev - delta * 4) // fade ~0.5s
        opacityRef.current = next
        return next
      })
    }

    if (opacityRef.current <= 0.02) {
      setShowIndicator(false)
    }
  })

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

      {showGuideCoke && (
        <mesh
          receiveShadow
          position={[-5, 0.1, -7]}
          rotation={[THREE.MathUtils.degToRad(-90), 0, THREE.MathUtils.degToRad(20)]}
          scale={7}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial map={guideCokeTexture} transparent alphaTest={0.5} />
        </mesh>
      )}

      {showIndicator && (
        <mesh ref={indicatorRef} position={[target.x, 0.02, target.z]} rotation={[THREE.MathUtils.degToRad(-90), 0, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={indicatorTexture} transparent opacity={indicatorOpacity} depthWrite={false} />
        </mesh>
      )}
    </>
  )
}
