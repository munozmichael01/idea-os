'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ideaSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters' }),
  sector: z.string().optional(),
  targetMarket: z.string().optional(),
  businessModel: z.string().optional(),
  notes: z.string().optional(),
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

interface NewIdeaFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    sector?: string | undefined;
    targetMarket?: string | undefined;
    businessModel?: string | undefined;
    notes?: string | undefined;
  }) => Promise<void>;
}

export function NewIdeaForm({ onSubmit }: NewIdeaFormProps) {
  const t = useTranslations('Ideas');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activeTab, setActiveTab] = useState('free');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      title: '',
      description: '',
      sector: '',
      targetMarket: '',
      businessModel: '',
      notes: '',
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await handleTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleTranscribe = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch('/api/audio/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      const { transcript } = await response.json();
      setValue('description', transcript, { shouldValidate: true });
      setActiveTab('free');
      toast.success(t('audioSuccess'));
    } catch (err) {
      console.error('Transcription error:', err);
      toast.error('Error transcribing audio');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{t('newTitle')}</CardTitle>
          <CardDescription>
            Choose how you want to share your business idea.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="free">{t('freeMode')}</TabsTrigger>
              <TabsTrigger value="structured">{t('structuredMode')}</TabsTrigger>
              <TabsTrigger value="audio">{t('audioMode')}</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="title">{t('titleLabel')}</Label>
                <Input
                  id="title"
                  placeholder={t('titlePlaceholder')}
                  {...register('title')}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <TabsContent value="free" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">{t('descriptionLabel')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('descriptionPlaceholder')}
                    className={`min-h-[200px] ${errors.description ? 'border-destructive' : ''}`}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description.message}</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="structured" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sector">{t('sectorLabel')}</Label>
                    <Input id="sector" placeholder={t('sectorPlaceholder')} {...register('sector')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetMarket">{t('targetMarketLabel')}</Label>
                    <Input id="targetMarket" placeholder={t('targetMarketPlaceholder')} {...register('targetMarket')} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessModel">{t('businessModelLabel')}</Label>
                  <Input id="businessModel" placeholder={t('businessModelPlaceholder')} {...register('businessModel')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('descriptionLabel')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('descriptionPlaceholder')}
                    className={`min-h-[120px] ${errors.description ? 'border-destructive' : ''}`}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">{errors.description.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">{t('notesLabel')}</Label>
                  <Textarea id="notes" placeholder={t('notesPlaceholder')} {...register('notes')} />
                </div>
              </TabsContent>

              <TabsContent value="audio" className="space-y-8 py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    {isRecording && (
                      <span className="absolute -inset-1 flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    )}
                    <Button
                      type="button"
                      size="lg"
                      variant={isRecording ? 'destructive' : 'outline'}
                      className="relative h-20 w-20 rounded-full"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isTranscribing}
                    >
                      {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                    </Button>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium">
                      {isRecording ? t('audioStop') : t('audioStart')}
                    </p>
                    {isTranscribing && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('audioTranscribing')}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <div className="flex justify-end gap-3">
                <Button type="submit" disabled={isSubmitting || isRecording || isTranscribing}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('submitButton')}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
