import { getIdea } from '@/lib/actions/ideas'
import { PitchDeckView } from '@/components/ideas/pitch-deck-view'
import { notFound } from 'next/navigation'
import { PitchDeck } from '@/lib/types'

interface ExportPageProps {
  params: Promise<{ id: string }>
}

export default async function ExportPage({ params }: ExportPageProps) {
  const { id } = await params
  
  try {
    const idea = await getIdea(id)
    
    if (!idea.pitchDeck) {
      notFound()
    }

    return (
      <div className="export-pitch-viewer">
        <PitchDeckView 
          deck={idea.pitchDeck as unknown as PitchDeck} 
          ideaId={id} 
          isExport={true}
        />
        {/* Signal for Puppeteer */}
        <div data-export-ready="true" style={{ display: 'none' }}></div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching idea for export:', error)
    notFound()
  }
}
