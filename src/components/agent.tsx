import { useFloorStore } from '@/stores/floor'
import { OrthographicCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Tripp from './tripp'

export default function Agent() {
  const cameraRef = useRef<THREE.OrthographicCamera>(null!)
  const characterRef = useRef<THREE.Group>(null!)
  const directionalLight = useRef<THREE.DirectionalLight>(null!)
  const { target, setAgentPosition } = useFloorStore()

  const tempVector = useRef(new THREE.Vector3())
  const currentQuaternion = useRef(new THREE.Quaternion())
  const targetQuaternion = useRef(new THREE.Quaternion())
  const lookAtMatrix = useRef(new THREE.Matrix4())
  const movementSpeed = 7

  const cameraOffset = new THREE.Vector3(10, 15, 10)
  const lightOffset = new THREE.Vector3(5, 20, 5) // Different offset for the light
  const cameraDeadzone = 0.5

  /* ------------------------------------------------------------------ */
  /* Combat engagement / auto-move constants                            */
  /* ------------------------------------------------------------------ */
  const BOSS_POSITION = useRef(new THREE.Vector3(5, 0, -10)) // must match Boss placement
  const AUTO_ENGAGE_RANGE = 5
  const ATTACK_STANDOFF = 1.5
  const autoEngage = useRef(false)

  const [status, setStatus] = useState<'idle' | 'walking'>('idle')

  // init position
  useEffect(() => {
    characterRef.current.position.set(5, 0, 5)
  }, [])

  useFrame((_, delta) => {
    if (!cameraRef.current) return
    if (!characterRef.current) return
    if (!directionalLight.current) return

    const pos = characterRef.current.position

    /* -------------------------------------------------------------- */
    /* Detect boss proximity – toggle autoEngage                      */
    /* -------------------------------------------------------------- */
    const distToBoss = pos.distanceTo(BOSS_POSITION.current)
    if (distToBoss < AUTO_ENGAGE_RANGE) autoEngage.current = true
    else if (distToBoss > AUTO_ENGAGE_RANGE + 0.5) autoEngage.current = false

    /* -------------------------------------------------------------- */
    /* Determine effective target                                     */
    /* -------------------------------------------------------------- */
    let computedTarget = target
    if (autoEngage.current) {
      // vector from boss to player – we want player to stand ATTACK_STANDOFF away
      const dir = pos.clone().sub(BOSS_POSITION.current).setY(0)
      if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1) // fallback if overlapping
      dir.normalize()
      computedTarget = BOSS_POSITION.current.clone().add(dir.multiplyScalar(ATTACK_STANDOFF))
    }

    // Camera and light should always follow the player, regardless of target
    const desiredCameraPosition = characterRef.current.position.clone().add(cameraOffset)
    const desiredLightPosition = characterRef.current.position.clone().add(lightOffset)

    cameraRef.current.position.lerp(desiredCameraPosition, 0.8)
    directionalLight.current.position.lerp(desiredLightPosition, 0.8)

    // Update the light's target to follow the player (important for shadows)
    directionalLight.current.target.position.copy(characterRef.current.position)
    directionalLight.current.target.updateMatrixWorld()

    const lookAtDistance = cameraRef.current.position.distanceTo(characterRef.current.position)
    if (lookAtDistance > cameraDeadzone) {
      cameraRef.current.lookAt(characterRef.current.position)
      directionalLight.current.lookAt(characterRef.current.position)
    }

    // Only handle movement if there's a target
    if (!computedTarget) return

    if (computedTarget) {
      tempVector.current.set(
        computedTarget.x - characterRef.current.position.x,
        computedTarget.y - characterRef.current.position.y,
        computedTarget.z - characterRef.current.position.z,
      )

      if (tempVector.current.length() > 0.01) {
        tempVector.current.normalize()
        lookAtMatrix.current.lookAt(new THREE.Vector3(0, 0, 0), tempVector.current.clone().negate(), new THREE.Vector3(0, 1, 0))
        targetQuaternion.current.setFromRotationMatrix(lookAtMatrix.current)

        // Smoothly rotate towards desired heading
        currentQuaternion.current.slerp(targetQuaternion.current, 0.3)
        characterRef.current.quaternion.copy(currentQuaternion.current)
      }
    }

    const direction = new THREE.Vector3()
    direction.subVectors(computedTarget, characterRef.current.position)
    const distance = direction.length()

    if (distance > 0.01) {
      direction.normalize()
      const moveDistance = movementSpeed * delta

      if (moveDistance < distance) {
        characterRef.current.position.add(direction.multiplyScalar(moveDistance))
      } else {
        characterRef.current.position.copy(computedTarget)
      }
    }

    // Publish current character position to the store
    setAgentPosition(characterRef.current.position.clone())

    const distanceToTarget = characterRef.current.position.distanceTo(computedTarget)

    // If in autoEngage and arrived at fixed point, face boss directly
    if (autoEngage.current && distanceToTarget < 0.1) {
      const faceDir = BOSS_POSITION.current.clone().sub(pos).setY(0)
      if (faceDir.lengthSq() > 1e-6) {
        faceDir.normalize()
        lookAtMatrix.current.lookAt(new THREE.Vector3(0, 0, 0), faceDir.clone().negate(), new THREE.Vector3(0, 1, 0))
        targetQuaternion.current.setFromRotationMatrix(lookAtMatrix.current)
        currentQuaternion.current.slerp(targetQuaternion.current, 0.3)
        characterRef.current.quaternion.copy(currentQuaternion.current)
      }
    }
    if (distanceToTarget < 0.1) {
      setStatus('idle')
    } else {
      setStatus('walking')
    }
  })

  return (
    <>
      <OrthographicCamera ref={cameraRef} makeDefault position={[10, 15, 5]} zoom={40} />

      <directionalLight
        ref={directionalLight}
        intensity={3}
        castShadow={true}
        shadow-enabled={false}
        shadow-normalBias={0.06}
        // shadow-bias={0.1}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
      />
      <group ref={characterRef}>
        <Tripp animation={status === 'idle' ? 'IDLE' : 'RUN'} />
      </group>
    </>
  )
}
