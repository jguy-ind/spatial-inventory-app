'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Users,
  DollarSign,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Building2
} from 'lucide-react'
import { format, addMonths, addDays } from 'date-fns'

type BookingStep = 'type' | 'details' | 'schedule' | 'review' | 'confirmed'

const bookingTypes = [
  { 
    id: 'tour', 
    label: 'Schedule Tour', 
    description: 'Visit the space in person before committing',
    icon: CalendarIcon
  },
  { 
    id: 'reserve', 
    label: 'Reserve Space', 
    description: 'Book this space for your team',
    icon: Building2
  },
]

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
]

const leaseDurations = [
  { value: '1', label: '1 Month', discount: 0 },
  { value: '3', label: '3 Months', discount: 5 },
  { value: '6', label: '6 Months', discount: 10 },
  { value: '12', label: '12 Months', discount: 15 },
]

export function BookingDrawer() {
  const [step, setStep] = useState<BookingStep>('type')
  const [bookingType, setBookingType] = useState<'tour' | 'reserve' | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [leaseDuration, setLeaseDuration] = useState('3')
  const [teamSize, setTeamSize] = useState('')
  const [notes, setNotes] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  const { 
    selectedSpace, 
    isBookingDrawerOpen, 
    setIsBookingDrawerOpen,
    setIsDetailDrawerOpen
  } = useAppStore()

  const handleClose = () => {
    setIsBookingDrawerOpen(false)
    setStep('type')
    setBookingType(null)
    setSelectedDate(undefined)
    setSelectedTime('')
    setNotes('')
  }

  const handleNext = () => {
    if (step === 'type' && bookingType) setStep('details')
    else if (step === 'details') setStep('schedule')
    else if (step === 'schedule') setStep('review')
    else if (step === 'review') setStep('confirmed')
  }

  const handleBack = () => {
    if (step === 'details') setStep('type')
    else if (step === 'schedule') setStep('details')
    else if (step === 'review') setStep('schedule')
  }

  const selectedDuration = leaseDurations.find(d => d.value === leaseDuration)
  const monthlyPrice = selectedSpace?.price ?? 0
  const discountedPrice = monthlyPrice * (1 - (selectedDuration?.discount ?? 0) / 100)
  const totalPrice = discountedPrice * parseInt(leaseDuration)

  const canProceed = () => {
    switch (step) {
      case 'type': return !!bookingType
      case 'details': return contactName && contactEmail
      case 'schedule': return !!selectedDate && !!selectedTime
      case 'review': return true
      default: return false
    }
  }

  return (
    <AnimatePresence>
      {isBookingDrawerOpen && selectedSpace && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l border-border z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h2 className="font-semibold">
                  {step === 'confirmed' ? 'Booking Confirmed' : 'Book Space'}
                </h2>
                <p className="text-sm text-muted-foreground">{selectedSpace.name}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Progress */}
            {step !== 'confirmed' && (
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  {['type', 'details', 'schedule', 'review'].map((s, i) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className={cn(
                        "h-2 flex-1 rounded-full transition-colors",
                        ['type', 'details', 'schedule', 'review'].indexOf(step) >= i
                          ? "bg-primary"
                          : "bg-muted"
                      )} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Type</span>
                  <span>Details</span>
                  <span>Schedule</span>
                  <span>Review</span>
                </div>
              </div>
            )}

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Step: Type Selection */}
                {step === 'type' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <h3 className="font-medium">What would you like to do?</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose how you'd like to proceed with {selectedSpace.name}
                      </p>
                    </div>

                    <RadioGroup 
                      value={bookingType ?? ''} 
                      onValueChange={(v) => setBookingType(v as 'tour' | 'reserve')}
                    >
                      {bookingTypes.map((type) => (
                        <Label
                          key={type.id}
                          htmlFor={type.id}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                            bookingType === type.id 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value={type.id} id={type.id} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4 text-primary" />
                              <span className="font-medium">{type.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {type.description}
                            </p>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>

                    {/* Space Summary */}
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{selectedSpace.name}</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedSpace.type.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {selectedSpace.capacity} people
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Floor {selectedSpace.floor}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${selectedSpace.price.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step: Contact Details */}
                {step === 'details' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <h3 className="font-medium">Your Details</h3>
                      <p className="text-sm text-muted-foreground">
                        Let us know how to reach you
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input 
                          id="name" 
                          placeholder="John Doe"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="john@company.com"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          placeholder="+1 (555) 000-0000"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                        />
                      </div>

                      {bookingType === 'reserve' && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <Label htmlFor="team-size">Team Size</Label>
                            <Input 
                              id="team-size" 
                              type="number" 
                              placeholder="e.g., 8"
                              value={teamSize}
                              onChange={(e) => setTeamSize(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Lease Duration</Label>
                            <Select value={leaseDuration} onValueChange={setLeaseDuration}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {leaseDurations.map((d) => (
                                  <SelectItem key={d.value} value={d.value}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{d.label}</span>
                                      {d.discount > 0 && (
                                        <Badge variant="secondary" className="ml-2 text-xs">
                                          {d.discount}% off
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea 
                          id="notes" 
                          placeholder="Any specific requirements or questions..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step: Schedule */}
                {step === 'schedule' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <h3 className="font-medium">
                        {bookingType === 'tour' ? 'Select Tour Date & Time' : 'Select Start Date'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {bookingType === 'tour' 
                          ? 'Choose when you would like to visit'
                          : 'When would you like to move in?'
                        }
                      </p>
                    </div>

                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date > addMonths(new Date(), 3)}
                        className="rounded-md border"
                      />
                    </div>

                    {bookingType === 'tour' && (
                      <div className="space-y-2">
                        <Label>Available Time Slots</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(time)}
                              className="w-full"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {bookingType === 'reserve' && selectedDate && (
                      <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                        <div className="flex items-center gap-2 text-accent">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-sm font-medium">AI Recommendation</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Based on current availability, {format(selectedDate, 'MMMM d')} is a great 
                          choice! We can have the space ready for your team.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step: Review */}
                {step === 'review' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <h3 className="font-medium">Review Your Booking</h3>
                      <p className="text-sm text-muted-foreground">
                        Please confirm the details below
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Space Info */}
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">{selectedSpace.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Type</div>
                          <div className="capitalize">{selectedSpace.type.replace('-', ' ')}</div>
                          <div className="text-muted-foreground">Location</div>
                          <div>Floor {selectedSpace.floor}</div>
                          <div className="text-muted-foreground">Capacity</div>
                          <div>{selectedSpace.capacity} people</div>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Booking Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Type</div>
                          <div>{bookingType === 'tour' ? 'Tour' : 'Reservation'}</div>
                          <div className="text-muted-foreground">Date</div>
                          <div>{selectedDate ? format(selectedDate, 'PPP') : '-'}</div>
                          {bookingType === 'tour' && (
                            <>
                              <div className="text-muted-foreground">Time</div>
                              <div>{selectedTime || '-'}</div>
                            </>
                          )}
                          {bookingType === 'reserve' && (
                            <>
                              <div className="text-muted-foreground">Duration</div>
                              <div>{selectedDuration?.label}</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Contact Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Name</div>
                          <div>{contactName}</div>
                          <div className="text-muted-foreground">Email</div>
                          <div>{contactEmail}</div>
                          {contactPhone && (
                            <>
                              <div className="text-muted-foreground">Phone</div>
                              <div>{contactPhone}</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pricing (for reservations) */}
                      {bookingType === 'reserve' && (
                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium mb-3">Pricing Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Monthly Rate</span>
                              <span>${monthlyPrice.toLocaleString()}</span>
                            </div>
                            {(selectedDuration?.discount ?? 0) > 0 && (
                              <div className="flex justify-between text-space-available">
                                <span>Discount ({selectedDuration?.discount}%)</span>
                                <span>-${((monthlyPrice - discountedPrice) * parseInt(leaseDuration)).toLocaleString()}</span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-semibold text-base">
                              <span>Total ({leaseDuration} months)</span>
                              <span>${totalPrice.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step: Confirmed */}
                {step === 'confirmed' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-6"
                  >
                    <div className="w-20 h-20 rounded-full bg-space-available/20 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-10 w-10 text-space-available" />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {bookingType === 'tour' ? 'Tour Scheduled!' : 'Reservation Confirmed!'}
                      </h3>
                      <p className="text-muted-foreground">
                        {bookingType === 'tour' 
                          ? `We've scheduled your tour for ${selectedDate ? format(selectedDate, 'PPP') : ''} at ${selectedTime}`
                          : `Your reservation for ${selectedSpace.name} has been confirmed`
                        }
                      </p>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg text-left">
                      <h4 className="font-medium mb-2">What's Next?</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-space-available mt-0.5 shrink-0" />
                          Confirmation email sent to {contactEmail}
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-space-available mt-0.5 shrink-0" />
                          Calendar invite will be sent shortly
                        </li>
                        {bookingType === 'tour' && (
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-space-available mt-0.5 shrink-0" />
                            Our team will meet you in the lobby
                          </li>
                        )}
                      </ul>
                    </div>

                    <Button onClick={handleClose} className="w-full">
                      Done
                    </Button>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            {step !== 'confirmed' && (
              <div className="p-4 border-t border-border flex gap-2">
                {step !== 'type' && (
                  <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                    Back
                  </Button>
                )}
                <Button 
                  onClick={handleNext} 
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  {step === 'review' ? 'Confirm Booking' : 'Continue'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
