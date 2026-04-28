'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

interface ChatBoxProps {
  orderId: string
  currentUserId: string
}

export function ChatBox({ orderId, currentUserId }: ChatBoxProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true })

      if (error) console.error('Error fetching messages:', error)
      else setMessages(data || [])
      setIsLoading(false)
    }

    fetchMessages()

    // 2. Subscribe to new messages
    const channel = supabase
      .channel(`chat:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  // 3. Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    const { error } = await supabase.from('messages').insert({
      order_id: orderId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    })

    if (error) {
      alert('Erro ao enviar mensagem: ' + error.message)
    } else {
      setNewMessage('')
    }
    setIsSending(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando conversa...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-3xl overflow-hidden bg-background shadow-xl">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm">Chat em Tempo Real</span>
        </div>
        <Badge variant="outline" className="bg-green-500/5 text-green-600 border-none text-[10px] uppercase font-black">Online</Badge>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-grow p-6 overflow-y-auto space-y-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-30 italic text-sm">
            Nenhuma mensagem ainda. Inicie a conversa!
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div 
              key={msg.id} 
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                isMine 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-muted rounded-tl-none text-foreground'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <span className={`text-[9px] mt-1 block opacity-50 ${isMine ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.created_at).toLocaleTimeString().slice(0, 5)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-muted/20">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input 
            placeholder="Digite sua dúvida ou instrução..." 
            className="h-12 rounded-xl bg-background border-none shadow-inner focus-visible:ring-primary"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button 
            disabled={isSending || !newMessage.trim()}
            className="h-12 w-12 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
