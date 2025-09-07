import * as THREE from 'three'

export const GAME_CONFIG = {
  positions: {
    boss: new THREE.Vector3(5, 0, -10),
    bossFixedAttack: new THREE.Vector3(5, 0, -6.5),
    vending: new THREE.Vector3(-10, 0, -4),
    vendingFixedStand: new THREE.Vector3(-8.5, 0, -4),
  },
  autoEngageRange: {
    boss: 8,
    vending: 8,
  },
  agent: {
    movementSpeed: 7,
    cameraOffset: new THREE.Vector3(10, 15, 10),
    lightOffset: new THREE.Vector3(5, 20, 5),
    cameraDeadzone: 0.5,
    emoteHeight: 2.4,
  },
  bossEffects: {
    hitBillboardY: 2.8,
  },
  scene: {
    bossModelPosition: new THREE.Vector3(5, 2, -10),
    bossRotationYDeg: 0,
    vendingRotationYDeg: 90,
  },
} as const
