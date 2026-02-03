'use client'

import { useAppStore } from '@/lib/store'
import type { Building } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building2, Layers } from 'lucide-react'

interface FloorSelectorProps {
  buildings?: Building[]
  className?: string
}

export function FloorSelector({ buildings = [], className }: FloorSelectorProps) {
  const { 
    currentBuilding, 
    setCurrentBuilding, 
    currentFloor, 
    setCurrentFloor 
  } = useAppStore()

  const building = buildings.find(b => b.id === currentBuilding)
  const floors = building ? Array.from({ length: building.floors }, (_, i) => i + 1) : []

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Building Selector */}
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <Select value={currentBuilding} onValueChange={setCurrentBuilding}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select building" />
          </SelectTrigger>
          <SelectContent>
            {buildings.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                <div className="flex flex-col">
                  <span>{b.name}</span>
                  <span className="text-xs text-muted-foreground">{b.city}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Floor Selector */}
      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
        <Layers className="h-4 w-4 text-muted-foreground ml-2" />
        {floors.map((floor) => (
          <Button
            key={floor}
            variant={currentFloor === floor ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentFloor(floor)}
            className="min-w-[60px]"
          >
            Floor {floor}
          </Button>
        ))}
      </div>
    </div>
  )
}
