'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Pencil, Loader2 } from 'lucide-react';
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
    <div className="group space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold text-muted-foreground uppercase tracking-tight">{label}</Label>
        {!isEditing && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {type === 'input' ? (
            <Input 
              value={currentValue} 
              onChange={(e) => setCurrentValue(e.target.value)}
              autoFocus
            />
          ) : (
            <Textarea 
              value={currentValue} 
              onChange={(e) => setCurrentValue(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {affectedAgents.map((agent) => (
                <Badge key={agent} variant="outline" className="text-[9px] py-0 border-amber-500/50 text-amber-600 bg-amber-50/50 dark:bg-amber-950/30">
                  Refreshes {agent}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="rounded-md border border-transparent p-2 hover:border-border hover:bg-muted/30 cursor-pointer transition-colors"
          onClick={() => setIsEditing(true)}
        >
          <p className={cn("text-sm whitespace-pre-wrap", !value && "text-muted-foreground italic")}>
            {value || 'Not provided'}
          </p>
        </div>
      )}
    </div>
  );
}
