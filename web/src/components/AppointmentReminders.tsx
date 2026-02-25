'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Send, Check, Clock, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils';

interface Reminder {
  id: string;
  type: 'email' | 'sms';
  sentAt: string | null;
  status: 'pending' | 'sent' | 'failed';
  scheduledFor: string;
}

interface AppointmentRemindersProps {
  appointmentId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  appointmentDate: string;
}

export default function AppointmentReminders({
  clientName,
  clientEmail,
  clientPhone,
  appointmentDate,
}: AppointmentRemindersProps) {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      type: 'email',
      sentAt: null,
      status: 'pending',
      scheduledFor: new Date(new Date(appointmentDate).getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'sms',
      sentAt: null,
      status: 'pending',
      scheduledFor: new Date(new Date(appointmentDate).getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ]);
  const [sending, setSending] = useState<string | null>(null);

  const handleSend = async (id: string, type: 'email' | 'sms') => {
    setSending(id);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1200));
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: 'sent' as const, sentAt: new Date().toISOString() } : r,
      ),
    );
    setSending(null);
    toast.success(`${type === 'email' ? 'Email' : 'SMS'} reminder sent to ${clientName}`);
  };

  const handleSendBoth = async () => {
    for (const r of reminders.filter((r) => r.status !== 'sent')) {
      await handleSend(r.id, r.type);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Appointment Reminders</h3>
            <p className="text-[11px] text-muted-foreground">Send reminders to {clientName}</p>
          </div>
        </div>
        <button
          onClick={handleSendBoth}
          disabled={reminders.every((r) => r.status === 'sent')}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary/90 px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:opacity-50"
        >
          <Send className="h-3 w-3" />
          Send All
        </button>
      </div>

      <div className="divide-y divide-border/50">
        {reminders.map((reminder) => {
          const isEmail = reminder.type === 'email';
          const isSent = reminder.status === 'sent';
          const isSending = sending === reminder.id;

          return (
            <div key={reminder.id} className="flex items-center gap-4 px-5 py-3.5">
              {/* Icon */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  isSent
                    ? 'bg-emerald-50 dark:bg-emerald-950/30'
                    : 'bg-muted/50',
                )}
              >
                {isEmail ? (
                  <Mail className={cn('h-4 w-4', isSent ? 'text-emerald-500' : 'text-muted-foreground')} />
                ) : (
                  <Phone className={cn('h-4 w-4', isSent ? 'text-emerald-500' : 'text-muted-foreground')} />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {isEmail ? 'Email Reminder' : 'SMS Reminder'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isEmail ? (clientEmail || 'No email on file') : (clientPhone || 'No phone on file')}
                  {' · '}
                  <Clock className="inline h-3 w-3" />{' '}
                  {new Date(reminder.scheduledFor).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Status / Action */}
              {isSent ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1.5 text-emerald-600"
                >
                  <Check className="h-4 w-4" />
                  <span className="text-xs font-semibold">Sent</span>
                </motion.div>
              ) : (
                <button
                  onClick={() => handleSend(reminder.id, reminder.type)}
                  disabled={isSending || (!clientEmail && isEmail) || (!clientPhone && !isEmail)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground hover:shadow-sm disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      Send Now
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="border-t border-border/50 px-5 py-3">
        <p className="text-[10px] text-muted-foreground/60">
          Reminders are automatically scheduled 24h (email) and 2h (SMS) before the appointment. Demo mode — no actual messages are sent.
        </p>
      </div>
    </div>
  );
}
