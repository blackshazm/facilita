'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, Camera, CheckSquare, ListChecks } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from "@/components/ui/checkbox"

interface ChecklistModalProps {
  orderId: string
}

export function ChecklistModal({ orderId }: ChecklistModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Checklist state
  const [envClean, setEnvClean] = useState(false)
  const [tested, setTested] = useState(false)
  const [notes, setNotes] = useState('')

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!envClean || !tested) {
      alert("Por favor, confirme todos os itens obrigatórios do checklist.")
      return
    }

    setIsLoading(true)
    
    try {
      // Send checklist and complete job
      const res = await fetch('/api/jobs/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          beforePhotos: ['mock_url_1'], // Na vida real, upload via Supabase Storage
          afterPhotos: ['mock_url_2'],
          environmentClean: envClean,
          testedWithClient: tested,
          notes 
        }),
      })
      const data = await res.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao enviar checklist.')
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
        <Button 
          className="w-full h-16 rounded-2xl bg-black text-white font-black text-lg shadow-xl hover:bg-black/80 transition-all"
        >
          <ListChecks className="mr-2 h-6 w-6" /> Preencher Checklist e Finalizar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" /> Checklist Operacional
          </DialogTitle>
          <DialogDescription>
            Para garantir a qualidade e se proteger de disputas, preencha os dados de conclusão do serviço.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Evidências Fotográficas</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" className="h-24 rounded-2xl border-2 border-dashed flex-col gap-2 relative">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs font-medium">Foto Antes</span>
                  <div className="absolute top-2 right-2 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <Button type="button" variant="outline" className="h-24 rounded-2xl border-2 border-dashed flex-col gap-2 relative">
                  <Camera className="h-6 w-6 text-primary" />
                  <span className="text-xs font-bold text-primary">Foto Depois*</span>
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">O envio das fotos antes e depois é obrigatório.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-dashed">
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Verificações Obrigatórias</h4>
            
            <div className="flex items-center space-x-3 bg-muted/30 p-4 rounded-2xl">
              <Checkbox id="envClean" checked={envClean} onCheckedChange={(c) => setEnvClean(c as boolean)} />
              <label htmlFor="envClean" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                O ambiente foi limpo e organizado após o serviço?
              </label>
            </div>

            <div className="flex items-center space-x-3 bg-muted/30 p-4 rounded-2xl">
              <Checkbox id="tested" checked={tested} onCheckedChange={(c) => setTested(c as boolean)} />
              <label htmlFor="tested" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                O serviço foi testado na frente do cliente?
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-dashed">
            <label className="text-sm font-bold">Observações de Conclusão</label>
            <Textarea 
              placeholder="Descreva algum detalhe técnico ou se houve uso de material excedente..."
              className="rounded-xl min-h-[80px] resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !envClean || !tested}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Finalizar Serviço'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
