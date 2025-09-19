import { GAME_CONFIG } from '@/config/game'
import { useFloorStore } from '@/stores/floor'
import { Billboard, Html, OrthographicCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Tripp from './tripp'

export default function Agent() {
  const cameraRef = useRef<THREE.OrthographicCamera>(null!)
  const characterRef = useRef<THREE.Group>(null!)
  const directionalLight = useRef<THREE.DirectionalLight>(null!)
  const {
    target,
    setAgentPosition,
    setTarget,
    setControlLocked,
    setShowAttackButton,
    showCry,
    setShowBuyCokeButton,
    showPerfection,
    showCool,
    bossDefeated,
    /* camera shake */
    cameraShakeTrigger,
    cameraShakeIntensity,
    cameraShakeDurationMs,
  } = useFloorStore()

  const tempVector = useRef(new THREE.Vector3())
  const currentQuaternion = useRef(new THREE.Quaternion())
  const targetQuaternion = useRef(new THREE.Quaternion())
  const lookAtMatrix = useRef(new THREE.Matrix4())
  const billboardRef = useRef<THREE.Group>(null!)

  /* ------------------------------------------------------------------ */
  /* Camera shake refs                                                  */
  /* ------------------------------------------------------------------ */
  const shakeTimeLeft = useRef(0)
  const shakeDuration = useRef(0)
  const shakeIntensity = useRef(0)

  /* react to shake trigger increments */
  useEffect(() => {
    // whenever trigger changes, start a new shake using current intensity/duration values from store
    shakeDuration.current = cameraShakeDurationMs / 1000
    shakeTimeLeft.current = shakeDuration.current
    shakeIntensity.current = cameraShakeIntensity
  }, [cameraShakeTrigger, cameraShakeDurationMs, cameraShakeIntensity])

  /* ------------------------------------------------------------------ */
  /* Engagement state                                                   */
  /* ------------------------------------------------------------------ */
  // engagement state for boss
  const engagedThisProximity = useRef(false)
  const autoEngageActive = useRef(false)
  // engagement state for vending machine
  const engagedThisProximityVM = useRef(false)
  const autoEngageActiveVM = useRef(false)

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
    /* Detect boss proximity – decide when to trigger one-time engage */
    /* -------------------------------------------------------------- */
    if (!bossDefeated) {
      const distToBoss = pos.distanceTo(GAME_CONFIG.positions.boss)
      if (!engagedThisProximity.current && distToBoss < GAME_CONFIG.autoEngageRange.boss) {
        autoEngageActive.current = true
      }
      if (distToBoss > GAME_CONFIG.autoEngageRange.boss + 0.5) {
        engagedThisProximity.current = false
      }
    }

    /* -------------------------------------------------------------- */
    /* Detect vending machine proximity for auto-engage               */
    /* -------------------------------------------------------------- */
    if (!bossDefeated) {
      const distToVM = pos.distanceTo(GAME_CONFIG.positions.vending)
      if (!engagedThisProximityVM.current && distToVM < GAME_CONFIG.autoEngageRange.vending) {
        autoEngageActiveVM.current = true
      }
      if (distToVM > GAME_CONFIG.autoEngageRange.vending + 0.5) {
        engagedThisProximityVM.current = false
      }
    } else {
      // boss is dead, disable any VM auto-engage state
      autoEngageActiveVM.current = false
      engagedThisProximityVM.current = false
    }

    /* -------------------------------------------------------------- */
    /* Determine effective target                                     */
    /* -------------------------------------------------------------- */
    let computedTarget = target
    if (autoEngageActive.current && !bossDefeated) {
      // Boss engagement takes priority
      computedTarget = GAME_CONFIG.positions.bossFixedAttack
      // keep store target updated so the floor indicator can fade properly
      setTarget(computedTarget.clone())
    } else if (autoEngageActiveVM.current && !bossDefeated) {
      // Vending machine engagement is secondary
      computedTarget = GAME_CONFIG.positions.vendingFixedStand
      // keep store target updated
      setTarget(computedTarget.clone())
    }

    // Camera and light should always follow the player, regardless of target
    let desiredCameraPosition = characterRef.current.position.clone().add(GAME_CONFIG.agent.cameraOffset)
    let desiredLightPosition = characterRef.current.position.clone().add(GAME_CONFIG.agent.lightOffset)

    /* -------------------------------------------------------------- */
    /* Apply camera shake jitter                                       */
    /* -------------------------------------------------------------- */
    if (shakeTimeLeft.current > 0) {
      const t = shakeTimeLeft.current / shakeDuration.current // 1 -> 0
      const amp = shakeIntensity.current * t
      const jitter = new THREE.Vector3(
        (Math.random() - 0.5) * 2 * amp,
        (Math.random() - 0.5) * 2 * amp,
        (Math.random() - 0.5) * 2 * amp * 0.6,
      )
      desiredCameraPosition = desiredCameraPosition.clone().add(jitter)
      desiredLightPosition = desiredLightPosition.clone().add(jitter)

      shakeTimeLeft.current = Math.max(0, shakeTimeLeft.current - delta)
    }

    cameraRef.current.position.lerp(desiredCameraPosition, 0.8)
    directionalLight.current.position.lerp(desiredLightPosition, 0.8)

    // Update the light's target to follow the player (important for shadows)
    directionalLight.current.target.position.copy(characterRef.current.position)
    directionalLight.current.target.updateMatrixWorld()

    const lookAtDistance = cameraRef.current.position.distanceTo(characterRef.current.position)
    if (lookAtDistance > GAME_CONFIG.agent.cameraDeadzone) {
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
      const moveDistance = GAME_CONFIG.agent.movementSpeed * delta

      if (moveDistance < distance) {
        characterRef.current.position.add(direction.multiplyScalar(moveDistance))
      } else {
        characterRef.current.position.copy(computedTarget)
      }
    }

    // Publish current character position to the store
    setAgentPosition(characterRef.current.position.clone())

    const distanceToTarget = characterRef.current.position.distanceTo(computedTarget)
    // Distance specifically to the fixed attack position
    const distanceToFixed = characterRef.current.position.distanceTo(GAME_CONFIG.positions.bossFixedAttack)
    // Distance specifically to the fixed vending position
    const distanceToFixedVM = characterRef.current.position.distanceTo(GAME_CONFIG.positions.vendingFixedStand)

    /* -------------------------------------------------------------- */
    /* Handle arrival at fixed attack position                        */
    /* -------------------------------------------------------------- */
    if (distanceToFixed < 0.12) {
      const faceDir = GAME_CONFIG.positions.boss.clone().sub(pos).setY(0)
      if (faceDir.lengthSq() > 1e-6) {
        faceDir.normalize()
        lookAtMatrix.current.lookAt(new THREE.Vector3(0, 0, 0), faceDir.clone().negate(), new THREE.Vector3(0, 1, 0))
        targetQuaternion.current.setFromRotationMatrix(lookAtMatrix.current)
        currentQuaternion.current.slerp(targetQuaternion.current, 0.3)
        characterRef.current.quaternion.copy(currentQuaternion.current)
      }
      // First-time arrival actions
      if (!bossDefeated && !engagedThisProximity.current) {
        setShowAttackButton(true)
        setControlLocked(true)
        engagedThisProximity.current = true
      }
      // Ensure auto engage stops forcing target after arrival
      autoEngageActive.current = false
    }

    /* -------------------------------------------------------------- */
    /* Handle arrival at fixed vending position                       */
    /* -------------------------------------------------------------- */
    if (distanceToFixedVM < 0.12) {
      const faceDir = GAME_CONFIG.positions.vending.clone().sub(pos).setY(0)
      if (faceDir.lengthSq() > 1e-6) {
        faceDir.normalize()
        lookAtMatrix.current.lookAt(new THREE.Vector3(0, 0, 0), faceDir.clone().negate(), new THREE.Vector3(0, 1, 0))
        targetQuaternion.current.setFromRotationMatrix(lookAtMatrix.current)
        currentQuaternion.current.slerp(targetQuaternion.current, 0.3)
        characterRef.current.quaternion.copy(currentQuaternion.current)
      }
      // First-time arrival actions
      if (!engagedThisProximityVM.current) {
        setShowBuyCokeButton(true)
        setControlLocked(true)
        engagedThisProximityVM.current = true
      }
      // Ensure auto engage stops forcing target after arrival
      autoEngageActiveVM.current = false
    }

    if (distanceToTarget < 0.1) {
      setStatus('idle')
    } else {
      setStatus('walking')
    }

    billboardRef.current.position.copy(characterRef.current.position)
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
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
      />
      <group ref={characterRef}>
        <Tripp animation={status === 'idle' ? 'IDLE' : 'RUN'} />)
      </group>
      <Billboard ref={billboardRef}>
        {showCry && (
          <Html zIndexRange={[0, 100]} position={[0, GAME_CONFIG.agent.emoteHeight, 0]} center transform style={{ pointerEvents: 'none' }}>
            <img src='/emotes/cry.webp' alt='cry' style={{ width: 64, height: 64 }} />
          </Html>
        )}

        {showPerfection && (
          <Html zIndexRange={[0, 100]} position={[0, GAME_CONFIG.agent.emoteHeight, 0]} center transform style={{ pointerEvents: 'none' }}>
            <img src='/emotes/perfection.webp' alt='perfection' style={{ width: 64, height: 64 }} />
          </Html>
        )}

        {showCool && (
          <Html zIndexRange={[0, 100]} position={[0, GAME_CONFIG.agent.emoteHeight, 0]} center transform style={{ pointerEvents: 'none' }}>
            <img src='/emotes/cool.webp' alt='cool' style={{ width: 64, height: 64 }} />
          </Html>
        )}
      </Billboard>
    </>
  )
}
