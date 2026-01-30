'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  X,
  Users,
  Maximize2,
  DollarSign,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  ImageIcon
} from 'lucide-react'

interface CompareViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig = {
  available: { label: 'Available', color: 'bg-space-available text-white' },
  occupied: { label: 'Occupied', color: 'bg-space-occupied text-white' },
  pending: { label: 'Pending', color: 'bg-space-pending text-foreground' },
  maintenance: { label: 'Maintenance', color: 'bg-space-maintenance text-white' }
}

export function CompareView({ open, onOpenChange }: CompareViewProps) {
  const { spaces, shortlistedSpaces, removeFromShortlist, setIsBookingDrawerOpen } = useAppStore()
  
  const comparingSpaces = spaces.filter(s => shortlistedSpaces.includes(s.id))

  // Get all unique amenities across all spaces
  const allAmenities = [...new Set(comparingSpaces.flatMap(s => s.amenities))]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle>Compare Spaces</DialogTitle>
          <DialogDescription>
            Side-by-side comparison of {comparingSpaces.length} selected spaces
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6">
            <div className="flex gap-4 min-w-max">
              {/* Labels Column */}
              <div className="w-40 shrink-0 pt-[240px] space-y-6">
                <div className="h-14 flex items-center text-sm font-medium text-muted-foreground">
                  Status
                </div>
                <div className="h-10 flex items-center text-sm font-medium text-muted-foreground">
                  Type
                </div>
                <div className="h-10 flex items-center text-sm font-medium text-muted-foreground">
                  Location
                </div>
                <div className="h-10 flex items-center text-sm font-medium text-muted-foreground">
                  Capacity
                </div>
                <div className="h-10 flex items-center text-sm font-medium text-muted-foreground">
                  Size
                </div>
                <div className="h-10 flex items-center text-sm font-medium text-muted-foreground">
                  Monthly Price
                </div>
                <div className="h-10 flex items-center text-sm font-medium text-muted-foreground">
                  Price per Sqft
                </div>
                <div className="h-10 flex items-center text-sm font-medium text-muted-foreground">
                  Available From
                </div>
                <div className="h-auto pt-4 text-sm font-medium text-muted-foreground border-t border-border">
                  Amenities
                </div>
                {allAmenities.map(amenity => (
                  <div key={amenity} className="h-8 flex items-center text-sm text-muted-foreground pl-2">
                    {amenity}
                  </div>
                ))}
              </div>

              {/* Space Columns */}
              {comparingSpaces.map((space) => (
                <Card key={space.id} className="w-64 shrink-0">
                  <CardHeader className="p-4 pb-2 relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeFromShortlist(space.id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                    {/* Image */}
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-2">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <CardTitle className="text-base">{space.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-6">
                    {/* Status */}
                    <div className="h-14 flex items-center">
                      <Badge className={cn("text-xs", statusConfig[space.status].color)}>
                        {statusConfig[space.status].label}
                      </Badge>
                    </div>

                    {/* Type */}
                    <div className="h-10 flex items-center text-sm capitalize">
                      {space.type.replace('-', ' ')}
                    </div>

                    {/* Location */}
                    <div className="h-10 flex items-center text-sm">
                      <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                      Floor {space.floor}
                    </div>

                    {/* Capacity */}
                    <div className="h-10 flex items-center text-sm">
                      <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                      {space.capacity} {space.capacity === 1 ? 'person' : 'people'}
                    </div>

                    {/* Size */}
                    <div className="h-10 flex items-center text-sm">
                      <Maximize2 className="h-3 w-3 mr-1 text-muted-foreground" />
                      {space.sqft} sq ft
                    </div>

                    {/* Monthly Price */}
                    <div className="h-10 flex items-center text-sm font-semibold">
                      <DollarSign className="h-3 w-3 mr-0.5 text-muted-foreground" />
                      {space.price > 0 ? `${space.price.toLocaleString()}/mo` : 'Included'}
                    </div>

                    {/* Price per Sqft */}
                    <div className="h-10 flex items-center text-sm text-muted-foreground">
                      {space.price > 0 ? `$${(space.price / space.sqft).toFixed(2)}/sqft` : '-'}
                    </div>

                    {/* Available From */}
                    <div className="h-10 flex items-center text-sm">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      {space.availableFrom 
                        ? new Date(space.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Now'}
                    </div>

                    {/* Amenities */}
                    <div className="h-auto pt-4 border-t border-border" />
                    {allAmenities.map(amenity => (
                      <div key={amenity} className="h-8 flex items-center">
                        {space.amenities.includes(amenity) ? (
                          <CheckCircle2 className="h-4 w-4 text-space-available" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/30" />
                        )}
                      </div>
                    ))}

                    {/* Action */}
                    {space.status === 'available' && (
                      <Button 
                        className="w-full mt-4" 
                        size="sm"
                        onClick={() => {
                          onOpenChange(false)
                          setIsBookingDrawerOpen(true)
                        }}
                      >
                        Reserve
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
