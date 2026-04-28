import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Star, Zap, Award } from 'lucide-react'

type ProfessionalTier = 'new' | 'verified' | 'top_rated'

interface TierBadgeProps {
  tier: ProfessionalTier | null | undefined
}

export function TierBadge({ tier }: TierBadgeProps) {
  if (tier === 'top_rated') {
    return (
      <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 gap-1 px-3 py-1 rounded-full text-[11px] font-bold shadow-lg shadow-yellow-500/20">
        <Star className="h-3.5 w-3.5 fill-current" />
        Top Rated
      </Badge>
    )
  }

  if (tier === 'verified') {
    return (
      <Badge className="bg-primary text-white hover:bg-primary/90 gap-1 px-3 py-1 rounded-full text-[11px] font-bold">
        <Award className="h-3.5 w-3.5" />
        Profissional Verificado
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="text-muted-foreground gap-1 px-3 py-1 rounded-full text-[11px] font-medium">
      <Zap className="h-3.5 w-3.5" />
      Novo Parceiro
    </Badge>
  )
}
