import React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

export function VerifiedBadge() {
  return (
    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20 gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
      <CheckCircle2 className="h-3 w-3" />
      Verificado
    </Badge>
  )
}
