import type { Space, Building, Booking, Deal, AuditLog, Insight, TourRequest, User } from './types'

/** Short Hills is the only location and default for now. */
export const mockBuildings: Building[] = [
  {
    id: 'bld-short-hills',
    name: 'Short Hills - 1200 Morris Turnpike',
    address: '1200 Morris Turnpike',
    city: 'Short Hills, NJ',
    floors: 1,
    totalSpaces: 86,
    availableSpaces: 86,
    coordinates: { lat: 40.7237, lng: -74.3647 },
    image: '/short-hills-floor-plan.png'
  }
]

export const SHORT_HILLS_BUILDING_ID = 'bld-short-hills'

/** Minimal Space records for Short Hills floor plan regions (CSV office ids). Used for drawer on region click. */
function buildShortHillsSpaces(): Space[] {
  const ids: string[] = ['EWRMOR901']
  for (let i = 1; i <= 85; i++) ids.push(`EWRMOR${String(i).padStart(3, '0')}`)
  const now = new Date().toISOString()
  return ids.map((id) => ({
    id,
    name: id,
    type: 'office' as const,
    status: 'available' as const,
    floor: 1,
    building: SHORT_HILLS_BUILDING_ID,
    capacity: 0,
    sqft: 0,
    price: 0,
    amenities: [],
    position: { x: 0, y: 0, width: 0, height: 0 },
    images: [],
    description: `Office ${id} at Short Hills - 1200 Morris Turnpike.`,
    lastUpdated: now,
  }))
}

export const shortHillsSpaces: Space[] = buildShortHillsSpaces()

/** Matterport 3D tour URL for Short Hills - 1200 Morris Turnpike */
export const SHORT_HILLS_MATTERPORT_URL =
  'https://my.matterport.com/show?play=1&lang=en-US&m=7d6o1jQBAoV&sm=2&sr=-.56,.26,.18&sp=40.78,29.58,54.57'

/** Rich list-view spaces for Short Hills (same shape as Beverly Hills list). Used when building is Short Hills. */
function buildShortHillsListSpaces(): Space[] {
  const base = shortHillsSpaces.slice(0, 20)
  const statuses: Space['status'][] = ['available', 'available', 'occupied', 'available', 'pending', 'available', 'available', 'occupied', 'available', 'available', 'available', 'occupied', 'available', 'available', 'available', 'available', 'pending', 'available', 'available', 'available']
  const capacities = [4, 6, 8, 4, 6, 8, 8, 6, 4, 8, 6, 8, 4, 6, 6, 8, 4, 6, 8, 4]
  const prices = [3200, 4380, 4380, 2800, 3600, 4380, 4380, 3600, 2800, 4380, 3600, 4380, 2800, 3600, 3600, 4380, 2800, 3600, 4380, 2800]
  const names = ['Office 101', 'Office 102', 'Office 103', 'Office 104', 'Office 105', 'Office 106', 'Office 107', 'Office 108', 'Office 109', 'Office 110', 'Office 111', 'Office 112', 'Office 113', 'Office 114', 'Office 115', 'Office 116', 'Office 117', 'Office 118', 'Office 119', 'Office 120']
  const now = new Date().toISOString()
  return base.map((s, i) => ({
    ...s,
    name: names[i],
    status: statuses[i],
    capacity: capacities[i],
    sqft: 195,
    price: prices[i],
    amenities: ['Window View', 'Video Conferencing', 'Standing Desk'].slice(0, (i % 3) + 1),
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Professional private office at Short Hills - 1200 Morris Turnpike.',
    availableFrom: statuses[i] === 'available' ? 'Today' : undefined,
    occupiedBy: statuses[i] === 'occupied' ? (i === 2 ? 'Great Days LLC' : i === 7 ? 'Acme Corp' : 'Tenant LLC') : undefined,
    moveOutDate: statuses[i] === 'occupied' ? 'pending' : undefined,
    renewalDate: statuses[i] === 'occupied' ? '04/30/2025' : undefined,
    onDemandPrice: statuses[i] === 'available' ? { hourly: 100, daily: 500 } : null,
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: now,
    windowType: i % 3 === 0 ? 'window' : 'interior',
    matterportUrl: SHORT_HILLS_MATTERPORT_URL,
  }))
}

export const shortHillsListSpaces: Space[] = buildShortHillsListSpaces()

export const mockSpaces: Space[] = [
  // Floor 2 - Beverly Hills - Top row (above corridor) - kept for type reference; list uses shortHillsListSpaces when building is Short Hills
  {
    id: 'sp-1',
    name: 'Office 102',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Video Conferencing', 'Standing Desk'],
    position: { x: 50, y: 50, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Professional private office with natural light and city views.',
    availableFrom: 'Today',
    onDemandPrice: { hourly: 100, daily: 500 },
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-28T10:30:00Z',
    windowType: 'window',
    hasPromotion: true,
    promotionDetails: '15% off first 3 months',
    matterportUrl: 'https://my.matterport.com/show/?m=fateZME8N81&play=1&ss=92&sr=-.07,.37'
  },
  {
    id: 'sp-2',
    name: 'Office 103',
    type: 'office',
    status: 'occupied',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Whiteboard Wall', 'Video Conferencing'],
    position: { x: 170, y: 50, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Well-appointed office space with premium finishes.',
    occupiedBy: 'Great Days LLC',
    moveOutDate: 'pending',
    renewalDate: '04/30/2025',
    onDemandPrice: null,
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-27T14:20:00Z',
    windowType: 'window',
    matterportUrl: 'https://my.matterport.com/show/?m=fateZME8N81&play=1&ss=92&sr=-.07,.37'
  },
  {
    id: 'sp-3',
    name: 'Office 104',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Ergonomic Furniture', 'Video Conferencing'],
    position: { x: 290, y: 50, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Modern office with flexible workspace configuration.',
    availableFrom: 'Today',
    onDemandPrice: { hourly: 100, daily: 500 },
    lsf: 195,
    productTier: 'Tier 1',
    lastSoldOn: '04/30/2025',
    lastUpdated: '2026-01-29T08:00:00Z',
    windowType: 'interior',
    matterportUrl: 'https://my.matterport.com/show/?m=fateZME8N81&play=1&ss=92&sr=-.07,.37'
  },
  {
    id: 'sp-4',
    name: 'Office 105',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Monitor', 'Locker'],
    position: { x: 410, y: 50, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Corner office with excellent natural lighting.',
    availableFrom: 'Today',
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-28T16:45:00Z'
  },
  {
    id: 'sp-5',
    name: 'Office 106',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Video Conferencing', 'Whiteboard'],
    position: { x: 530, y: 50, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Versatile office space suitable for growing teams.',
    availableFrom: 'Today',
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-29T09:15:00Z'
  },
  {
    id: 'sp-6',
    name: 'Office 107',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Video Conferencing'],
    position: { x: 650, y: 50, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Professional workspace with modern amenities.',
    availableFrom: 'Today',
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-29T11:00:00Z'
  },
  // Floor 2 - Beverly Hills - Bottom row (below corridor)
  {
    id: 'sp-7',
    name: 'Office 108',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Standing Desk'],
    position: { x: 50, y: 310, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Bright office with premium furnishings.',
    availableFrom: 'Today',
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-25T12:00:00Z'
  },
  {
    id: 'sp-8',
    name: 'Office 109',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Video Conferencing', 'Whiteboard Wall'],
    position: { x: 170, y: 310, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Executive office with city views.',
    availableFrom: 'Today',
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-28T09:00:00Z'
  },
  {
    id: 'sp-9',
    name: 'Office 110',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Standing Desks'],
    position: { x: 290, y: 310, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Contemporary office with flexible layout options.',
    availableFrom: 'Today',
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-27T15:30:00Z'
  },
  {
    id: 'sp-10',
    name: 'Office 111',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'AV System'],
    position: { x: 410, y: 310, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Premium office with integrated technology.',
    availableFrom: 'Today',
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-26T10:00:00Z'
  },
  {
    id: 'sp-11',
    name: 'Office 112',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Soundproof'],
    position: { x: 530, y: 310, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Quiet office ideal for focused work.',
    availableFrom: 'Today',
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-29T07:00:00Z'
  },
  {
    id: 'sp-12',
    name: 'Office 113',
    type: 'office',
    status: 'available',
    floor: 2,
    building: 'bld-1',
    capacity: 8,
    sqft: 195,
    price: 4380,
    amenities: ['Window View', 'Power Outlet'],
    position: { x: 650, y: 310, width: 110, height: 100 },
    images: ['/images/office-rep-2-interior.webp'],
    description: 'Well-designed office with ample power access.',
    availableFrom: 'Today',
    lsf: 195,
    productTier: 'Tier 1',
    lastUpdated: '2026-01-29T07:00:00Z'
  },
  ]

export const mockDeals: Deal[] = [
  {
    id: 'deal-1',
    companyName: 'Acme Technologies',
    contactName: 'Sarah Johnson',
    email: 'sarah@acmetech.com',
    phone: '+1 (555) 123-4567',
    spaceIds: ['sp-8'],
    stage: 'negotiation',
    value: 264000,
    probability: 75,
    notes: ['Interested in Q2 move-in', 'Needs custom build-out', 'Budget approved'],
    lastActivity: '2026-01-28T14:30:00Z',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'deal-2',
    companyName: 'Bloom Ventures',
    contactName: 'Michael Chen',
    email: 'mchen@bloomvc.com',
    phone: '+1 (555) 234-5678',
    spaceIds: ['sp-1', 'sp-3'],
    stage: 'proposal',
    value: 111000,
    probability: 50,
    notes: ['Expanding from current location', 'Flexible on start date'],
    lastActivity: '2026-01-27T11:00:00Z',
    createdAt: '2026-01-20T10:30:00Z'
  },
  {
    id: 'deal-3',
    companyName: 'NextGen AI',
    contactName: 'Emily Rodriguez',
    email: 'emily@nextgenai.io',
    phone: '+1 (555) 345-6789',
    spaceIds: ['sp-9'],
    stage: 'qualified',
    value: 66000,
    probability: 30,
    notes: ['Series A funded', 'Growing team rapidly'],
    lastActivity: '2026-01-26T16:00:00Z',
    createdAt: '2026-01-22T14:00:00Z'
  },
  {
    id: 'deal-4',
    companyName: 'Global Finance Corp',
    contactName: 'David Kim',
    email: 'dkim@globalfinance.com',
    phone: '+1 (555) 456-7890',
    spaceIds: ['sp-10'],
    stage: 'lead',
    value: 120000,
    probability: 10,
    notes: ['Annual conference booking inquiry'],
    lastActivity: '2026-01-25T09:00:00Z',
    createdAt: '2026-01-25T09:00:00Z'
  }
]

export const mockBookings: Booking[] = [
  {
    id: 'bk-1',
    spaceId: 'sp-2',
    userId: 'user-101',
    startDate: '2025-12-01',
    endDate: '2026-11-30',
    status: 'confirmed',
    tourScheduled: true,
    tourDate: '2025-11-15',
    notes: 'Annual lease with option to renew',
    createdAt: '2025-11-01T10:00:00Z'
  },
  {
    id: 'bk-2',
    spaceId: 'sp-6',
    userId: 'user-102',
    startDate: '2026-01-29',
    endDate: '2026-01-29',
    status: 'confirmed',
    notes: 'Client meeting 2-4pm',
    createdAt: '2026-01-28T09:00:00Z'
  },
  {
    id: 'bk-3',
    spaceId: 'sp-4',
    userId: 'user-103',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'pending',
    tourScheduled: true,
    tourDate: '2026-01-30',
    notes: 'Trial month before annual commitment',
    createdAt: '2026-01-27T14:00:00Z'
  }
]

export const mockTourRequests: TourRequest[] = [
  {
    id: 'tour-1',
    spaceId: 'sp-1',
    userId: 'user-201',
    preferredDate: '2026-01-30',
    preferredTime: '10:00 AM',
    status: 'confirmed',
    notes: 'Interested in 6-month lease',
    createdAt: '2026-01-28T11:00:00Z'
  },
  {
    id: 'tour-2',
    spaceId: 'sp-8',
    userId: 'user-202',
    preferredDate: '2026-01-31',
    preferredTime: '2:00 PM',
    status: 'pending',
    notes: 'Bringing 3 team members',
    createdAt: '2026-01-29T08:30:00Z'
  }
]

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'status_change',
    entityType: 'space',
    entityId: 'sp-4',
    userId: 'admin-1',
    userName: 'Alex Thompson',
    previousValue: 'available',
    newValue: 'pending',
    timestamp: '2026-01-28T16:45:00Z',
    details: 'Status updated due to incoming booking request'
  },
  {
    id: 'log-2',
    action: 'booking_created',
    entityType: 'booking',
    entityId: 'bk-3',
    userId: 'user-103',
    userName: 'James Wilson',
    timestamp: '2026-01-27T14:00:00Z',
    details: 'New booking created for Focus Pod 2'
  },
  {
    id: 'log-3',
    action: 'deal_updated',
    entityType: 'deal',
    entityId: 'deal-1',
    userId: 'admin-1',
    userName: 'Alex Thompson',
    previousValue: 'proposal',
    newValue: 'negotiation',
    timestamp: '2026-01-28T14:30:00Z',
    details: 'Deal stage advanced after successful presentation'
  },
  {
    id: 'log-4',
    action: 'space_updated',
    entityType: 'space',
    entityId: 'sp-11',
    userId: 'admin-2',
    userName: 'Morgan Lee',
    previousValue: 'available',
    newValue: 'maintenance',
    timestamp: '2026-01-29T07:00:00Z',
    details: 'Phone booth HVAC repair scheduled'
  },
  {
    id: 'log-5',
    action: 'status_change',
    entityType: 'space',
    entityId: 'sp-9',
    userId: 'admin-1',
    userName: 'Alex Thompson',
    previousValue: 'available',
    newValue: 'pending',
    timestamp: '2026-01-27T15:30:00Z',
    details: 'Reserved for NextGen AI evaluation'
  }
]

export const mockInsights: Insight[] = [
  {
    id: 'insight-1',
    type: 'alert',
    title: 'High Demand for Team Offices',
    description: 'Team office inquiries increased 45% this month. Consider prioritizing Enterprise Suite and Team Office B renewals.',
    priority: 'high',
    relatedSpaceIds: ['sp-2', 'sp-8'],
    createdAt: '2026-01-29T06:00:00Z'
  },
  {
    id: 'insight-2',
    type: 'recommendation',
    title: 'Optimize Pricing for Focus Pods',
    description: 'Focus Pods have 95% utilization. A 10% price increase could yield $1,500 additional monthly revenue.',
    priority: 'medium',
    relatedSpaceIds: ['sp-3', 'sp-4'],
    createdAt: '2026-01-28T06:00:00Z'
  },
  {
    id: 'insight-3',
    type: 'trend',
    title: 'Event Space Bookings Trending Up',
    description: 'Q1 event inquiries are 30% higher than last year. Consider expanding event offerings.',
    priority: 'low',
    relatedSpaceIds: ['sp-10'],
    createdAt: '2026-01-27T06:00:00Z'
  },
  {
    id: 'insight-4',
    type: 'alert',
    title: 'Deal Stagnation Warning',
    description: 'Global Finance Corp deal has been in lead stage for 4 days without activity. Recommend follow-up.',
    priority: 'medium',
    relatedSpaceIds: [],
    createdAt: '2026-01-29T08:00:00Z'
  }
]

export const mockCurrentUser: User = {
  id: 'user-1',
  name: 'Alex Thompson',
  email: 'alex@industrious.com',
  role: 'admin',
  avatar: '/placeholder.svg?height=40&width=40',
  company: 'Industrious'
}

export const amenityOptions = [
  'Window View',
  'Private Bathroom',
  'Video Conferencing',
  'Standing Desk',
  'Whiteboard Wall',
  'Kitchenette',
  'Ergonomic Chair',
  'Monitor',
  'Locker',
  'Catering Available',
  'Soundproof',
  'AV System',
  'Stage',
  'Coffee Bar'
]
