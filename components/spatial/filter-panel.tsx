'use client'

import { useAppStore } from '@/lib/store'
import type { SpaceType, SpaceStatus } from '@/lib/types'
import { amenityOptions } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Filter,
  RotateCcw,
  Building2,
  Users,
  DollarSign,
  Sparkles
} from 'lucide-react'

const spaceTypes: { value: SpaceType; label: string }[] = [
  { value: 'office', label: 'Private Office' },
  { value: 'desk', label: 'Dedicated Desk' },
  { value: 'meeting-room', label: 'Meeting Room' },
  { value: 'event-space', label: 'Event Space' },
  { value: 'common-area', label: 'Common Area' }
]

const spaceStatuses: { value: SpaceStatus; label: string; color: string }[] = [
  { value: 'available', label: 'Available', color: 'bg-space-available' },
  { value: 'occupied', label: 'Occupied', color: 'bg-space-occupied' },
  { value: 'pending', label: 'Pending', color: 'bg-space-pending' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-space-maintenance' }
]

interface FilterPanelProps {
  className?: string
}

export function FilterPanel({ className }: FilterPanelProps) {
  const { filters, setFilters, resetFilters } = useAppStore()

  const handleSpaceTypeToggle = (type: SpaceType) => {
    const current = filters.spaceTypes
    if (current.includes(type)) {
      setFilters({ spaceTypes: current.filter(t => t !== type) })
    } else {
      setFilters({ spaceTypes: [...current, type] })
    }
  }

  const handleStatusToggle = (status: SpaceStatus) => {
    const current = filters.statuses
    if (current.includes(status)) {
      setFilters({ statuses: current.filter(s => s !== status) })
    } else {
      setFilters({ statuses: [...current, status] })
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    const current = filters.amenities
    if (current.includes(amenity)) {
      setFilters({ amenities: current.filter(a => a !== amenity) })
    } else {
      setFilters({ amenities: [...current, amenity] })
    }
  }

  const activeFilterCount = 
    filters.spaceTypes.length + 
    filters.statuses.length + 
    filters.amenities.length +
    (filters.minCapacity > 0 ? 1 : 0) +
    (filters.maxCapacity < 100 ? 1 : 0) +
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice < 50000 ? 1 : 0)

  return (
    <div className={cn("bg-background border border-border rounded-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetFilters}
          className="text-xs h-7"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-16rem)]">
        <Accordion type="multiple" defaultValue={['type', 'status', 'capacity']} className="px-4">
          {/* Space Type */}
          <AccordionItem value="type">
            <AccordionTrigger className="text-sm hover:no-underline">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                Space Type
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {spaceTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.value}`}
                      checked={filters.spaceTypes.includes(type.value)}
                      onCheckedChange={() => handleSpaceTypeToggle(type.value)}
                    />
                    <Label 
                      htmlFor={`type-${type.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Status */}
          <AccordionItem value="status">
            <AccordionTrigger className="text-sm hover:no-underline">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                Status
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-2">
                {spaceStatuses.map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={filters.statuses.includes(status.value)}
                      onCheckedChange={() => handleStatusToggle(status.value)}
                    />
                    <Label 
                      htmlFor={`status-${status.value}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      <span className={cn("w-2 h-2 rounded-full", status.color)} />
                      {status.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Capacity */}
          <AccordionItem value="capacity">
            <AccordionTrigger className="text-sm hover:no-underline">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Capacity
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 pb-2 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Min</span>
                  <span className="font-medium">{filters.minCapacity} people</span>
                </div>
                <Slider
                  value={[filters.minCapacity]}
                  onValueChange={([value]) => setFilters({ minCapacity: value })}
                  max={50}
                  step={1}
                />
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max</span>
                  <span className="font-medium">{filters.maxCapacity} people</span>
                </div>
                <Slider
                  value={[filters.maxCapacity]}
                  onValueChange={([value]) => setFilters({ maxCapacity: value })}
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price */}
          <AccordionItem value="price">
            <AccordionTrigger className="text-sm hover:no-underline">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Price Range
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 pb-2 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Range</span>
                  <span className="font-medium">
                    ${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()}/mo
                  </span>
                </div>
                <Slider
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => setFilters({ minPrice: min, maxPrice: max })}
                  min={0}
                  max={50000}
                  step={500}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Amenities */}
          <AccordionItem value="amenities">
            <AccordionTrigger className="text-sm hover:no-underline">
              Amenities
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-2 flex flex-wrap gap-2">
                {amenityOptions.slice(0, 10).map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleAmenityToggle(amenity)}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  )
}
