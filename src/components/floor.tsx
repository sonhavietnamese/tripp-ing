import { useFloorStore } from '@/stores/floor'
import { useTexture } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useRef, useState, useMemo } from 'react'
import * as THREE from 'three'

export default function Floor() {
  const ref = useRef<THREE.Mesh>(null!)

  const { target, setTarget } = useFloorStore()

  const texture = useTexture('/textures/paper.jpg')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(10, 10)

  const [showIndicator, setShowIndicator] = useState(false)

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    const { x, z } = e.point
    setTarget(new THREE.Vector3(x, 0, z))
    setShowIndicator(true)
  }

  const guideBossTexture = useTexture('/elements/guide-boss.png')
  const guideCokeTexture = useTexture('/elements/guide-coke.png')

  const indicatorTexture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, size, size)

    // Red ring
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2)
    ctx.lineWidth = size * 0.12
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.95)'
    ctx.stroke()

    // Inner fade
    const grd = ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size * 0.5)
    grd.addColorStop(0, 'rgba(255,0,0,0.15)')
    grd.addColorStop(1, 'rgba(255,0,0,0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * 0.48, 0, Math.PI * 2)
    ctx.fill()

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    tex.anisotropy = 8
    return tex
  }, [])

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

      {showIndicator && (
        <mesh position={[target.x, 0.02, target.z]} rotation={[THREE.MathUtils.degToRad(-90), 0, 0]}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial map={indicatorTexture} transparent depthWrite={false} />
        </mesh>
      )}
    </>
  )
}
