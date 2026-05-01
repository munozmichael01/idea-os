import { getIdea } from '@/lib/actions/ideas';
import { IdeaDetailClient } from './idea-detail-client';
import { notFound } from 'next/navigation';

export default async function IdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const idea = await getIdea(id);
    return <IdeaDetailClient initialIdea={idea} />;
  } catch (error) {
    console.error('Error fetching idea:', error);
    notFound();
  }
}
