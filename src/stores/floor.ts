import { create } from 'zustand'
import * as THREE from 'three'

interface FloorStore {
  target: THREE.Vector3
  setTarget: (target: THREE.Vector3) => void
}

export const useFloorStore = create<FloorStore>((set) => ({
  target: new THREE.Vector3(0, 0, 0),
  setTarget: (target) => set({ target }),
}))
