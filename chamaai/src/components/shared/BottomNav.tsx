'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ClipboardList, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Início', href: '/dashboard', icon: Home },
    { name: 'Busca', href: '/profissionais', icon: Search },
    { name: 'Pedidos', href: '/dashboard', icon: ClipboardList },
    { name: 'Perfil', href: '/dashboard', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-20 bg-background border-t border-white/5 md:hidden px-6 flex items-center justify-between pb-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        
        return (
          <Link 
            key={item.name} 
            href={item.href}
            className="flex flex-col items-center gap-1 group transition-all"
          >
            <div className={cn(
              "p-2 rounded-xl transition-all",
              isActive ? "text-primary bg-primary/10" : "text-foreground opacity-60 group-hover:opacity-100"
            )}>
              <Icon className="h-6 w-6" />
            </div>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              isActive ? "text-primary" : "text-foreground opacity-40 group-hover:opacity-60"
            )}>
              {item.name}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
