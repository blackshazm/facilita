'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Menu, User, LayoutDashboard, Bell, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [hasNotification, setHasNotification] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    // Realtime notifications for messages
    const channel = supabase
      .channel('header-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          setHasNotification(true)
          // Reset after 5 seconds
          setTimeout(() => setHasNotification(false), 5000)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tighter text-foreground uppercase">
            FACILITA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#como-funciona" className="transition-colors hover:text-primary">
            Como funciona
          </Link>
          <Link href="#servicos" className="transition-colors hover:text-primary">
            Serviços
          </Link>
          <Link href="/profissionais" className="transition-colors hover:text-primary">
            Profissionais
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user && (
            <div className="relative mr-2">
              <Bell className="h-5 w-5 text-muted-foreground animate-in duration-300" />
              {hasNotification && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2 font-bold text-primary">
                  <LayoutDashboard className="h-4 w-4" />
                  Meu Painel
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={async () => {
                  await supabase.auth.signOut()
                  window.location.href = '/'
                }}
                className="hidden md:flex gap-2 font-bold text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                <User className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          )}
          <Link href="/solicitar">
            <Button size="sm" className="rounded-full px-6 bg-primary hover:bg-primary/90 font-semibold shadow-lg shadow-primary/10 text-white">
              Solicitar Agora
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}
