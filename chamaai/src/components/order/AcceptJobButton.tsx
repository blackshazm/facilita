'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Zap } from 'lucide-react'

interface AcceptJobButtonProps {
  orderId: string
}

export function AcceptJobButton({ orderId }: AcceptJobButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/jobs/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const result = await res.json()
      
      if (result.success) {
        alert('Serviço aceito com sucesso!')
        router.refresh()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      alert('Erro ao aceitar job: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleAccept}
      disabled={isLoading}
      className="w-full h-14 rounded-2xl bg-primary text-white text-lg font-black shadow-xl hover:bg-primary/90 active:scale-95 transition-all"
    >
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        <>
          <Zap className="mr-2 h-6 w-6 fill-white" />
          Aceitar Serviço
        </>
      )}
    </Button>
  )
}
