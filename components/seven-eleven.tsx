import { Billboard, useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, type JSX } from 'react'
import * as THREE from 'three'
import { type GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    Cube001: THREE.Mesh
    Cube001_1: THREE.Mesh
    Cube001_2: THREE.Mesh
  }
  materials: {
    Colors: THREE.MeshStandardMaterial
    Windows: THREE.MeshStandardMaterial
    ColorDark: THREE.MeshStandardMaterial
  }
}

export function SevenEleven(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/seven-eleven-transformed.glb') as unknown as GLTFResult

  const cokeIndicator = useRef<THREE.Mesh>(null!)
  const cokeIndicatorTexture = useTexture('/elements/indicator-coke.png')

  useFrame((state) => {
    cokeIndicator.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
  })

  return (
    <group {...props} dispose={null}>
      <mesh castShadow receiveShadow geometry={nodes.Cube001.geometry} material={materials.Colors} />
      <mesh castShadow receiveShadow geometry={nodes.Cube001_1.geometry} material={materials.Windows} />
      <mesh castShadow receiveShadow geometry={nodes.Cube001_2.geometry} material={materials.ColorDark} />

      <Billboard position={[1, 5, -1]}>
        <mesh ref={cokeIndicator} position={[0, 0.5, 0]} scale={2}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial map={cokeIndicatorTexture} transparent alphaTest={0.5} />
        </mesh>
      </Billboard>
    </group>
  )
}

useGLTF.preload('/models/seven-eleven-transformed.glb')
