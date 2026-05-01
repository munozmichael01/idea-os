'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Question {
  id: string;
  text: string;
}

interface ContextQuestionsFormProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => Promise<void>;
  onSkip: () => Promise<void>;
}

export function ContextQuestionsForm({ questions, onSubmit, onSkip }: ContextQuestionsFormProps) {
  const t = useTranslations('Ideas');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(answers);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      await onSkip();
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{t('contextQuestionsTitle')}</CardTitle>
          <CardDescription>
            {t('contextQuestionsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.id}>{question.text}</Label>
              <Input
                id={question.id}
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                placeholder="Escribe tu respuesta..."
              />
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isSubmitting || isSkipping}
          >
            {isSkipping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('skipAndAnalyze')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSkipping || Object.keys(answers).length === 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('answerAndAnalyze')}
            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
