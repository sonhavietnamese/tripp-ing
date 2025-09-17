import * as THREE from 'three'

export const GAME_CONFIG = {
  positions: {
    boss: new THREE.Vector3(-3, 0, -8),
    bossFixedAttack: new THREE.Vector3(-4, 0, -2),
    vending: new THREE.Vector3(-18, 0, -3),
    vendingFixedStand: new THREE.Vector3(-15, 0, -2),
    sevenEleven: new THREE.Vector3(-20, 0, -3),
  },
  autoEngageRange: {
    boss: 7,
    vending: 9,
    sevenEleven: 9,
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
    bossModelPosition: new THREE.Vector3(-3, 2, -8),
    bossRotationYDeg: 0,
    vendingRotationYDeg: 90,
    sevenElevenRotationYDeg: 0,
  },

  /* ---------------- Promotion / reward ---------------- */
  promo: {
    winCode: 'COKE-POWER-UP',
  },
} as const
