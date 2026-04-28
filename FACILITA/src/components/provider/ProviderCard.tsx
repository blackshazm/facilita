import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Briefcase, ChevronRight } from 'lucide-react'
import { VerifiedBadge } from './VerifiedBadge'
import { TierBadge } from './TierBadge'

interface ProviderCardProps {
  provider: any
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const profile = provider.profiles || provider.profile || {}
  const rating = provider.rating_avg || 0
  const totalStats = provider.total_services || 0

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-none bg-background/50 backdrop-blur-sm group">
      <CardContent className="p-0">
        <div className="relative h-48 w-full">
          <Image 
            src={profile.avatar_url || `https://i.pravatar.cc/300?u=${provider.id}`} 
            alt={profile.full_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            <TierBadge tier={provider.tier} />
            {provider.verification_status === 'approved' && <VerifiedBadge />}
          </div>
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-2 text-white">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-bold text-lg">{rating.toFixed(1)}</span>
              <span className="text-white/60 text-xs translate-y-0.5">({provider.rating_count || 0} avaliações)</span>
            </div>
          </div>
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{profile.full_name}</h3>
            <div className="flex items-center gap-1 text-muted-foreground mt-1 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              <span>SP e região metropolitana</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {provider.bio || "Especialista em instalações elétricas residenciais e industriais com foco em segurança."}
          </p>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Experiência</span>
              <span className="text-sm font-bold">{provider.experience_years || 0} anos</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Serviços</span>
              <span className="text-sm font-bold">+{totalStats} realizados</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Link href={`/profissionais/${provider.id}`} className="w-full">
          <Button className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-bold group">
            Ver Perfil Completo
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
