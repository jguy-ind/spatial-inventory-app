'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import type { ChatMessage } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  X,
  Send,
  Mic,
  MicOff,
  ImageIcon,
  Sparkles,
  Bot,
  User,
  Loader2,
  Calendar,
  MapPin,
  HelpCircle,
  Building2,
  Clock
} from 'lucide-react'

const quickActions = [
  { label: 'Find available offices', icon: Building2, query: 'Show me all available private offices' },
  { label: 'Schedule a tour', icon: Calendar, query: 'I want to schedule a tour' },
  { label: 'Compare spaces', icon: MapPin, query: 'Help me compare spaces for a team of 10' },
  { label: 'Pricing info', icon: HelpCircle, query: 'What are the pricing options?' },
]

const mockResponses: Record<string, string> = {
  'default': "I'm Gemini, your AI assistant for exploring Industrious workspaces. I can help you find the perfect space, schedule tours, compare options, and answer any questions. What would you like to know?",
  'available': "I found **5 available spaces** on Floor 1 that might interest you:\n\n1. **Executive Suite A** - 8 people, $8,500/mo\n2. **Focus Pod 1** - 1 person, $750/mo\n3. **Boardroom Alpha** - 16 people, $150/hr\n4. **Common Lounge** - Included with membership\n5. **Phone Booth B** - Free for members\n\nWould you like me to show you details on any of these?",
  'tour': "I'd be happy to help you schedule a tour! 📅\n\nI have the following slots available this week:\n- **Tomorrow** at 10:00 AM or 2:00 PM\n- **Thursday** at 11:00 AM or 3:00 PM\n- **Friday** at 9:00 AM\n\nWhich time works best for you? I can also accommodate specific requests if needed.",
  'compare': "For a team of 10, I'd recommend comparing these options:\n\n| Space | Capacity | Price | Best For |\n|-------|----------|-------|----------|\n| Executive Suite A | 8 | $8,500/mo | Premium |\n| Team Office B | 12 | $12,000/mo | Growth |\n| Startup Hub | 6 | $5,500/mo | Budget |\n\nThe **Team Office B** offers the best value for growing teams with its flexible layout and included kitchenette. Want me to add these to your comparison shortlist?",
  'pricing': "Here's our pricing structure at Industrious HQ:\n\n**Private Offices:** $5,500 - $22,000/month\n- Includes 24/7 access, utilities, cleaning\n- Flexible terms from 1 month+\n\n**Dedicated Desks:** $750/month\n- Full amenity access\n- Personal storage locker\n\n**Meeting Rooms:** $50-150/hour\n- Video conferencing included\n- Catering available\n\nWould you like a personalized quote based on your team size?",
}

export function AIChatDrawer() {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    chatMessages, 
    addChatMessage, 
    isChatOpen, 
    setIsChatOpen 
  } = useAppStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    }
    addChatMessage(userMessage)
    setInput('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      let response = mockResponses['default']
      const lowerMessage = message.toLowerCase()
      
      if (lowerMessage.includes('available') || lowerMessage.includes('office')) {
        response = mockResponses['available']
      } else if (lowerMessage.includes('tour') || lowerMessage.includes('schedule')) {
        response = mockResponses['tour']
      } else if (lowerMessage.includes('compare') || lowerMessage.includes('team')) {
        response = mockResponses['compare']
      } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        response = mockResponses['pricing']
      }

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }
      addChatMessage(aiMessage)
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickAction = (query: string) => {
    handleSendMessage(query)
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    // Voice recognition would be implemented here
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false)
        handleSendMessage("Show me available meeting rooms for tomorrow")
      }, 2000)
    }
  }

  return (
    <AnimatePresence>
      {isChatOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsChatOpen(false)}
          />

          {/* Chat Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">Gemini AI Assistant</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-space-available animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close chat</span>
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {chatMessages.length === 0 ? (
                <div className="space-y-6">
                  {/* Welcome */}
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Welcome to Gemini AI</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                      I can help you find spaces, schedule tours, and answer questions about Industrious.
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 px-1">Quick actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => (
                        <Button
                          key={action.label}
                          variant="outline"
                          className="h-auto py-3 px-3 justify-start text-left bg-transparent"
                          onClick={() => handleQuickAction(action.query)}
                        >
                          <action.icon className="h-4 w-4 mr-2 shrink-0 text-primary" />
                          <span className="text-xs">{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-3",
                        message.role === 'user' && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className={cn(
                          message.role === 'assistant' 
                            ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                            : "bg-secondary"
                        )}>
                          {message.role === 'assistant' ? (
                            <Sparkles className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 max-w-[80%]",
                        message.role === 'assistant' 
                          ? "bg-muted text-foreground rounded-tl-sm"
                          : "bg-primary text-primary-foreground rounded-tr-sm"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          message.role === 'assistant' 
                            ? "text-muted-foreground"
                            : "text-primary-foreground/70"
                        )}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-border">
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 p-3 bg-primary/10 rounded-lg flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                    <Mic className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Listening...</p>
                    <p className="text-xs text-muted-foreground">Speak your question</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsListening(false)}
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0"
                  onClick={() => {/* Image upload */}}
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="sr-only">Attach image</span>
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(input)
                      }
                    }}
                    className="pr-10"
                  />
                </div>

                <Button 
                  variant={isListening ? "destructive" : "ghost"}
                  size="icon" 
                  className="shrink-0"
                  onClick={toggleListening}
                >
                  {isListening ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                  <span className="sr-only">{isListening ? 'Stop listening' : 'Voice input'}</span>
                </Button>

                <Button 
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  onClick={() => handleSendMessage(input)}
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send message</span>
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                Powered by Google Gemini AI
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
