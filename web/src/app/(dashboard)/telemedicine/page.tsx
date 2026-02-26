'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MessageSquare,
  FileText,
  Users,
  Clock,
  Calendar,
  PawPrint,
  Stethoscope,
  ChevronRight,
  Plus,
  Settings,
  Maximize2,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import toast from 'react-hot-toast';

// ── Types ──

interface TeleconsultSession {
  id: string;
  clientName: string;
  patientName: string;
  species: string;
  breed: string;
  scheduledTime: string;
  duration: number; // minutes
  status: 'waiting' | 'in_progress' | 'completed' | 'no_show';
  reason: string;
  vetName: string;
  notes: string;
}

// ── Mock Data ──

const now = new Date();
const todayStr = now.toISOString().slice(0, 10);

const MOCK_SESSIONS: TeleconsultSession[] = [
  {
    id: 'tc-1',
    clientName: 'Michael Johnson',
    patientName: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    scheduledTime: `${todayStr}T09:00:00`,
    duration: 30,
    status: 'completed',
    reason: 'Post-surgery follow-up — incision check',
    vetName: 'Dr. Carter',
    notes: 'Incision healing well. Continue antibiotics for 3 more days.',
  },
  {
    id: 'tc-2',
    clientName: 'Amanda Williams',
    patientName: 'Bella',
    species: 'dog',
    breed: 'Labrador Retriever',
    scheduledTime: `${todayStr}T10:30:00`,
    duration: 20,
    status: 'waiting',
    reason: 'Skin rash — appeared 2 days ago',
    vetName: 'Dr. Carter',
    notes: '',
  },
  {
    id: 'tc-3',
    clientName: 'Karen Thomas',
    patientName: 'Cleo',
    species: 'cat',
    breed: 'Maine Coon',
    scheduledTime: `${todayStr}T11:00:00`,
    duration: 15,
    status: 'waiting',
    reason: 'Behavioral consult — excessive grooming',
    vetName: 'Dr. Park',
    notes: '',
  },
  {
    id: 'tc-4',
    clientName: 'David Martinez',
    patientName: 'Noodle',
    species: 'reptile',
    breed: 'Ball Python',
    scheduledTime: `${todayStr}T14:00:00`,
    duration: 20,
    status: 'waiting',
    reason: 'Husbandry review — feeding schedule concerns',
    vetName: 'Dr. Park',
    notes: '',
  },
  {
    id: 'tc-5',
    clientName: 'Robert Garcia',
    patientName: 'Rocky',
    species: 'dog',
    breed: 'German Shepherd',
    scheduledTime: `${todayStr}T15:30:00`,
    duration: 30,
    status: 'waiting',
    reason: 'Nutrition planning — weight management',
    vetName: 'Dr. Carter',
    notes: '',
  },
];

// ── Components ──

const STATUS_STYLES = {
  waiting: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', label: 'Waiting', dot: 'bg-amber-500' },
  in_progress: { bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', label: 'In Progress', dot: 'bg-emerald-500 animate-pulse' },
  completed: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Completed', dot: 'bg-gray-400' },
  no_show: { bg: 'bg-red-100 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', label: 'No Show', dot: 'bg-red-500' },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function TelemedicinePage() {
  const [sessions, setSessions] = useState<TeleconsultSession[]>(MOCK_SESSIONS);
  const [activeSession, setActiveSession] = useState<TeleconsultSession | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  // Timer for active call
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startSession = (session: TeleconsultSession) => {
    setActiveSession(session);
    setIsConnecting(true);
    setElapsed(0);
    setSessionNotes(session.notes);
    setChatMessages([
      { sender: 'system', text: `Video consultation with ${session.clientName} for ${session.patientName} starting...`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);

    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, status: 'in_progress' as const } : s))
      );
      toast.success(`Connected with ${session.clientName}`);
      // Simulate client greeting
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'client', text: `Hi Dr., thanks for seeing us today!`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ]);
      }, 3000);
    }, 2500);
  };

  const endSession = () => {
    if (!activeSession) return;
    setIsConnected(false);
    setIsConnecting(false);
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, status: 'completed' as const, notes: sessionNotes } : s))
    );
    toast.success('Teleconsultation ended');
    setActiveSession(null);
    setChatMessages([]);
    setShowChat(false);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'vet', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setChatInput('');
  };

  const waitingCount = sessions.filter((s) => s.status === 'waiting').length;
  const inProgressCount = sessions.filter((s) => s.status === 'in_progress').length;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Telemedicine</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Virtual Consultations</h1>
        </div>
        <div className="flex items-center gap-2">
          {waitingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              {waitingCount} in Waiting Room
            </span>
          )}
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]">
            <Plus className="h-4 w-4" />
            Schedule Teleconsult
          </button>
        </div>
      </div>

      {/* Active Video Call */}
      <AnimatePresence>
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            className="mb-8 overflow-hidden rounded-2xl border-2 border-primary/30 bg-card shadow-xl"
          >
            <div className="flex flex-col lg:flex-row">
              {/* Video Area */}
              <div className="relative flex-1 bg-gray-900">
                {/* Main video feed (simulated) */}
                <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 lg:aspect-auto lg:min-h-[400px]">
                  {isConnecting ? (
                    <div className="flex flex-col items-center gap-3 text-white">
                      <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      </div>
                      <p className="text-sm font-medium">Connecting to {activeSession.clientName}...</p>
                      <p className="text-xs text-gray-400">Establishing secure video connection</p>
                    </div>
                  ) : isConnected ? (
                    <>
                      {/* Simulated remote video feed */}
                      <div className="flex flex-col items-center gap-3 text-white">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold">
                          {activeSession.clientName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <p className="text-sm font-medium">{activeSession.clientName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <Wifi className="h-3 w-3" />
                          Connected · HD
                        </div>
                      </div>

                      {/* Self-view (PIP) */}
                      <div className="absolute bottom-4 right-4 h-28 w-40 overflow-hidden rounded-xl border-2 border-white/20 bg-gray-700 shadow-lg">
                        {isVideoOn ? (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                              You
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <VideoOff className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Call info overlay */}
                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold text-white">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                          LIVE · {formatElapsed(elapsed)}
                        </span>
                      </div>

                      {/* Patient info overlay */}
                      <div className="absolute left-4 bottom-4 rounded-lg bg-black/60 px-3 py-2 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <PawPrint className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-white">{activeSession.patientName}</span>
                          <span className="text-[10px] text-gray-300">{activeSession.breed}</span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-gray-400">{activeSession.reason}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <VideoOff className="h-16 w-16" />
                      <p className="text-sm">Video session ended</p>
                    </div>
                  )}
                </div>

                {/* Video controls bar */}
                <div className="flex items-center justify-center gap-3 bg-gray-950 px-4 py-3">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full transition-all',
                      isMicOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-600 text-white hover:bg-red-500',
                    )}
                    title={isMicOn ? 'Mute' : 'Unmute'}
                  >
                    {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full transition-all',
                      isVideoOn ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-600 text-white hover:bg-red-500',
                    )}
                    title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                  >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </button>
                  <button
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-700 text-white transition-all hover:bg-gray-600"
                    title="Share screen"
                  >
                    <Monitor className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-full transition-all',
                      showChat ? 'bg-primary text-white' : 'bg-gray-700 text-white hover:bg-gray-600',
                    )}
                    title="Toggle chat"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <button
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-700 text-white transition-all hover:bg-gray-600"
                    title="Screenshot"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <div className="mx-2 h-6 w-px bg-gray-700" />
                  <button
                    onClick={endSession}
                    className="flex h-11 items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition-all hover:bg-red-500"
                  >
                    <PhoneOff className="h-5 w-5" />
                    End Call
                  </button>
                </div>
              </div>

              {/* Side Panel: Chat + Notes */}
              <div className="flex w-full flex-col border-l border-border/30 lg:w-80">
                {/* Session Notes */}
                <div className="border-b border-border/30 p-4">
                  <div className="mb-2 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Session Notes</span>
                  </div>
                  <textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Add clinical notes during consultation..."
                    className="h-24 w-full resize-none rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Chat */}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-1.5 border-b border-border/30 px-4 py-2.5">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Chat</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3">
                    <div className="space-y-2">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            'rounded-lg px-3 py-2 text-xs',
                            msg.sender === 'vet'
                              ? 'ml-6 bg-primary/10 text-foreground'
                              : msg.sender === 'client'
                                ? 'mr-6 bg-muted text-foreground'
                                : 'mx-auto bg-muted/50 text-center text-[10px] text-muted-foreground',
                          )}
                        >
                          {msg.sender !== 'system' && (
                            <span className="mb-0.5 block text-[10px] font-semibold text-muted-foreground">
                              {msg.sender === 'vet' ? 'You' : activeSession?.clientName || 'Client'} · {msg.time}
                            </span>
                          )}
                          {msg.text}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 border-t border-border/30 p-3">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={sendChat}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting Room & Sessions */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* Waiting Room */}
        <motion.div
          variants={fadeUp}
          className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card lg:col-span-2"
        >
          <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Users className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold">Virtual Waiting Room</h2>
              <p className="text-[11px] text-muted-foreground">{waitingCount} client{waitingCount !== 1 ? 's' : ''} waiting</p>
            </div>
            {inProgressCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                {inProgressCount} Active
              </span>
            )}
          </div>

          <div className="divide-y divide-border/30">
            {sessions.map((session) => {
              const sty = STATUS_STYLES[session.status];
              const time = new Date(session.scheduledTime);
              const isActive = activeSession?.id === session.id;
              return (
                <div
                  key={session.id}
                  className={cn(
                    'flex items-center gap-4 px-5 py-3.5 transition-all',
                    isActive ? 'bg-primary/5' : 'hover:bg-muted/30',
                    session.status === 'completed' && 'opacity-60',
                  )}
                >
                  <div className="shrink-0 text-center">
                    <span className="text-sm font-bold tabular-nums">
                      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="text-[10px] text-muted-foreground">{session.duration} min</p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{session.patientName}</span>
                      <span className="text-[11px] text-muted-foreground">({session.breed})</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{session.clientName} · {session.vetName}</p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">{session.reason}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold', sty.bg, sty.text)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', sty.dot)} />
                      {sty.label}
                    </span>

                    {session.status === 'waiting' && !isActive && (
                      <button
                        onClick={() => startSession(session)}
                        disabled={activeSession !== null}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
                      >
                        <Video className="h-3.5 w-3.5" />
                        Start
                      </button>
                    )}

                    {session.status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Stats & Info */}
        <motion.div variants={fadeUp} className="space-y-4">
          {/* Stats Cards */}
          {[
            { label: "Today's Sessions", value: sessions.length, icon: Calendar, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', accent: 'text-blue-600 dark:text-blue-400' },
            { label: 'Completed', value: sessions.filter((s) => s.status === 'completed').length, icon: CheckCircle2, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', accent: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Avg Duration', value: '23 min', icon: Clock, gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', accent: 'text-purple-600 dark:text-purple-400' },
          ].map((stat) => (
            <div key={stat.label} className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-card">
              <div className={cn('absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r', stat.gradient)} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  <p className={cn('mt-1 text-2xl font-bold tabular-nums', stat.accent)}>{stat.value}</p>
                </div>
                <div className={cn('rounded-xl p-2.5', stat.bg)}>
                  <stat.icon className={cn('h-5 w-5', stat.accent)} />
                </div>
              </div>
            </div>
          ))}

          {/* Telehealth Tips */}
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 to-transparent p-4 shadow-card">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold">Teleconsult Tips</h3>
            </div>
            <ul className="space-y-2">
              {[
                'Ask client to position pet in good lighting',
                'Request close-up photos of affected area',
                'Screen share lab results during discussion',
                'Always document findings in session notes',
                'Follow up with in-person visit if needed',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
