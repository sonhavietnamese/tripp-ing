import { Billboard, useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { JSX } from 'react'
import { useRef } from 'react'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    tmpa9nqnpv_ply: THREE.Mesh
  }
  materials: {
    Material_0: THREE.MeshStandardMaterial
  }
}

export function VendingMachine(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/vending-machine-transformed.glb') as unknown as GLTFResult

  const cokeIndicator = useRef<THREE.Mesh>(null!)
  const cokeIndicatorTexture = useTexture('/elements/indicator-coke.png')

  useFrame((state) => {
    cokeIndicator.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
  })

  return (
    <group {...props} dispose={null} scale={2}>
      <mesh castShadow receiveShadow geometry={nodes.tmpa9nqnpv_ply.geometry} material={materials.Material_0} />

      <Billboard position={[0, 3, 0]}>
        <mesh ref={cokeIndicator} position={[0, 0.5, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial map={cokeIndicatorTexture} transparent alphaTest={0.5} />
        </mesh>
      </Billboard>
    </group>
  )
}

useGLTF.preload('/models/vending-machine-transformed.glb')
