'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, Camera, CheckSquare, ListChecks, X } from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'

interface ChecklistModalProps {
  orderId: string
}

export function ChecklistModal({ orderId }: ChecklistModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  
  // Checklist state
  const [envClean, setEnvClean] = useState(false)
  const [tested, setTested] = useState(false)
  const [notes, setNotes] = useState('')
  
  // Photos state
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null)
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null)
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null)
  const [afterUrl, setAfterUrl] = useState<string | null>(null)

  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)

  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (type === 'before') {
      setBeforePhoto(file)
      setBeforeUrl(URL.createObjectURL(file))
    } else {
      setAfterPhoto(file)
      setAfterUrl(URL.createObjectURL(file))
    }
  }

  const uploadPhoto = async (file: File, type: 'before' | 'after') => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${orderId}/${type}_${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('order-evidence')
      .upload(fileName, file)

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('order-evidence')
      .getPublicUrl(data.path)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!envClean || !tested) {
      alert("Por favor, confirme todos os itens obrigatórios do checklist.")
      return
    }

    if (!beforePhoto || !afterPhoto) {
      alert("Por favor, envie as fotos de antes e depois.")
      return
    }

    setIsLoading(true)
    
    try {
      // 1. Upload photos first
      const bUrl = await uploadPhoto(beforePhoto, 'before')
      const aUrl = await uploadPhoto(afterPhoto, 'after')

      // 2. Send checklist and complete job
      const res = await fetch('/api/jobs/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          beforePhotos: [bUrl],
          afterPhotos: [aUrl],
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
      console.error(error)
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
            
            <input 
              type="file" 
              accept="image/*" 
              ref={beforeInputRef} 
              onChange={(e) => handleFileChange(e, 'before')} 
              className="hidden" 
            />
            <input 
              type="file" 
              accept="image/*" 
              ref={afterInputRef} 
              onChange={(e) => handleFileChange(e, 'after')} 
              className="hidden" 
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => beforeInputRef.current?.click()}
                  className={`h-24 rounded-2xl border-2 border-dashed flex-col gap-2 relative overflow-hidden ${beforeUrl ? 'border-green-500' : ''}`}
                >
                  {beforeUrl ? (
                    <img src={beforeUrl} alt="Antes" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  ) : (
                    <Camera className="h-6 w-6 text-muted-foreground" />
                  )}
                  <span className="text-xs font-medium z-10">{beforeUrl ? 'Alterar Antes' : 'Foto Antes'}</span>
                  {beforeUrl && (
                    <div className="absolute top-1 right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center z-20">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => afterInputRef.current?.click()}
                  className={`h-24 rounded-2xl border-2 border-dashed flex-col gap-2 relative overflow-hidden ${afterUrl ? 'border-green-500' : 'border-primary'}`}
                >
                  {afterUrl ? (
                    <img src={afterUrl} alt="Depois" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  ) : (
                    <Camera className="h-6 w-6 text-primary" />
                  )}
                  <span className={`text-xs font-bold z-10 ${afterUrl ? 'text-foreground' : 'text-primary'}`}>
                    {afterUrl ? 'Alterar Depois' : 'Foto Depois*'}
                  </span>
                  {afterUrl && (
                    <div className="absolute top-1 right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center z-20">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">O envio das fotos antes e depois é obrigatório para proteção contra fraudes.</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-dashed">
            <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Verificações Obrigatórias</h4>
            
            <div className="flex items-center space-x-3 bg-muted/30 p-4 rounded-2xl">
              <Checkbox id="envClean" checked={envClean} onCheckedChange={(c) => setEnvClean(c as boolean)} />
              <label htmlFor="envClean" className="text-sm font-medium leading-none cursor-pointer">
                O ambiente foi limpo e organizado após o serviço?
              </label>
            </div>

            <div className="flex items-center space-x-3 bg-muted/30 p-4 rounded-2xl">
              <Checkbox id="tested" checked={tested} onCheckedChange={(c) => setTested(c as boolean)} />
              <label htmlFor="tested" className="text-sm font-medium leading-none cursor-pointer">
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
            disabled={isLoading || !envClean || !tested || !beforePhoto || !afterPhoto}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Finalizar Serviço'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
  )
}
