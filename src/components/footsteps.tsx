import { useFloorStore } from '@/stores/floor'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

type Footprint = {
  id: number
  position: THREE.Vector3
  rotation: number // heading yaw angle in radians
  createdAt: number
}

let FP_ID = 0

export default function Footsteps() {
  const { agentPosition } = useFloorStore()

  const [footprints, setFootprints] = useState<Footprint[]>([])
  const lastDropPos = useRef<THREE.Vector3 | null>(null)
  const lastPos = useRef<THREE.Vector3 | null>(null)
  const dropLeft = useRef(true)
  const [now, setNow] = useState(0)

  const footprintTexture = useMemo(() => {
    const size = 128
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, size, size)

    // Draw a simple shoe-like oval footprint with slight toe
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    // heel/sole
    ctx.beginPath()
    ctx.ellipse(size * 0.5, size * 0.56, size * 0.16, size * 0.23, 0, 0, Math.PI * 2)
    ctx.fill()
    // toe
    ctx.beginPath()
    ctx.ellipse(size * 0.5, size * 0.34, size * 0.12, size * 0.16, 0, 0, Math.PI * 2)
    ctx.fill()

    const tex = new THREE.CanvasTexture(canvas)
    tex.anisotropy = 8
    tex.needsUpdate = true
    return tex
  }, [])

  const maxFootprints = 40
  const stepLength = 0.6
  const footSeparation = 0.3
  const lifetime = 3.0

  useFrame((state) => {
    setNow(state.clock.elapsedTime)

    const pos = agentPosition
    if (!lastDropPos.current) {
      lastDropPos.current = pos.clone()
      lastPos.current = pos.clone()
      return
    }

    const movedSinceLast = pos.distanceTo(lastDropPos.current)

    if (movedSinceLast >= stepLength) {
      // Direction from last drop to current
      const dir = pos.clone().sub(lastDropPos.current).setY(0)
      if (dir.lengthSq() > 1e-6) {
        dir.normalize()
        const heading = Math.atan2(dir.x, dir.z)
        // perpendicular for left/right offset
        const perp = new THREE.Vector3(-dir.z, 0, dir.x)
        const offset = perp.multiplyScalar((dropLeft.current ? 1 : -1) * footSeparation * 0.5)

        const fpPos = lastDropPos.current.clone().add(dir.multiplyScalar(stepLength)).add(offset)

        const newFp: Footprint = {
          id: FP_ID++,
          position: fpPos,
          rotation: heading,
          createdAt: state.clock.elapsedTime,
        }
        setFootprints((prev) => {
          const next = [...prev, newFp]
          if (next.length > maxFootprints) next.shift()
          return next
        })

        dropLeft.current = !dropLeft.current
        lastDropPos.current = pos.clone()
      }
    }

    // Cleanup expired footprints
    setFootprints((prev) => prev.filter((fp) => state.clock.elapsedTime - fp.createdAt <= lifetime))
  })

  return (
    <group>
      {footprints.map((fp) => {
        const age = Math.max(0, Math.min(1, (now - fp.createdAt) / lifetime))
        const opacity = 1 - age
        return (
          <mesh key={fp.id} position={[fp.position.x, 0.011, fp.position.z]} rotation={[-Math.PI / 2, 0, fp.rotation]}>
            <planeGeometry args={[0.35, 0.5]} />
            <meshBasicMaterial map={footprintTexture} transparent opacity={opacity} depthWrite={false} />
          </mesh>
        )
      })}
    </group>
  )
}
