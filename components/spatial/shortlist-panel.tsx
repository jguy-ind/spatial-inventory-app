'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Pin,
  X,
  Trash2,
  ArrowRight,
  Users,
  DollarSign,
  Scale
} from 'lucide-react'

interface ShortlistPanelProps {
  onSpaceSelect?: (spaceId: string) => void
  onCompare?: () => void
}

export function ShortlistPanel({ onSpaceSelect, onCompare }: ShortlistPanelProps) {
  const { 
    spaces, 
    shortlistedSpaces, 
    removeFromShortlist, 
    clearShortlist,
    setSelectedSpace,
    setIsDetailDrawerOpen
  } = useAppStore()

  const shortlistedItems = spaces.filter(s => shortlistedSpaces.includes(s.id))

  const handleSpaceClick = (spaceId: string) => {
    const space = spaces.find(s => s.id === spaceId)
    if (space) {
      setSelectedSpace(space)
      setIsDetailDrawerOpen(true)
      onSpaceSelect?.(spaceId)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "relative",
            shortlistedSpaces.length > 0 && "border-primary"
          )}
        >
          <Pin className={cn(
            "h-4 w-4 mr-2",
            shortlistedSpaces.length > 0 && "fill-primary text-primary"
          )} />
          Shortlist
          {shortlistedSpaces.length > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {shortlistedSpaces.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5 fill-primary text-primary" />
            Your Shortlist
          </SheetTitle>
          <SheetDescription>
            {shortlistedSpaces.length === 0 
              ? "Save spaces to compare them later"
              : `${shortlistedSpaces.length} space${shortlistedSpaces.length > 1 ? 's' : ''} saved`
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex flex-col h-[calc(100vh-12rem)]">
          {shortlistedSpaces.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Pin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No spaces saved yet</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Click the pin icon on any space to add it to your shortlist for easy comparison
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <AnimatePresence mode="popLayout">
                  {shortlistedItems.map((space, index) => (
                    <motion.div
                      key={space.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card 
                        className="mb-3 cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleSpaceClick(space.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm truncate">{space.name}</h4>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs shrink-0",
                                    space.status === 'available' && "border-space-available text-space-available",
                                    space.status === 'pending' && "border-space-pending text-space-pending"
                                  )}
                                >
                                  {space.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground capitalize mb-2">
                                {space.type.replace('-', ' ')} • Floor {space.floor}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {space.capacity}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {space.price > 0 ? `$${space.price.toLocaleString()}/mo` : 'Included'}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFromShortlist(space.id)
                              }}
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove from shortlist</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>

              {/* Actions */}
              <div className="pt-4 border-t border-border space-y-2 mt-auto">
                {shortlistedItems.length >= 2 && (
                  <Button 
                    className="w-full" 
                    onClick={onCompare}
                  >
                    <Scale className="h-4 w-4 mr-2" />
                    Compare {shortlistedItems.length} Spaces
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:text-destructive bg-transparent"
                  onClick={clearShortlist}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Shortlist
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
