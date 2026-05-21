import { getIdea } from '@/lib/actions/ideas'
import { PitchDeckView } from '@/components/ideas/pitch-deck-view'
import { PitchDeckGenerator } from '@/components/ideas/pitch-deck-generator'
import { notFound } from 'next/navigation'
import { PitchDeck } from '@/lib/types'

interface PitchPageProps {
  params: Promise<{ id: string }>
}

export default async function PitchPage({ params }: PitchPageProps) {
  const { id } = await params
  
  try {
    const idea = await getIdea(id)
    
    if (!idea.pitchDeck) {
      return <PitchDeckGenerator ideaId={id} ideaTitle={idea.title} />
    }

    return <PitchDeckView deck={idea.pitchDeck as unknown as PitchDeck} ideaId={id} />
  } catch (error) {
    console.error('Error fetching idea for pitch deck:', error)
    notFound()
  }
}
