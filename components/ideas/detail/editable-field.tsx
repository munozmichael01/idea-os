'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, Loader2 } from 'lucide-react';
import { IdeaField } from '@/lib/types';
import { getAffectedAgents } from '@/lib/scoring';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  label: string;
  fieldName: IdeaField;
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: 'input' | 'textarea';
}

export function EditableField({ label, fieldName, value, onSave, type = 'input' }: EditableFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(value);
  const [isSaving, setIsSaving] = React.useState(false);
  
  const affectedAgents = getAffectedAgents([fieldName]);

  const handleSave = async () => {
    if (currentValue === value) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(currentValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  return (
    <div className="field group">
      <label className="field-label block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-2">
        {label}
      </label>

      {isEditing ? (
        <div className="space-y-3">
          {type === 'input' ? (
            <input 
              className="field-input w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[9px] px-3.5 py-2.5 text-[13.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-pri)] focus:ring-4 focus:ring-[rgba(198,255,61,0.08)] transition-all"
              value={currentValue} 
              onChange={(e) => setCurrentValue(e.target.value)}
              autoFocus
            />
          ) : (
            <textarea 
              className="field-textarea w-full bg-[var(--bg-elev)] border border-[var(--border-subtle)] rounded-[9px] px-3.5 py-2.5 text-[13.5px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-pri)] focus:ring-4 focus:ring-[rgba(198,255,61,0.08)] transition-all min-h-[100px] resize-none"
              value={currentValue} 
              onChange={(e) => setCurrentValue(e.target.value)}
              autoFocus
            />
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button size="sm" className="h-8 bg-[var(--accent-pri)] text-[var(--accent-pri-ink)] hover:bg-[var(--accent-pri-hover)]" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="relative rounded-[9px] border border-transparent p-2.5 hover:border-[var(--border-subtle)] hover:bg-[var(--bg-elev)] cursor-pointer transition-all -ml-2.5 w-[calc(100%_+_20px)]"
          onClick={() => setIsEditing(true)}
        >
          <p className={cn("text-[13.5px] leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap", !value && "text-[var(--text-muted)] italic")}>
            {value || 'Not provided'}
          </p>
          {affectedAgents.length > 0 && (
            <div className="field-affects flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[var(--orange)] mt-2 opacity-80">
              <Sparkles className="h-2.5 w-2.5" />
              <span>Actualiza: {affectedAgents.join(' · ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
