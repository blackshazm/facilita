'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function DisputeClientButton({ orderId }: { orderId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          reasonCategory: reason,
          description 
        }),
      })
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao abrir disputa.')
      }
      
      setIsOpen(false)
      router.refresh()
    } catch (error: any) {
      alert('Erro: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 font-bold mt-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Tive um problema com o serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-6 w-6" /> Abrir Disputa
          </DialogTitle>
          <DialogDescription>
            O pagamento do profissional será bloqueado imediatamente até que nossa equipe resolva o caso.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Qual foi o problema?</label>
            <Select onValueChange={setReason} required>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Selecione o motivo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incomplete_service">Serviço Incompleto</SelectItem>
                <SelectItem value="damage">Danos ao Patrimônio</SelectItem>
                <SelectItem value="bad_behavior">Comportamento Inadequado</SelectItem>
                <SelectItem value="extreme_delay">Atraso Extremo / Não Compareceu</SelectItem>
                <SelectItem value="other">Outro Motivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">Descreva os detalhes</label>
            <Textarea 
              placeholder="Explique o que aconteceu. Nossa equipe de mediação lerá isso."
              className="rounded-xl min-h-[100px] resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !reason || !description}
            className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-lg shadow-xl shadow-red-500/20"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Confirmar e Bloquear Pagamento'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
