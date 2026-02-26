'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Mail,
  Phone,
  Bell,
  Send,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  PawPrint,
  ChevronRight,
  Calendar,
  Sparkles,
  Inbox,
  MailOpen,
  MessageCircle,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

// ── Types & Mock Data ──

interface Message {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  patientName: string;
  species: string;
  channel: 'email' | 'sms' | 'in_app';
  direction: 'inbound' | 'outbound';
  subject: string;
  body: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  createdAt: string;
  isRead: boolean;
}

interface ReminderTemplate {
  id: string;
  name: string;
  type: 'appointment' | 'vaccination' | 'follow_up' | 'invoice' | 'wellness';
  channel: 'email' | 'sms' | 'both';
  timing: string;
  template: string;
  isActive: boolean;
}

const now = new Date();
const msgTime = (h: number, m: number) => {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const daysAgoMsg = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const MOCK_MESSAGES: Message[] = [
  { id: 'msg-1', clientName: 'Michael Johnson', clientEmail: 'mjohnson@email.com', clientPhone: '(555) 123-4567', patientName: 'Max', species: 'dog', channel: 'email', direction: 'inbound', subject: 'Question about Max\'s medication', body: 'Hi, I wanted to ask about the dosage for Max\'s anti-inflammatory. He seems to be doing better but I want to make sure I\'m giving the right amount. Should I continue the full dose or can we start tapering?', status: 'read', createdAt: msgTime(9, 15), isRead: true },
  { id: 'msg-2', clientName: 'Michael Johnson', clientEmail: 'mjohnson@email.com', clientPhone: '(555) 123-4567', patientName: 'Max', species: 'dog', channel: 'email', direction: 'outbound', subject: 'Re: Question about Max\'s medication', body: 'Hi Michael, continue the current dose of Carprofen (75mg) twice daily with food for 3 more days, then we can reduce to once daily. If he shows any GI signs, contact us. - Dr. Carter', status: 'delivered', createdAt: msgTime(10, 30), isRead: true },
  { id: 'msg-3', clientName: 'Amanda Williams', clientEmail: 'awilliams@email.com', clientPhone: '(555) 234-5678', patientName: 'Bella', species: 'dog', channel: 'sms', direction: 'inbound', subject: 'Appointment request', body: 'Hi, Bella has been scratching a lot lately and I noticed some hair loss on her belly. Can we get an appointment this week?', status: 'read', createdAt: msgTime(8, 45), isRead: true },
  { id: 'msg-4', clientName: 'Karen Thomas', clientEmail: 'kthomas@email.com', clientPhone: '(555) 901-2345', patientName: 'Cleo', species: 'cat', channel: 'in_app', direction: 'inbound', subject: 'Cleo\'s blood work results', body: 'When will Cleo\'s blood work results be available? We had the test done on Monday.', status: 'delivered', createdAt: daysAgoMsg(1), isRead: false },
  { id: 'msg-5', clientName: 'Sarah Anderson', clientEmail: 'sanderson@email.com', clientPhone: '(555) 789-0123', patientName: 'Cooper', species: 'dog', channel: 'email', direction: 'outbound', subject: 'Appointment Reminder: Cooper - Tomorrow at 2:00 PM', body: 'Dear Sarah, this is a reminder that Cooper has an appointment tomorrow at 2:00 PM with Dr. Carter for a vaccination update. Please arrive 10 minutes early. Reply to confirm or call (555) 200-3000 to reschedule.', status: 'sent', createdAt: daysAgoMsg(0), isRead: true },
  { id: 'msg-6', clientName: 'Robert Garcia', clientEmail: 'rgarcia@email.com', clientPhone: '(555) 456-7890', patientName: 'Rocky', species: 'dog', channel: 'sms', direction: 'outbound', subject: 'Vaccination Reminder', body: 'Hi Robert, Rocky is due for his DHPP booster. Please call (555) 200-3000 or reply to schedule. - Springfield Vet Clinic', status: 'delivered', createdAt: daysAgoMsg(2), isRead: true },
  { id: 'msg-7', clientName: 'David Martinez', clientEmail: 'dmartinez@email.com', clientPhone: '(555) 567-8901', patientName: 'Noodle', species: 'reptile', channel: 'email', direction: 'inbound', subject: 'Noodle feeding concerns', body: 'Noodle hasn\'t eaten in about 3 weeks. I know ball pythons can go a while without eating but I\'m starting to worry. Is this normal or should I bring her in?', status: 'delivered', createdAt: daysAgoMsg(1), isRead: false },
];

const MOCK_TEMPLATES: ReminderTemplate[] = [
  { id: 'tmpl-1', name: 'Appointment Reminder (24hr)', type: 'appointment', channel: 'both', timing: '24 hours before', template: 'Hi {{clientName}}, this is a reminder that {{patientName}} has an appointment tomorrow at {{time}} with {{vetName}}. Reply to confirm.', isActive: true },
  { id: 'tmpl-2', name: 'Appointment Reminder (2hr)', type: 'appointment', channel: 'sms', timing: '2 hours before', template: 'Reminder: {{patientName}}\'s appointment is in 2 hours at {{time}}. See you soon! - Springfield Vet', isActive: true },
  { id: 'tmpl-3', name: 'Vaccination Due', type: 'vaccination', channel: 'both', timing: '7 days before due', template: 'Hi {{clientName}}, {{patientName}} is due for {{vaccineName}} vaccine. Call (555) 200-3000 to schedule.', isActive: true },
  { id: 'tmpl-4', name: 'Post-Visit Follow Up', type: 'follow_up', channel: 'email', timing: '48 hours after visit', template: 'Hi {{clientName}}, we hope {{patientName}} is doing well after the recent visit. If you have any concerns, please don\'t hesitate to reach out.', isActive: true },
  { id: 'tmpl-5', name: 'Invoice Payment Reminder', type: 'invoice', channel: 'email', timing: '7 days after due date', template: 'Hi {{clientName}}, we noticed invoice #{{invoiceNumber}} for ${{amount}} is past due. Please remit payment at your convenience.', isActive: false },
  { id: 'tmpl-6', name: 'Annual Wellness Reminder', type: 'wellness', channel: 'both', timing: '30 days before due', template: 'Hi {{clientName}}, {{patientName}} is due for an annual wellness exam. Regular checkups help keep your pet healthy! Call to schedule.', isActive: true },
];

// ── Styles ──

const CHANNEL_STYLES = {
  email: { icon: Mail, bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', label: 'Email' },
  sms: { icon: Phone, bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'SMS' },
  in_app: { icon: MessageCircle, bg: 'bg-purple-100 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', label: 'In-App' },
};

const STATUS_STYLES = {
  sent: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sent' },
  delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Delivered' },
  read: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Read' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
};

const TEMPLATE_TYPE_STYLES = {
  appointment: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', icon: Calendar },
  vaccination: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', icon: PawPrint },
  follow_up: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', icon: MessageSquare },
  invoice: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', icon: Mail },
  wellness: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', icon: Bell },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } } };

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'templates'>('inbox');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [templates] = useState(MOCK_TEMPLATES);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '', channel: 'email' as 'email' | 'sms' });

  const unreadCount = messages.filter((m) => !m.isRead && m.direction === 'inbound').length;

  const filteredMessages = messages.filter((m) => {
    if (activeTab === 'inbox' && m.direction !== 'inbound') return false;
    if (activeTab === 'sent' && m.direction !== 'outbound') return false;
    if (channelFilter && m.channel !== channelFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.clientName.toLowerCase().includes(q) || m.patientName.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
    }
    return true;
  });

  const handleMarkRead = (id: string) => {
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isRead: true } : m));
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    const newMsg: Message = {
      id: `msg-reply-${Date.now()}`,
      clientName: selectedMessage.clientName,
      clientEmail: selectedMessage.clientEmail,
      clientPhone: selectedMessage.clientPhone,
      patientName: selectedMessage.patientName,
      species: selectedMessage.species,
      channel: selectedMessage.channel,
      direction: 'outbound',
      subject: `Re: ${selectedMessage.subject}`,
      body: replyText,
      status: 'sent',
      createdAt: new Date().toISOString(),
      isRead: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setReplyText('');
    toast.success('Reply sent');
  };

  const handleComposeSend = () => {
    if (!composeData.to || !composeData.body) return;
    toast.success(`Message sent via ${composeData.channel}`);
    setComposeOpen(false);
    setComposeData({ to: '', subject: '', body: '', channel: 'email' });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Communications</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Client Messaging</h1>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Inbox className="h-3.5 w-3.5" /> {unreadCount} unread
            </span>
          )}
          <button
            onClick={() => setComposeOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" /> New Message
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Messages Today', value: messages.filter((m) => m.createdAt.startsWith(now.toISOString().slice(0, 10))).length, icon: MessageSquare, gradient: 'from-blue-500 to-blue-600', accent: 'text-blue-600 dark:text-blue-400' },
          { label: 'Unread', value: unreadCount, icon: MailOpen, gradient: 'from-amber-500 to-amber-600', accent: 'text-amber-600 dark:text-amber-400' },
          { label: 'Sent This Week', value: messages.filter((m) => m.direction === 'outbound').length, icon: Send, gradient: 'from-emerald-500 to-emerald-600', accent: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Auto-Reminders', value: templates.filter((t) => t.isActive).length, icon: Bell, gradient: 'from-purple-500 to-purple-600', accent: 'text-purple-600 dark:text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <div className={cn('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', stat.gradient)} />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            <p className={cn('mt-1 text-2xl font-bold tabular-nums', stat.accent)}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message List */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card lg:col-span-2">
          {/* Tabs + Search */}
          <div className="border-b border-border/50">
            <div className="flex items-center gap-1 px-5 pt-3">
              {[
                { key: 'inbox' as const, label: 'Inbox', icon: Inbox },
                { key: 'sent' as const, label: 'Sent', icon: Send },
                { key: 'templates' as const, label: 'Templates', icon: Sparkles },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSelectedMessage(null); }}
                  className={cn(
                    'flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-xs font-semibold transition-all',
                    activeTab === tab.key
                      ? 'border-b-2 border-primary bg-primary/5 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.key === 'inbox' && unreadCount > 0 && (
                    <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
            {activeTab !== 'templates' && (
              <div className="flex items-center gap-2 px-5 py-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages..."
                    className="h-9 w-full rounded-lg border border-border/40 bg-muted/20 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-1">
                  {['email', 'sms', 'in_app'].map((ch) => {
                    const style = CHANNEL_STYLES[ch as keyof typeof CHANNEL_STYLES];
                    return (
                      <button
                        key={ch}
                        onClick={() => setChannelFilter(channelFilter === ch ? null : ch)}
                        className={cn(
                          'rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-all',
                          channelFilter === ch ? cn(style.bg, style.text) : 'bg-muted text-muted-foreground hover:bg-muted/80',
                        )}
                      >
                        {style.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Message List / Templates */}
          {activeTab !== 'templates' ? (
            <div className="max-h-[500px] divide-y divide-border/30 overflow-y-auto">
              {filteredMessages.length > 0 ? filteredMessages.map((msg) => {
                const chStyle = CHANNEL_STYLES[msg.channel];
                const stStyle = STATUS_STYLES[msg.status];
                const ChannelIcon = chStyle.icon;
                return (
                  <div
                    key={msg.id}
                    onClick={() => { setSelectedMessage(msg); handleMarkRead(msg.id); }}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 px-5 py-3.5 transition-all hover:bg-muted/30',
                      selectedMessage?.id === msg.id && 'bg-primary/5',
                      !msg.isRead && 'bg-primary/[0.02]',
                    )}
                  >
                    {!msg.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    {msg.isRead && <span className="mt-2 h-2 w-2 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm', !msg.isRead ? 'font-bold' : 'font-medium')}>
                          {msg.clientName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">· {msg.patientName}</span>
                        <span className={cn('ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold', chStyle.bg, chStyle.text)}>
                          {chStyle.label}
                        </span>
                      </div>
                      <p className={cn('truncate text-xs', !msg.isRead ? 'font-semibold' : 'text-foreground')}>
                        {msg.subject}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{msg.body}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-bold', stStyle.bg, stStyle.text)}>
                          {stStyle.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Inbox className="mb-2 h-8 w-8 opacity-30" />
                  <p className="text-sm">No messages found</p>
                </div>
              )}
            </div>
          ) : (
            /* Templates */
            <div className="divide-y divide-border/30">
              {templates.map((tmpl) => {
                const typeStyle = TEMPLATE_TYPE_STYLES[tmpl.type];
                const TypeIcon = typeStyle.icon;
                return (
                  <div key={tmpl.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', typeStyle.bg)}>
                      <TypeIcon className={cn('h-4 w-4', typeStyle.text)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{tmpl.name}</span>
                        <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-bold capitalize', CHANNEL_STYLES[tmpl.channel === 'both' ? 'email' : tmpl.channel].bg, CHANNEL_STYLES[tmpl.channel === 'both' ? 'email' : tmpl.channel].text)}>
                          {tmpl.channel === 'both' ? 'Email + SMS' : tmpl.channel.toUpperCase()}
                        </span>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">{tmpl.template}</p>
                      <span className="text-[10px] text-muted-foreground">Triggers: {tmpl.timing}</span>
                    </div>
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold',
                      tmpl.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-muted text-muted-foreground',
                    )}>
                      {tmpl.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Detail / Compose */}
        <div className="space-y-4">
          {selectedMessage ? (
            <motion.div
              key={selectedMessage.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card"
            >
              <div className="border-b border-border/50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-bold text-primary">
                    {selectedMessage.clientName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedMessage.clientName}</p>
                    <p className="text-[10px] text-muted-foreground">{selectedMessage.clientEmail} · {selectedMessage.patientName}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm font-medium">{selectedMessage.subject}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedMessage.body}</p>
              </div>
              {selectedMessage.direction === 'inbound' && (
                <div className="border-t border-border/30 px-5 py-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="h-20 w-full resize-none rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40"
                  >
                    <Send className="h-3 w-3" /> Send Reply
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card py-16 text-muted-foreground shadow-card">
              <MailOpen className="mb-2 h-10 w-10 opacity-20" />
              <p className="text-sm">Select a message to view</p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Send Appointment Reminders', desc: 'Notify clients about tomorrow\'s appointments', icon: Calendar },
                { label: 'Vaccination Due Alerts', desc: 'Send reminders for upcoming vaccinations', icon: PawPrint },
                { label: 'Invoice Payment Reminders', desc: 'Follow up on overdue invoices', icon: Mail },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => toast.success(`${action.label} sent`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/40 p-3 text-left transition-all hover:bg-muted/30"
                >
                  <action.icon className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      <AnimatePresence>
        {composeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setComposeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-6 shadow-xl"
            >
              <h2 className="mb-4 text-lg font-semibold">New Message</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {(['email', 'sms'] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setComposeData((d) => ({ ...d, channel: ch }))}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                        composeData.channel === ch ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {ch.toUpperCase()}
                    </button>
                  ))}
                </div>
                <input
                  value={composeData.to}
                  onChange={(e) => setComposeData((d) => ({ ...d, to: e.target.value }))}
                  placeholder={composeData.channel === 'email' ? 'To (email address)' : 'To (phone number)'}
                  className="h-10 w-full rounded-lg border border-border/40 bg-muted/20 px-3 text-sm focus:border-primary focus:outline-none"
                />
                {composeData.channel === 'email' && (
                  <input
                    value={composeData.subject}
                    onChange={(e) => setComposeData((d) => ({ ...d, subject: e.target.value }))}
                    placeholder="Subject"
                    className="h-10 w-full rounded-lg border border-border/40 bg-muted/20 px-3 text-sm focus:border-primary focus:outline-none"
                  />
                )}
                <textarea
                  value={composeData.body}
                  onChange={(e) => setComposeData((d) => ({ ...d, body: e.target.value }))}
                  placeholder="Type your message..."
                  className="h-32 w-full resize-none rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setComposeOpen(false)} className="h-9 rounded-lg px-4 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
                  <button onClick={handleComposeSend} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                    <Send className="h-3.5 w-3.5" /> Send
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
