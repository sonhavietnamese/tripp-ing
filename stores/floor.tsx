import { create } from 'zustand'
import * as THREE from 'three'
import { GAME_CONFIG } from '@/config/game'
import { getOrCreatePlayerUUID, fetchWinCode } from '@/lib/player-utils'

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

  /* ---------------- Player UUID & Win Code Management ---------------- */
  playerUUID: string
  setPlayerUUID: (uuid: string) => void
  initializePlayer: () => Promise<void>
  /* ---------------- Onboarding modal ---------------- */
  showOnboardingModal: boolean
  setShowOnboardingModal: (v: boolean) => void
  hasOnboarded: boolean
  setHasOnboarded: (v: boolean) => void

  /* ---------------- Mission progression ---------------- */
  /**
   * 0 — Find Grub (hit boss once)
   * 1 — Get a Coke (buy from vending)
   * 2 — Hit Grub (final kill)
   * 3 — Mission complete
   */
  missionStep: number
  setMissionStep: (n: number) => void

  /* ---------------- Shop modal ---------------- */
  showShopModal: boolean
  setShowShopModal: (v: boolean) => void

  /* ---------------- Inventory modal ---------------- */
  showInventoryModal: boolean
  setShowInventoryModal: (v: boolean) => void

  /* ---------------- Power-up modal ---------------- */
  showPowerUpModal: boolean
  setShowPowerUpModal: (v: boolean) => void

  /* ---------------- Inventory items ---------------- */
  inventoryItems: Array<{
    id: string
    name: string
    description: React.ReactNode
    image: string
  }>
  addInventoryItem: (item: { id: string; name: string; description: React.ReactNode; image: string }) => void
  selectedInventoryItemId: string | null
  setSelectedInventoryItemId: (id: string | null) => void

  /* ---------------- Item Animation -------------- */
  showItemAnimation: boolean
  setShowItemAnimation: (v: boolean) => void
  itemAnimationType: 'qr' | 'chestnut' | null
  setItemAnimationType: (type: 'qr' | 'chestnut' | null) => void
  inventoryIconScale: boolean
  setInventoryIconScale: (v: boolean) => void
  itemAnimationTarget: { x: number; y: number } | null
  setItemAnimationTarget: (target: { x: number; y: number } | null) => void
  performQRAnimation: () => Promise<void>
  performChestnutAnimation: () => Promise<void>

  /* ---------------- Camera shake -------------- */
  cameraShakeTrigger: number
  cameraShakeIntensity: number
  cameraShakeDurationMs: number
  /**
   * Increment trigger to notify subscribers and optionally override
   * intensity / duration for this shake.
   */
  kickCameraShake: (intensity?: number, durationMs?: number) => void
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
  addScore: (d) => set((s) => ({ score: Math.max(0, Math.min(3, s.score + d)) })),

  /* one-time score flags */
  scoredAttack: false,
  scoredDrink: false,

  /* ---------------- Progression defaults ---------------- */
  bossDefeated: false,

  /* ---------------- Win modal defaults ---------------- */
  showWinModal: false,
  setShowWinModal: (v) => set({ showWinModal: v }),
  winCode: '',
  setWinCode: (s) => set({ winCode: s }),

  /* ---------------- Player UUID & Win Code Management defaults ---------------- */
  playerUUID: '',
  setPlayerUUID: (uuid) => set({ playerUUID: uuid }),
  initializePlayer: async () => {
    const uuid = getOrCreatePlayerUUID()
    set({ playerUUID: uuid })

    // Fetch win code from API/localStorage
    const winCode = await fetchWinCode()
    if (winCode) {
      set({ winCode })
    }
  },

  /* ---------------- Onboarding modal defaults ---------------- */
  showOnboardingModal: false,
  setShowOnboardingModal: (v) => set({ showOnboardingModal: v }),
  hasOnboarded: false,
  setHasOnboarded: (v) => set({ hasOnboarded: v }),

  /* ---------------- Mission defaults ---------------- */
  missionStep: 0,
  setMissionStep: (n) => set({ missionStep: n }),

  /* ---------------- Shop modal defaults ---------------- */
  showShopModal: false,
  setShowShopModal: (v) => set({ showShopModal: v }),

  /* ---------------- Inventory modal defaults ---------------- */
  showInventoryModal: false,
  setShowInventoryModal: (v) => set({ showInventoryModal: v }),

  /* ---------------- Power-up modal defaults ---------------- */
  showPowerUpModal: false,
  setShowPowerUpModal: (v) => set({ showPowerUpModal: v }),

  /* ---------------- Inventory items defaults ---------------- */
  inventoryItems: [],
  addInventoryItem: (item) =>
    set((s) => {
      // Don't add duplicate items
      const exists = s.inventoryItems.some((existing) => existing.id === item.id)
      if (exists) return s

      const newItems = [...s.inventoryItems, item]
      return {
        inventoryItems: newItems,
        // Auto-select the first item if none selected
        selectedInventoryItemId: s.selectedInventoryItemId || item.id,
      }
    }),
  selectedInventoryItemId: null,
  setSelectedInventoryItemId: (id) => set({ selectedInventoryItemId: id }),

  /* ---------------- Item Animation defaults ---------------- */
  showItemAnimation: false,
  setShowItemAnimation: (v) => set({ showItemAnimation: v }),
  itemAnimationType: null,
  setItemAnimationType: (type) => set({ itemAnimationType: type }),
  inventoryIconScale: false,
  setInventoryIconScale: (v) => set({ inventoryIconScale: v }),
  itemAnimationTarget: null,
  setItemAnimationTarget: (target) => set({ itemAnimationTarget: target }),

  /* ---------------- Camera shake defaults ---------------- */
  cameraShakeTrigger: 0,
  cameraShakeIntensity: GAME_CONFIG.agent?.cameraShake?.intensity ?? 0.12,
  cameraShakeDurationMs: GAME_CONFIG.agent?.cameraShake?.durationMs ?? 180,
  kickCameraShake: (intensity, durationMs) =>
    set((s) => ({
      cameraShakeTrigger: s.cameraShakeTrigger + 1,
      cameraShakeIntensity: intensity ?? s.cameraShakeIntensity,
      cameraShakeDurationMs: durationMs ?? s.cameraShakeDurationMs,
    })),

  /* QR Animation sequence */
  performQRAnimation: async () => {
    const { setShowItemAnimation, setItemAnimationType, setInventoryIconScale, addInventoryItem, setItemAnimationTarget } = get()

    // Calculate inventory icon position
    const inventoryIcon = document.getElementById('player-ui-inventory')
    if (inventoryIcon) {
      const rect = inventoryIcon.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      setItemAnimationTarget({ x: centerX, y: centerY })
    }

    // Start QR animation
    setItemAnimationType('qr')
    setShowItemAnimation(true)

    // After animation completes (1.5s), trigger inventory icon scale and add QR to inventory
    setTimeout(() => {
      setInventoryIconScale(true)
      addInventoryItem({
        id: 'qr-code',
        name: 'QR Code',
        description: 'A mysterious QR code found in battle',
        image: '/elements/qr.png',
      })

      // Reset animation states
      setTimeout(() => {
        setShowItemAnimation(false)
        setItemAnimationType(null)
        setInventoryIconScale(false)
        setItemAnimationTarget(null)
      }, 600) // Scale animation duration
    }, 1500) // Curved animation duration
  },

  /* Chestnut Animation sequence */
  performChestnutAnimation: async () => {
    const { setShowItemAnimation, setItemAnimationType, setInventoryIconScale, addInventoryItem, setItemAnimationTarget } = get()

    // Calculate inventory icon position
    const inventoryIcon = document.getElementById('player-ui-inventory')
    if (inventoryIcon) {
      const rect = inventoryIcon.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      setItemAnimationTarget({ x: centerX, y: centerY })
    }

    // Start chestnut animation
    setItemAnimationType('chestnut')
    setShowItemAnimation(true)

    // After animation completes (1.5s), trigger inventory icon scale and add chestnut to inventory
    setTimeout(() => {
      setInventoryIconScale(true)
      addInventoryItem({
        id: 'chestnut',
        name: 'Chestnut',
        description: 'Yummy!',
        image: '/elements/chestnut.png',
      })

      // Reset animation states
      setTimeout(() => {
        setShowItemAnimation(false)
        setItemAnimationType(null)
        setInventoryIconScale(false)
        setItemAnimationTarget(null)
      }, 600) // Scale animation duration
    }, 1500) // Curved animation duration
  },

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

    // small camera shake on each successful hit
    get().kickCameraShake()

    // progress mission: first successful hit on boss
    if (get().missionStep === 0) {
      set({ missionStep: 1 })
    }

    // gain score once for attacking
    if (!get().scoredAttack) {
      set({ scoredAttack: true })
      get().addScore(1)
    }

    // Check boss death
    if (get().bossHP <= 0) {
      // full score on kill
      get().setScore(3)
      // mission complete
      set({ missionStep: 3 })
      set({
        bossAnimation: 'die',
        bossDefeated: true,
        isAttacking: false,
        controlLocked: false,
        showGuideCoke: true,
      })

      // play cool emote immediately
      get().setEmote('cool')

      // animate chestnut to inventory
      get().performChestnutAnimation()

      // wait 2 s before showing win modal
      await new Promise((r) => setTimeout(r, 3000))

      // ensure winCode populated by fetching from API if needed
      let currentWinCode = get().winCode
      if (!currentWinCode) {
        currentWinCode = (await fetchWinCode()) as string
        if (currentWinCode) {
          set({ winCode: currentWinCode })
        } else {
          // Fallback to default config code if API fails
          currentWinCode = GAME_CONFIG.promo.winCode
          set({ winCode: currentWinCode })
        }
      }
      set({ showWinModal: true })
      return
    }

    /* ---------------- Boss attack ---------------- */
    set({ bossAnimation: 'attack', showBossAttackFX: true })
    await new Promise((r) => setTimeout(r, 2000))

    set((s) => {
      const newTrippHP = Math.max(0, s.trippHP - s.bossDamage)
      return { trippHP: newTrippHP }
    })

    // camera shake on player being hit
    get().kickCameraShake(0.1, 160)

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
    await new Promise((r) => setTimeout(r, 1000))

    // apply heal & buff
    set((s) => ({
      trippHP: s.trippMaxHP,
      trippDamage: 999,
    }))

    // advance mission after buying coke
    if (get().missionStep < 2) {
      set({ missionStep: 2 })
    }

    // gain score for drinking coke
    if (!get().scoredDrink) {
      set({ scoredDrink: true })
      get().addScore(1)
    }

    // add QR code to inventory
    get().addInventoryItem({
      id: 'qr-code',
      name: 'Voucher Unlocked!',
      description: (
        <span className='text-[#F0DCC3]'>
          Here’s your exclusive QR code. Show it to redeem your free <span className='font-bold text-white'>Coca-Cola</span> sample.
          <br />
          <br />
          Redeem Condition:
          <br />- Valid for <span className='font-bold underline'>1 free sample</span>
          <br />- Redeem at merchant store: <span className='font-bold text-white'>Calvin, Table D20.005, 20th Floor</span>
          <br />- Present this QR code at the counter
          <br />({get().winCode})
        </span>
      ),
      image: '/elements/qr.png',
    })

    // show power-up modal
    set({ showPowerUpModal: true })

    // finish (controls will be unlocked when power-up modal is closed)
    set({ controlLocked: false, showGuideCoke: false })
    get().setEmote('none')
  },
}))
