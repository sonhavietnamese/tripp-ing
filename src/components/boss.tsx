import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import type { JSX } from 'react'

type GLTFResult = GLTF & {
  nodes: {
    texture_pbr_v128: THREE.Mesh
  }
  materials: {
    ['Material.002']: THREE.MeshStandardMaterial
  }
}

export function Boss(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/boss-transformed.glb') as unknown as GLTFResult
  return (
    <group {...props} dispose={null} scale={8}>
      <mesh castShadow receiveShadow geometry={nodes.texture_pbr_v128.geometry} material={materials['Material.002']} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  )
}

useGLTF.preload('/models/boss-transformed.glb')
