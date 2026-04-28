'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Star, Loader2, CheckCircle, Zap } from 'lucide-react'

interface StarInputProps {
  value: number
  onChange: (v: number) => void
  label: string
}

function StarInput({ value, onChange, label }: StarInputProps) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-125 focus:outline-none"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= (hovered || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ReviewPage({ params }: { params: Promise<{ orderId: string }> }) {
  const router = useRouter()
  const supabase = createClient()
  const { orderId } = React.use(params)

  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [ratings, setRatings] = useState({
    overall: 0,
    punctuality: 0,
    quality: 0,
    courtesy: 0,
    cleanliness: 0,
  })
  const [comment, setComment] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, service_categories(name, icon)`)
        .eq('id', orderId)
        .single()
      if (!error) setOrder(data)
      setIsLoading(false)
    }
    fetchOrder()
  }, [orderId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (ratings.overall === 0) {
      alert('Por favor, dê pelo menos a avaliação geral.')
      return
    }
    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('reviews').insert({
      order_id: orderId,
      reviewer_id: user?.id,
      reviewed_id: order?.provider_id,
      rating_overall: ratings.overall,
      rating_punctuality: ratings.punctuality || null,
      rating_quality: ratings.quality || null,
      rating_courtesy: ratings.courtesy || null,
      rating_cleanliness: ratings.cleanliness || null,
      comment: comment.trim() || null,
      would_recommend: wouldRecommend ?? true,
      service_completed: true,
    })

    if (error) {
      alert('Erro ao enviar avaliação: ' + error.message)
      setIsSubmitting(false)
      return
    }

    setSubmitted(true)
    setTimeout(() => router.push('/dashboard'), 3000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-muted/10 p-8 text-center">
        <div className="h-24 w-24 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-500">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black">Obrigado pela Avaliação!</h1>
          <p className="text-muted-foreground">Sua opinião ajuda toda a comunidade FACILITA.</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-none text-sm font-bold px-4 py-2">
          Redirecionando para o painel...
        </Badge>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full space-y-8">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-yellow-400/30">
              <Star className="h-8 w-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Como foi o serviço?</h1>
            {order && (
              <p className="text-muted-foreground">
                {order.service_categories?.icon} {order.service_categories?.name} • {order.neighborhood}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-2xl">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg">Avalie o Profissional</CardTitle>
                <CardDescription>Suas respostas são confidenciais e ajudam a melhorar o serviço.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-1">
                <StarInput label="⭐ Satisfação Geral" value={ratings.overall} onChange={(v) => setRatings(r => ({ ...r, overall: v }))} />
                <StarInput label="🕐 Pontualidade" value={ratings.punctuality} onChange={(v) => setRatings(r => ({ ...r, punctuality: v }))} />
                <StarInput label="🔧 Qualidade do Serviço" value={ratings.quality} onChange={(v) => setRatings(r => ({ ...r, quality: v }))} />
                <StarInput label="😊 Cordialidade" value={ratings.courtesy} onChange={(v) => setRatings(r => ({ ...r, courtesy: v }))} />
                <StarInput label="🧹 Organização / Limpeza" value={ratings.cleanliness} onChange={(v) => setRatings(r => ({ ...r, cleanliness: v }))} />
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardContent className="p-6 space-y-4">
                <label className="text-sm font-bold">Deixe um comentário (opcional)</label>
                <Textarea
                  placeholder="Conte como foi sua experiência com o profissional..."
                  className="min-h-[120px] rounded-xl border-2 focus-visible:ring-primary"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardContent className="p-6 space-y-4">
                <p className="text-sm font-bold">Você recomendaria este profissional?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setWouldRecommend(true)}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                      wouldRecommend === true
                        ? 'border-green-500 bg-green-500/10 text-green-700'
                        : 'border-muted hover:border-green-300'
                    }`}
                  >
                    👍 Sim, com certeza!
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldRecommend(false)}
                    className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                      wouldRecommend === false
                        ? 'border-red-500 bg-red-500/10 text-red-700'
                        : 'border-muted hover:border-red-300'
                    }`}
                  >
                    👎 Não recomendo
                  </button>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isSubmitting || ratings.overall === 0}
              className="w-full h-16 rounded-2xl bg-primary text-white text-lg font-black shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-shadow"
            >
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <span className="flex items-center gap-2"><Zap className="h-5 w-5 fill-white" /> Enviar Avaliação</span>
              )}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
