'use client'

import React from "react"

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import type { Space } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  X,
  Pin,
  Calendar,
  Users,
  Maximize2,
  DollarSign,
  MapPin,
  Clock,
  ChevronRight,
  Wifi,
  Monitor,
  Coffee,
  Armchair,
  Video,
  PenTool,
  CheckCircle2,
  ImageIcon
} from 'lucide-react'

const statusConfig = {
  available: { label: 'Available', color: 'bg-space-available text-white' },
  occupied: { label: 'Occupied', color: 'bg-space-occupied text-white' },
  pending: { label: 'Pending', color: 'bg-space-pending text-foreground' },
  maintenance: { label: 'Maintenance', color: 'bg-space-maintenance text-white' }
}

const amenityIcons: Record<string, React.ReactNode> = {
  'Window View': <Maximize2 className="h-4 w-4" />,
  'Video Conferencing': <Video className="h-4 w-4" />,
  'Whiteboard Wall': <PenTool className="h-4 w-4" />,
  'Whiteboard': <PenTool className="h-4 w-4" />,
  'Monitor': <Monitor className="h-4 w-4" />,
  'Coffee Bar': <Coffee className="h-4 w-4" />,
  'Soft Seating': <Armchair className="h-4 w-4" />,
  'WiFi': <Wifi className="h-4 w-4" />
}

interface SpaceDetailDrawerProps {
  space: Space | null
  isOpen: boolean
  onClose: () => void
  onBookTour?: () => void
  onBook?: () => void
}

export function SpaceDetailDrawer({ 
  space, 
  isOpen, 
  onClose,
  onBookTour,
  onBook
}: SpaceDetailDrawerProps) {
  const { shortlistedSpaces, addToShortlist, removeFromShortlist } = useAppStore()
  
  const isShortlisted = space ? shortlistedSpaces.includes(space.id) : false

  const toggleShortlist = () => {
    if (!space) return
    if (isShortlisted) {
      removeFromShortlist(space.id)
    } else {
      addToShortlist(space.id)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && space && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 shadow-2xl",
              "flex flex-col"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", statusConfig[space.status].color)}>
                  {statusConfig[space.status].label}
                </Badge>
                <span className="text-xs text-muted-foreground capitalize">
                  {space.type.replace('-', ' ')}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Image Placeholder */}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  {isShortlisted && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1.5 rounded-full">
                      <Pin className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Title & Location */}
                <div>
                  <h2 className="text-xl font-semibold">{space.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    Floor {space.floor}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-semibold">{space.capacity}</p>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Maximize2 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-semibold">{space.sqft}</p>
                    <p className="text-xs text-muted-foreground">Sq Ft</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-lg font-semibold">
                      {space.price > 0 ? `$${(space.price / 1000).toFixed(1)}k` : 'Free'}
                    </p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="font-medium mb-2">About this space</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {space.description}
                  </p>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="font-medium mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {space.amenities.map((amenity) => (
                      <div 
                        key={amenity}
                        className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2"
                      >
                        <span className="text-primary">
                          {amenityIcons[amenity] || <CheckCircle2 className="h-4 w-4" />}
                        </span>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                {space.availableFrom && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-accent">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium text-sm">Available from</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {new Date(space.availableFrom).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {/* Last Updated */}
                <p className="text-xs text-muted-foreground text-center">
                  Last updated {new Date(space.lastUpdated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-transparent"
                  onClick={toggleShortlist}
                >
                  <Pin className={cn("h-4 w-4 mr-2", isShortlisted && "fill-primary")} />
                  {isShortlisted ? 'Saved' : 'Save'}
                </Button>
                {space.status === 'available' && (
                  <Button 
                    variant="secondary" 
                    className="flex-1"
                    onClick={onBookTour}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Tour
                  </Button>
                )}
              </div>
              {space.status === 'available' && (
                <Button className="w-full" size="lg" onClick={onBook}>
                  Reserve This Space
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
