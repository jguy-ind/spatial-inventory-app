'use client'

import React from "react"

import { useCallback, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import type { Space } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ZoomIn, ZoomOut, RotateCcw, Layers, Pin, Users, DollarSign } from 'lucide-react'

const statusColors = {
  available: 'fill-space-available/20 stroke-space-available hover:fill-space-available/40',
  occupied: 'fill-space-occupied/20 stroke-space-occupied hover:fill-space-occupied/30',
  pending: 'fill-space-pending/20 stroke-space-pending hover:fill-space-pending/40',
  maintenance: 'fill-space-maintenance/20 stroke-space-maintenance hover:fill-space-maintenance/30'
}

const statusLabels = {
  available: 'Available',
  occupied: 'Occupied',
  pending: 'Pending',
  maintenance: 'Maintenance'
}

interface MapCanvasProps {
  onSpaceClick?: (space: Space) => void
  className?: string
  isAdmin?: boolean
}

export function MapCanvas({ onSpaceClick, className, isAdmin = false }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [hoveredSpace, setHoveredSpace] = useState<Space | null>(null)
  
  const { 
    spaces, 
    currentFloor, 
    currentBuilding, 
    zoomLevel, 
    setZoomLevel,
    shortlistedSpaces,
    addToShortlist,
    removeFromShortlist,
    filters
  } = useAppStore()

  // Filter spaces by current building and floor
  const filteredSpaces = spaces.filter(space => {
    if (space.building !== currentBuilding || space.floor !== currentFloor) return false
    
    // Apply filters
    if (filters.spaceTypes.length > 0 && !filters.spaceTypes.includes(space.type)) return false
    if (filters.statuses.length > 0 && !filters.statuses.includes(space.status)) return false
    if (space.capacity < filters.minCapacity || space.capacity > filters.maxCapacity) return false
    if (space.price < filters.minPrice || space.price > filters.maxPrice) return false
    if (filters.amenities.length > 0 && !filters.amenities.some(a => space.amenities.includes(a))) return false
    
    return true
  })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).classList.contains('map-background')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleZoomIn = () => setZoomLevel(Math.min(zoomLevel + 0.25, 2))
  const handleZoomOut = () => setZoomLevel(Math.max(zoomLevel - 0.25, 0.5))
  const handleReset = () => {
    setZoomLevel(1)
    setPan({ x: 0, y: 0 })
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoomLevel(Math.min(Math.max(zoomLevel + delta, 0.5), 2))
  }, [zoomLevel, setZoomLevel])

  const handleSpaceClick = (space: Space) => {
    onSpaceClick?.(space)
  }

  const toggleShortlist = (e: React.MouseEvent, spaceId: string) => {
    e.stopPropagation()
    if (shortlistedSpaces.includes(spaceId)) {
      removeFromShortlist(spaceId)
    } else {
      addToShortlist(spaceId)
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("relative w-full h-full overflow-hidden bg-muted/30 rounded-lg", className)}>
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button variant="secondary" size="icon" onClick={handleZoomIn} className="shadow-md">
            <ZoomIn className="h-4 w-4" />
            <span className="sr-only">Zoom in</span>
          </Button>
          <Button variant="secondary" size="icon" onClick={handleZoomOut} className="shadow-md">
            <ZoomOut className="h-4 w-4" />
            <span className="sr-only">Zoom out</span>
          </Button>
          <Button variant="secondary" size="icon" onClick={handleReset} className="shadow-md">
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Reset view</span>
          </Button>
        </div>

        {/* Zoom Level Indicator */}
        <div className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm font-medium shadow-sm border border-border">
          {Math.round(zoomLevel * 100)}%
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-20 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-1 mb-2 text-xs font-medium text-muted-foreground">
            <Layers className="h-3 w-3" />
            Status Legend
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {Object.entries(statusLabels).map(([status, label]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={cn(
                  "w-3 h-3 rounded-sm border",
                  status === 'available' && "bg-space-available/30 border-space-available",
                  status === 'occupied' && "bg-space-occupied/30 border-space-occupied",
                  status === 'pending' && "bg-space-pending/30 border-space-pending",
                  status === 'maintenance' && "bg-space-maintenance/30 border-space-maintenance"
                )} />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map Canvas */}
        <div 
          ref={containerRef}
          className="map-canvas w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <motion.svg
            className="w-full h-full map-background"
            viewBox="0 0 650 400"
            style={{
              transform: `scale(${zoomLevel}) translate(${pan.x / zoomLevel}px, ${pan.y / zoomLevel}px)`
            }}
          >
            {/* Floor outline */}
            <rect 
              x="30" 
              y="30" 
              width="590" 
              height="340" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="text-border"
              rx="8"
            />
            
            {/* Grid lines */}
            {[100, 200, 300, 400, 500].map(x => (
              <line key={`v-${x}`} x1={x} y1="30" x2={x} y2="370" className="stroke-border/30" strokeDasharray="4 4" />
            ))}
            {[100, 200, 300].map(y => (
              <line key={`h-${y}`} x1="30" y1={y} x2="620" y2={y} className="stroke-border/30" strokeDasharray="4 4" />
            ))}

            {/* Spaces */}
            <AnimatePresence mode="popLayout">
              {filteredSpaces.map((space) => {
                const isShortlisted = shortlistedSpaces.includes(space.id)
                const isHovered = hoveredSpace?.id === space.id
                
                return (
                  <Tooltip key={space.id}>
                    <TooltipTrigger asChild>
                      <motion.g
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="cursor-pointer"
                        onClick={() => handleSpaceClick(space)}
                        onMouseEnter={() => setHoveredSpace(space)}
                        onMouseLeave={() => setHoveredSpace(null)}
                      >
                        <motion.rect
                          x={space.position.x}
                          y={space.position.y}
                          width={space.position.width}
                          height={space.position.height}
                          rx="4"
                          className={cn(
                            "transition-colors duration-200 stroke-2",
                            statusColors[space.status],
                            isHovered && "stroke-[3]",
                            isShortlisted && "stroke-primary stroke-[3]"
                          )}
                        />
                        
                        {/* Space name */}
                        <text
                          x={space.position.x + space.position.width / 2}
                          y={space.position.y + space.position.height / 2 - 8}
                          textAnchor="middle"
                          className="fill-foreground text-[10px] font-medium pointer-events-none"
                        >
                          {space.name.length > 15 ? space.name.substring(0, 15) + '...' : space.name}
                        </text>
                        
                        {/* Capacity indicator */}
                        <text
                          x={space.position.x + space.position.width / 2}
                          y={space.position.y + space.position.height / 2 + 8}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[9px] pointer-events-none"
                        >
                          {space.capacity} {space.capacity === 1 ? 'person' : 'people'}
                        </text>

                        {/* Shortlist indicator */}
                        {isShortlisted && (
                          <motion.circle
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            cx={space.position.x + space.position.width - 10}
                            cy={space.position.y + 10}
                            r="8"
                            className="fill-primary"
                          />
                        )}
                        {isShortlisted && (
                          <Pin 
                            className="text-primary-foreground" 
                            x={space.position.x + space.position.width - 14}
                            y={space.position.y + 6}
                            width={8}
                            height={8}
                          />
                        )}

                        {/* Status pulse for pending */}
                        {space.status === 'pending' && (
                          <motion.rect
                            x={space.position.x}
                            y={space.position.y}
                            width={space.position.width}
                            height={space.position.height}
                            rx="4"
                            className="fill-none stroke-space-pending stroke-2"
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: [0.8, 0.3, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.g>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="p-0 overflow-hidden"
                      sideOffset={5}
                    >
                      <div className="p-3 space-y-2 min-w-[200px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-sm">{space.name}</h4>
                            <p className="text-xs text-muted-foreground capitalize">{space.type.replace('-', ' ')}</p>
                          </div>
                          <Badge variant={space.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                            {statusLabels[space.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {space.capacity}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {space.price > 0 ? `$${space.price.toLocaleString()}/mo` : 'Included'}
                          </span>
                        </div>
                        {!isAdmin && space.status === 'available' && (
                          <Button 
                            size="sm" 
                            variant={isShortlisted ? "secondary" : "default"}
                            className="w-full h-7 text-xs"
                            onClick={(e) => toggleShortlist(e, space.id)}
                          >
                            <Pin className="h-3 w-3 mr-1" />
                            {isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                          </Button>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </AnimatePresence>
          </motion.svg>
        </div>
      </div>
    </TooltipProvider>
  )
}
