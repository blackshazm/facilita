'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ApproveProviderButtonProps {
  providerId: string
}

export function ApproveProviderButton({ providerId }: ApproveProviderButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'approved' | 'rejected'>('idle')
  const router = useRouter()
  const supabase = createClient()

  const updateStatus = async (newStatus: 'approved' | 'rejected') => {
    setStatus('loading')
    const { error } = await supabase
      .from('providers')
      .update({ 
        verification_status: newStatus,
        tier: newStatus === 'approved' ? 'verified' : 'new'
      })
      .eq('id', providerId)

    if (error) {
      alert('Erro: ' + error.message)
      setStatus('idle')
      return
    }

    setStatus(newStatus)
    setTimeout(() => router.refresh(), 1500)
  }

  if (status === 'loading') {
    return <Button disabled className="rounded-xl h-9"><Loader2 className="h-4 w-4 animate-spin" /></Button>
  }
  if (status === 'approved') {
    return <Button disabled className="rounded-xl h-9 bg-green-600">✓ Aprovado</Button>
  }
  if (status === 'rejected') {
    return <Button disabled variant="destructive" className="rounded-xl h-9">✗ Rejeitado</Button>
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className="rounded-xl h-9 bg-green-600 hover:bg-green-700 text-white font-bold gap-1"
        onClick={() => updateStatus('approved')}
      >
        <Check className="h-4 w-4" /> Aprovar
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-xl h-9 border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold gap-1"
        onClick={() => updateStatus('rejected')}
      >
        <X className="h-4 w-4" /> Rejeitar
      </Button>
    </div>
  )
}
