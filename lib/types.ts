// Core Types for Spatial Inventory App

export type SpaceStatus = 'available' | 'occupied' | 'pending' | 'maintenance'
export type SpaceType = 'office' | 'suite' | 'desk' | 'meeting-room' | 'event-space' | 'common-area'

export interface Space {
  id: string
  name: string
  type: SpaceType
  status: SpaceStatus
  floor: number
  building: string
  capacity: number
  sqft: number
  price: number
  amenities: string[]
  position: { x: number; y: number; width: number; height: number }
  images: string[]
  description: string
  availableFrom?: string
  lastUpdated: string
  // Extended office fields
  occupiedBy?: string
  moveOutDate?: string
  renewalDate?: string
  onDemandPrice?: { hourly: number; daily: number } | null
  lsf?: number
  productTier?: string
  lastSoldOn?: string
  hasPromotion?: boolean
  promotionDetails?: string
  windowType?: 'window' | 'interior'
  matterportUrl?: string
}

export interface Building {
  id: string
  name: string
  address: string
  city: string
  floors: number
  totalSpaces: number
  availableSpaces: number
  coordinates: { lat: number; lng: number }
  image: string
  floorPlanWidth?: number
  floorPlanHeight?: number
}

export interface Booking {
  id: string
  spaceId: string
  userId: string
  startDate: string
  endDate: string
  status: 'confirmed' | 'pending' | 'cancelled'
  tourScheduled?: boolean
  tourDate?: string
  notes?: string
  createdAt: string
}

export interface TourRequest {
  id: string
  spaceId: string
  userId: string
  preferredDate: string
  preferredTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

export interface Deal {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  spaceIds: string[]
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  value: number
  probability: number
  notes: string[]
  lastActivity: string
  createdAt: string
}

export interface AuditLog {
  id: string
  action: 'status_change' | 'booking_created' | 'booking_cancelled' | 'deal_updated' | 'space_updated'
  entityType: 'space' | 'booking' | 'deal' | 'tour'
  entityId: string
  userId: string
  userName: string
  previousValue?: string
  newValue?: string
  timestamp: string
  details: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  attachments?: { type: 'image' | 'file'; url: string; name: string }[]
}

export interface User {
  id: string
  name: string
  email: string
  role: 'consumer' | 'admin' | 'sales'
  avatar?: string
  company?: string
}

export interface Insight {
  id: string
  type: 'alert' | 'recommendation' | 'trend'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  relatedSpaceIds?: string[]
  createdAt: string
}

export interface FilterState {
  spaceTypes: SpaceType[]
  statuses: SpaceStatus[]
  minCapacity: number
  maxCapacity: number
  minPrice: number
  maxPrice: number
  amenities: string[]
  buildings: string[]
  floors: number[]
}
