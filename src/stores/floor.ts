import { create } from 'zustand'
import * as THREE from 'three'
import { GAME_CONFIG } from '@/config/game'

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

  /* ---------------- Score ---------------- */
  score: number
  setScore: (n: number) => void
  addScore: (d: number) => void

  /* flags to ensure score is granted only once per action type */
  scoredAttack: boolean
  scoredDrink: boolean

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

  /* exclusive emote setter */
  setEmote: (k: 'none' | 'cry' | 'perfection' | 'cool') => void

  /* ---------------- Overall progression ---------------- */
  bossDefeated: boolean

  /* ---------------- Win modal ---------------- */
  showWinModal: boolean
  setShowWinModal: (v: boolean) => void
  winCode: string
  setWinCode: (s: string) => void
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

  /* -------- Central emote setter (mutually exclusive) -------- */
  setEmote: (k) =>
    set({
      showCry: k === 'cry',
      showPerfection: k === 'perfection',
      showCool: k === 'cool',
    }),

  /* ---------------- Score defaults & helpers ---------------- */
  score: 0,
  setScore: (n) => set({ score: Math.max(0, Math.min(3, n)) }),
  addScore: (d) =>
    set((s) => ({ score: Math.max(0, Math.min(3, s.score + d)) })),

  /* one-time score flags */
  scoredAttack: false,
  scoredDrink: false,

  /* ---------------- Progression defaults ---------------- */
  bossDefeated: false,

  /* ---------------- Win modal defaults ---------------- */
  showWinModal: false,
  setShowWinModal: (v) => set({ showWinModal: v }),
  winCode: GAME_CONFIG.promo.winCode,
  setWinCode: (s) => set({ winCode: s }),

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

    // gain score once for attacking
    if (!get().scoredAttack) {
      set({ scoredAttack: true })
      get().addScore(1)
    }

    // Check boss death
    if (get().bossHP <= 0) {
      // full score on kill
      get().setScore(3)
      set({
        bossAnimation: 'die',
        bossDefeated: true,
        isAttacking: false,
        controlLocked: false,
        showGuideCoke: true,
        showWinModal: true,
      })
      // ensure winCode populated (in case it was cleared)
      if (!get().winCode) {
        set({ winCode: GAME_CONFIG.promo.winCode })
      }
      get().setEmote('cool')
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
      showGuideCoke: true,
    })

    // show cry emote (exclusive)
    get().setEmote('cry')
  },

  /* -------- Async buy–drink sequence -------- */
  performBuyCoke: async () => {
    // lock controls & hide button
    set({ controlLocked: true, showBuyCokeButton: false })
    get().setEmote('perfection')

    // drink duration
    await new Promise((r) => setTimeout(r, 3000))

    // apply heal & buff
    set((s) => ({
      trippHP: s.trippMaxHP,
      trippDamage: 10,
    }))

    // gain score for drinking coke
    if (!get().scoredDrink) {
      set({ scoredDrink: true })
      get().addScore(1)
    }

    // finish
    set({ controlLocked: false, showGuideCoke: false })
    get().setEmote('none')
  },
}))
