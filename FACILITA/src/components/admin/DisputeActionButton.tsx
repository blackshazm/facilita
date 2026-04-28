'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export function DisputeActionButton({ disputeId, orderId, frozenAmount }: { disputeId: string, orderId: string, frozenAmount: number }) {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle')
  const router = useRouter()

  const resolve = async (resolution: 'release_funds' | 'refund_client') => {
    setStatus('loading')
    try {
      const res = await fetch('/api/admin/disputes/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId, orderId, resolution, amount: frozenAmount }),
      })
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao resolver disputa.')
      }
      
      router.refresh()
    } catch (error: any) {
      alert('Erro: ' + error.message)
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={status === 'loading'}
        className="rounded-xl h-9 bg-green-600 hover:bg-green-700 text-white font-bold gap-1"
        onClick={() => resolve('release_funds')}
      >
        {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
        A favor do Profissional (Liberar)
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={status === 'loading'}
        className="rounded-xl h-9 border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold gap-1"
        onClick={() => resolve('refund_client')}
      >
        <XCircle className="h-4 w-4" /> A favor do Cliente (Reembolso)
      </Button>
    </div>
  )
}
