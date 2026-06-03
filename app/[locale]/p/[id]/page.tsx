import { getIdea } from '@/lib/actions/ideas'
import { PitchDeckView } from '@/components/ideas/pitch-deck-view'
import { notFound } from 'next/navigation'
import { PitchDeck } from '@/lib/types'

interface PublicPitchPageProps {
  params: Promise<{ id: string }>
}

export default async function PublicPitchPage({ params }: PublicPitchPageProps) {
  const { id } = await params
  
  try {
    const idea = await getIdea(id)
    
    if (!idea.pitchDeck) {
      notFound()
    }

    return (
      <div className="public-pitch-viewer">
        <PitchDeckView 
          deck={idea.pitchDeck as unknown as PitchDeck} 
          ideaId={id} 
          isPublic={true}
        />
      </div>
    )
  } catch (error) {
    console.error('Error fetching idea for public pitch deck:', error)
    notFound()
  }
}
