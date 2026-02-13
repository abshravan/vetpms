import { useState } from 'react';
import { Grid, TextField, Button, Alert, MenuItem, Box } from '@mui/material';
import { CreateClinicalNoteData, NoteType, NOTE_TYPE_OPTIONS, SOAPContent } from '../../types';

interface SOAPNoteFormProps {
  onSubmit: (data: CreateClinicalNoteData) => Promise<void>;
  disabled?: boolean;
}

export default function SOAPNoteForm({ onSubmit, disabled }: SOAPNoteFormProps) {
  const [noteType, setNoteType] = useState<NoteType>('soap');
  const [content, setContent] = useState<SOAPContent>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleField = (field: keyof SOAPContent) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent((c) => ({ ...c, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasContent = noteType === 'soap'
      ? content.subjective || content.objective || content.assessment || content.plan
      : content.text;

    if (!hasContent) {
      setError('Please fill in at least one field');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ noteType, content });
      setContent({});
    } catch {
      setError('Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Note Type"
          value={noteType}
          onChange={(e) => setNoteType(e.target.value as NoteType)}
          select
          sx={{ minWidth: 180 }}
          disabled={disabled}
        >
          {NOTE_TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
      </Box>

      {noteType === 'soap' ? (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="S — Subjective"
              value={content.subjective || ''}
              onChange={handleField('subjective')}
              fullWidth
              multiline
              rows={4}
              disabled={disabled}
              placeholder="Owner's description of symptoms, history, behavior changes..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="O — Objective"
              value={content.objective || ''}
              onChange={handleField('objective')}
              fullWidth
              multiline
              rows={4}
              disabled={disabled}
              placeholder="Physical exam findings, vitals, test results..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="A — Assessment"
              value={content.assessment || ''}
              onChange={handleField('assessment')}
              fullWidth
              multiline
              rows={4}
              disabled={disabled}
              placeholder="Diagnosis, differential diagnoses, prognosis..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="P — Plan"
              value={content.plan || ''}
              onChange={handleField('plan')}
              fullWidth
              multiline
              rows={4}
              disabled={disabled}
              placeholder="Treatment plan, medications, follow-up, client instructions..."
            />
          </Grid>
        </Grid>
      ) : (
        <TextField
          label="Note"
          value={content.text || ''}
          onChange={handleField('text')}
          fullWidth
          multiline
          rows={8}
          disabled={disabled}
        />
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={submitting || disabled}>
          {submitting ? 'Saving...' : 'Save Note'}
        </Button>
      </Box>
    </form>
  );
}
