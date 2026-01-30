// Simple client-side state management
import { create } from 'zustand'
import type { Space, FilterState, ChatMessage, SpaceStatus } from './types'
import { mockSpaces, mockAuditLogs } from './mock-data'

interface AppState {
  // Spaces
  spaces: Space[]
  setSpaces: (spaces: Space[]) => void
  updateSpaceStatus: (spaceId: string, status: SpaceStatus) => void
  
  // Selected space
  selectedSpace: Space | null
  setSelectedSpace: (space: Space | null) => void
  
  // Shortlisted spaces
  shortlistedSpaces: string[]
  addToShortlist: (spaceId: string) => void
  removeFromShortlist: (spaceId: string) => void
  clearShortlist: () => void
  
  // Filters
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  
  // View state
  currentFloor: number
  setCurrentFloor: (floor: number) => void
  currentBuilding: string
  setCurrentBuilding: (buildingId: string) => void
  viewMode: '2d' | '3d' | 'list'
  setViewMode: (mode: '2d' | '3d' | 'list') => void
  zoomLevel: number
  setZoomLevel: (level: number) => void
  
  // Chat
  chatMessages: ChatMessage[]
  addChatMessage: (message: ChatMessage) => void
  clearChat: () => void
  isChatOpen: boolean
  setIsChatOpen: (isOpen: boolean) => void
  
  // Drawer states
  isDetailDrawerOpen: boolean
  setIsDetailDrawerOpen: (isOpen: boolean) => void
  isBookingDrawerOpen: boolean
  setIsBookingDrawerOpen: (isOpen: boolean) => void
  
  // Admin
  auditLogs: typeof mockAuditLogs
  addAuditLog: (log: typeof mockAuditLogs[0]) => void
}

const defaultFilters: FilterState = {
  spaceTypes: [],
  statuses: [],
  minCapacity: 0,
  maxCapacity: 100,
  minPrice: 0,
  maxPrice: 50000,
  amenities: [],
  buildings: [],
  floors: []
}

export const useAppStore = create<AppState>((set) => ({
  // Spaces
  spaces: mockSpaces,
  setSpaces: (spaces) => set({ spaces }),
  updateSpaceStatus: (spaceId, status) => set((state) => ({
    spaces: state.spaces.map(s => 
      s.id === spaceId ? { ...s, status, lastUpdated: new Date().toISOString() } : s
    )
  })),
  
  // Selected space
  selectedSpace: null,
  setSelectedSpace: (space) => set({ selectedSpace: space }),
  
  // Shortlisted spaces
  shortlistedSpaces: [],
  addToShortlist: (spaceId) => set((state) => ({
    shortlistedSpaces: state.shortlistedSpaces.includes(spaceId) 
      ? state.shortlistedSpaces 
      : [...state.shortlistedSpaces, spaceId]
  })),
  removeFromShortlist: (spaceId) => set((state) => ({
    shortlistedSpaces: state.shortlistedSpaces.filter(id => id !== spaceId)
  })),
  clearShortlist: () => set({ shortlistedSpaces: [] }),
  
  // Filters
  filters: defaultFilters,
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  resetFilters: () => set({ filters: defaultFilters }),
  
  // View state
  currentFloor: 2,
  setCurrentFloor: (floor) => set({ currentFloor: floor }),
  currentBuilding: 'bld-1',
  setCurrentBuilding: (buildingId) => set({ currentBuilding: buildingId }),
  viewMode: 'list',
  setViewMode: (mode) => set({ viewMode: mode }),
  zoomLevel: 1,
  setZoomLevel: (level) => set({ zoomLevel: level }),
  
  // Chat
  chatMessages: [],
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),
  clearChat: () => set({ chatMessages: [] }),
  isChatOpen: false,
  setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
  
  // Drawer states
  isDetailDrawerOpen: false,
  setIsDetailDrawerOpen: (isOpen) => set({ isDetailDrawerOpen: isOpen }),
  isBookingDrawerOpen: false,
  setIsBookingDrawerOpen: (isOpen) => set({ isBookingDrawerOpen: isOpen }),
  
  // Admin
  auditLogs: mockAuditLogs,
  addAuditLog: (log) => set((state) => ({
    auditLogs: [log, ...state.auditLogs]
  }))
}))
