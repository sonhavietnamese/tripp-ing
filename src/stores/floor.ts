import { create } from 'zustand'
import * as THREE from 'three'

interface FloorStore {
  target: THREE.Vector3
  setTarget: (target: THREE.Vector3) => void

  /* Current world-space position of the agent/character */
  agentPosition: THREE.Vector3
  setAgentPosition: (pos: THREE.Vector3) => void

  /* When true, clicks on the floor are ignored and player movement is locked */
  controlLocked: boolean
  setControlLocked: (locked: boolean) => void

  /* UI flag to toggle the on-screen attack button */
  showAttackButton: boolean
  setShowAttackButton: (v: boolean) => void

  /* ---------------- Combat ---------------- */
  trippHP: number
  trippMaxHP: number
  trippDamage: number

  bossHP: number
  bossMaxHP: number
  bossDamage: number

  showCry: boolean
  setShowCry: (v: boolean) => void

  showGuideCoke: boolean
  setShowGuideCoke: (v: boolean) => void

  /* ---------------- Vending machine ---------------- */
  showBuyCokeButton: boolean
  setShowBuyCokeButton: (v: boolean) => void

  showPerfection: boolean
  setShowPerfection: (v: boolean) => void

  /* FX / animation flags */
  isAttacking: boolean
  showPlayerAttackFX: boolean
  showBossAttackFX: boolean
  bossAnimation: 'idle-long' | 'attack' | 'die'

  /* full attack coroutine */
  performAttackSequence: () => Promise<void>
  /* buy & drink coroutine */
  performBuyCoke: () => Promise<void>

  /* ---------------- Emotes ---------------- */
  showCool: boolean
  setShowCool: (v: boolean) => void

  /* ---------------- Overall progression ---------------- */
  bossDefeated: boolean
}
export const useFloorStore = create<FloorStore>((set, get) => ({
  target: new THREE.Vector3(0, 0, 0),
  setTarget: (target) => set({ target }),

  agentPosition: new THREE.Vector3(0, 0, 0),
  setAgentPosition: (pos) => set({ agentPosition: pos }),

  controlLocked: false,
  setControlLocked: (locked) => set({ controlLocked: locked }),

  showAttackButton: false,
  setShowAttackButton: (v) => set({ showAttackButton: v }),

  /* ---------------- Combat defaults ---------------- */
  trippMaxHP: 3,
  trippHP: 3,
  trippDamage: 1,

  bossMaxHP: 10,
  bossHP: 10,
  bossDamage: 2,

  showCry: false,
  setShowCry: (v) => set({ showCry: v }),

  showGuideCoke: false,
  setShowGuideCoke: (v) => set({ showGuideCoke: v }),

  /* -------- New combat flags -------- */
  isAttacking: false,
  showPlayerAttackFX: false,
  showBossAttackFX: false,
  bossAnimation: 'idle-long',

  /* -------- Vending machine defaults -------- */
  showBuyCokeButton: false,
  setShowBuyCokeButton: (v) => set({ showBuyCokeButton: v }),

  showPerfection: false,
  setShowPerfection: (v) => set({ showPerfection: v }),

  /* -------- Cool emote -------- */
  showCool: false,
  setShowCool: (v) => set({ showCool: v }),

  /* ---------------- Progression defaults ---------------- */
  bossDefeated: false,

  /* -------- Async attack sequence -------- */
  performAttackSequence: async () => {
    const { isAttacking } = get()
    if (isAttacking) return

    // hide button & lock input
    set({ isAttacking: true, showAttackButton: false, controlLocked: true })

    /* ---------------- Player attack ---------------- */
    set({ showPlayerAttackFX: true })
    await new Promise((r) => setTimeout(r, 500))
    set({ showPlayerAttackFX: false })

    set((s) => {
      const newBossHP = Math.max(0, s.bossHP - s.trippDamage)
      return { bossHP: newBossHP }
    })

    // Check boss death
    if (get().bossHP <= 0) {
      set({
        bossAnimation: 'die',
        bossDefeated: true,
        isAttacking: false,
        controlLocked: false,
        showCry: false,
        showCool: true,
        showGuideCoke: true,
      })
      return
    }

    /* ---------------- Boss attack ---------------- */
    set({ bossAnimation: 'attack', showBossAttackFX: true })
    await new Promise((r) => setTimeout(r, 2000))

    set((s) => {
      const newTrippHP = Math.max(0, s.trippHP - s.bossDamage)
      return { trippHP: newTrippHP }
    })

    set({
      showBossAttackFX: false,
      bossAnimation: 'idle-long',
      isAttacking: false,
      controlLocked: false,
      showCry: true,
      showGuideCoke: true,
    })
  },

  /* -------- Async buy–drink sequence -------- */
  performBuyCoke: async () => {
    // lock controls & hide button
    set({ controlLocked: true, showBuyCokeButton: false, showPerfection: true })

    // drink duration
    await new Promise((r) => setTimeout(r, 3000))

    // apply heal & buff
    set((s) => ({
      trippHP: s.trippMaxHP,
      trippDamage: 10,
    }))

    // finish
    set({
      showPerfection: false,
      controlLocked: false,
      showGuideCoke: false,
    })
  },
}))
