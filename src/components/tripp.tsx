import { Billboard, useAnimations, useGLTF, useTexture } from '@react-three/drei'
import { useFrame, useGraph } from '@react-three/fiber'
import { type JSX, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { type GLTF, SkeletonUtils } from 'three-stdlib'

type ActionName = 'IDLE' | 'RUN'

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName
}

type GLTFResult = GLTF & {
  nodes: {
    Tripp: THREE.SkinnedMesh
    Root_Character: THREE.Bone
  }
  materials: {
    Tripp_M: THREE.MeshStandardMaterial
  }
  animations: GLTFAction[]
}

type TrippProps = JSX.IntrinsicElements['group'] & {
  animation: ActionName
}

const animationSet = {
  idle: 'IDLE',
  run: 'RUN',
  jump: 'JUMP',
}

export default function Tripp(props: TrippProps) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/models/tripp-v2-transformed.glb') as unknown as GLTFResult
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult
  const { actions } = useAnimations(animations, group)

  const billboard = useRef<THREE.Group>(null!)
  const playerIndicator = useRef<THREE.Mesh>(null!)
  const playerIndicatorTexture = useTexture('/elements/indicator-player.png')

  useEffect(() => {
    const action = actions[props.animation] as THREE.AnimationAction & {
      _mixer: THREE.AnimationMixer
    }

    if (props.animation === animationSet.jump) {
      action.reset().fadeIn(0.2).setLoop(THREE.LoopOnce, 1).play()
      action.clampWhenFinished = true
    } else {
      action.reset().fadeIn(0.2).play()
    }

    return () => {
      action.fadeOut(0.2)
    }
  }, [props.animation, actions])

  useFrame((state) => {
    playerIndicator.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.1
  })

  return (
    <>
      <group ref={group} {...props} dispose={null}>
        <group name='Scene' position={[0, 0, 0]}>
          <group name='JointBase_Grp' rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
            <primitive object={nodes.Root_Character} />
            <skinnedMesh
              name='Tripp'
              geometry={nodes.Tripp.geometry}
              material={materials.Tripp_M}
              skeleton={nodes.Tripp.skeleton}
              castShadow
              receiveShadow></skinnedMesh>
          </group>
        </group>
      </group>
      <Billboard ref={billboard} position={[0, 2.2, 0]}>
        <mesh ref={playerIndicator} scale={0.55}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial map={playerIndicatorTexture} transparent alphaTest={0.5} />
        </mesh>
      </Billboard>
    </>
  )
}

useGLTF.preload('/models/tripp-v2-transformed.glb')
