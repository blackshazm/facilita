import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Carregando...</p>
      </div>
    </div>
  )
}
