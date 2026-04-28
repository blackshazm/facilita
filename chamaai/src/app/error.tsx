'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black mb-2">Algo deu errado!</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Não conseguimos carregar essa página no momento. Tente novamente ou volte para a página principal.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="font-bold rounded-xl px-8">
          Tentar Novamente
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'} className="font-bold rounded-xl border-dashed">
          Voltar ao Início
        </Button>
      </div>
    </div>
  )
}
