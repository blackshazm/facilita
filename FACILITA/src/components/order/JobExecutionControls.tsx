'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Loader2, 
  MapPin, 
  CheckCircle, 
  Play, 
  Camera, 
  AlertCircle 
} from 'lucide-react'
import { ChecklistModal } from '@/components/order/ChecklistModal'

interface JobExecutionControlsProps {
  orderId: string
  currentStatus: string
}

export function JobExecutionControls({ orderId, currentStatus }: JobExecutionControlsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const updateStatus = async (status: string, notes?: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/jobs/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, notes }),
      })
      const result = await res.json()
      
      if (result.success) {
        router.refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      alert('Erro ao atualizar status: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStatus === 'accepted') {
    return (
      <div className="space-y-4 pt-6">
        <Button 
          onClick={() => updateStatus('on_site')}
          disabled={isLoading}
          className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20"
        >
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <span className="flex items-center gap-2"><MapPin className="h-6 w-6" /> Cheguei no Local</span>
          )}
        </Button>
      </div>
    )
  }

  if (currentStatus === 'on_site') {
    return (
      <div className="space-y-4 pt-6">
        <Button 
          onClick={() => updateStatus('in_progress')}
          disabled={isLoading}
          className="w-full h-16 rounded-2xl bg-green-600 text-white font-black text-lg shadow-xl shadow-green-600/20"
        >
          {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <span className="flex items-center gap-2"><Play className="h-6 w-6 fill-current" /> Iniciar Trabalho</span>
          )}
        </Button>
      </div>
    )
  }

  if (currentStatus === 'in_progress') {
    return (
      <div className="space-y-4 pt-6">
        <div className="p-4 rounded-xl bg-muted/20 border-2 border-dashed border-muted flex items-center justify-center gap-2 text-muted-foreground text-sm mb-4">
           <Camera className="h-4 w-4" /> Checklist Obrigatório Pendente
        </div>
        <ChecklistModal orderId={orderId} />
      </div>
    )
  }

  if (currentStatus === 'completed_provider') {
    return (
      <div className="pt-6 text-center space-y-2">
        <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto">
            <CheckCircle className="h-6 w-6" />
        </div>
        <p className="font-bold text-green-700">Trabalho concluído!</p>
        <p className="text-xs text-muted-foreground">Aguardando confirmação do cliente.</p>
      </div>
    )
  }

  return (
    <div className="pt-6 flex flex-col items-center gap-2 opacity-50">
        <AlertCircle className="h-6 w-6" />
        <p className="text-xs font-medium">Status: {currentStatus}</p>
    </div>
  )
}
