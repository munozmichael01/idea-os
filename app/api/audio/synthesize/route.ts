import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createServiceClient } from '@/lib/supabase/server';
import { getIdea } from '@/lib/actions/ideas';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AUDIO_BUCKET = 'idea-audio';

export async function POST(req: Request) {
  try {
    const { text, idea_id } = await req.json();

    if (!text || !idea_id) {
      return NextResponse.json({ error: 'Missing text or idea_id' }, { status: 400 });
    }

    // 1. Get idea to get workspaceId for the path
    const idea = await getIdea(idea_id);
    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // 2. Generate audio with OpenAI TTS
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    // 3. Upload to Supabase Storage
    const supabase = createServiceClient();
    
    // Ensure bucket exists
    const { error: bucketError } = await supabase.storage.createBucket(AUDIO_BUCKET, {
      public: false,
      allowedMimeTypes: ['audio/mpeg'],
    });

    // Ignore "already exists" error
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('Bucket error:', bucketError);
      return NextResponse.json({ error: 'Failed to ensure storage bucket' }, { status: 500 });
    }

    const timestamp = Date.now();
    const fileName = `${idea.workspaceId}/${idea_id}/${timestamp}.mp3`;

    const { error: uploadError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(fileName, buffer, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 });
    }

    // 4. Create signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(fileName, 3600);

    if (signedUrlError || !signedUrlData) {
      console.error('Signed URL error:', signedUrlError);
      return NextResponse.json({ error: 'Failed to create signed URL' }, { status: 500 });
    }

    return NextResponse.json({ audio_url: signedUrlData.signedUrl });
  } catch (error: unknown) {
    console.error('Synthesis error:', error);
    const message = error instanceof Error ? error.message : 'Error synthesizing audio';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
