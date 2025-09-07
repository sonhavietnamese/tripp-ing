import { create } from 'zustand'
import * as THREE from 'three'

interface FloorStore {
  target: THREE.Vector3
  setTarget: (target: THREE.Vector3) => void

  /* Current world-space position of the agent/character */
  agentPosition: THREE.Vector3
  setAgentPosition: (pos: THREE.Vector3) => void
}

export const useFloorStore = create<FloorStore>((set) => ({
  target: new THREE.Vector3(0, 0, 0),
  setTarget: (target) => set({ target }),

  agentPosition: new THREE.Vector3(0, 0, 0),
  setAgentPosition: (pos) => set({ agentPosition: pos }),
}))
