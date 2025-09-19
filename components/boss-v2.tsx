import * as THREE from 'three'
import React, { useEffect, useRef, type JSX } from 'react'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { type GLTF, SkeletonUtils } from 'three-stdlib'

type ActionName = 'attack' | 'die' | 'idle' | 'idle-long'

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName
}

type GLTFResult = GLTF & {
  nodes: {
    texture_pbr_v128: THREE.SkinnedMesh
    spine: THREE.Bone
  }
  materials: {
    ['Material.001']: THREE.MeshStandardMaterial
  }
  animations: GLTFAction[]
}

const animationSet = {
  attack: 'attack',
  die: 'die',
  idle: 'idle-long',
}

type BossV2Props = JSX.IntrinsicElements['group'] & {
  animation: ActionName
}

export default function BossV2(props: BossV2Props) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/models/boss-v2-transformed.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    const action = actions[props.animation] as THREE.AnimationAction & {
      _mixer: THREE.AnimationMixer
    }

    if (props.animation === animationSet.die || props.animation === animationSet.attack) {
      action.reset().fadeIn(0.2).setLoop(THREE.LoopOnce, 1).play()
      action.clampWhenFinished = true
    } else {
      action.reset().fadeIn(0.2).play()
    }

    return () => {
      action.fadeOut(0.2)
    }
  }, [props.animation, actions])

  return (
    <group ref={group} {...props} dispose={null} scale={3}>
      <group name='metarig'>
        <primitive object={nodes.spine} castShadow receiveShadow />
        <skinnedMesh
          name='texture_pbr_v128'
          geometry={nodes.texture_pbr_v128.geometry}
          skeleton={nodes.texture_pbr_v128.skeleton}
          castShadow
          receiveShadow>
          <meshStandardMaterial map={materials['Material.001'].map} roughness={1} />
        </skinnedMesh>
      </group>
    </group>
  )
}

useGLTF.preload('/models/boss-v2-transformed.glb')
