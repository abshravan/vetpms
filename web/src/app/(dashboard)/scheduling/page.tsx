'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  Users,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Stethoscope,
  Coffee,
  Moon,
  Sun,
  Briefcase,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// ── Types ──

interface StaffMember {
  id: string;
  name: string;
  role: 'vet' | 'tech' | 'receptionist';
  color: string;
  avatar: string;
}

interface ShiftBlock {
  id: string;
  staffId: string;
  day: number; // 0=Mon, 6=Sun
  startHour: number;
  endHour: number;
  type: 'shift' | 'break' | 'off';
  room?: string;
}

interface Room {
  id: string;
  name: string;
  type: 'exam' | 'surgery' | 'dental' | 'imaging' | 'lab';
  capacity: number;
  icon: React.ElementType;
}

// ── Mock Data ──

const STAFF: StaffMember[] = [
  { id: 'u-1', name: 'Dr. Carter', role: 'vet', color: '#6366f1', avatar: 'SC' },
  { id: 'u-2', name: 'Dr. Park', role: 'vet', color: '#10b981', avatar: 'JP' },
  { id: 'u-3', name: 'Sarah Tech', role: 'tech', color: '#f59e0b', avatar: 'ST' },
  { id: 'u-4', name: 'Mike Tech', role: 'tech', color: '#8b5cf6', avatar: 'MT' },
  { id: 'u-5', name: 'Lisa R.', role: 'receptionist', color: '#ec4899', avatar: 'LR' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7AM to 6PM

const MOCK_SHIFTS: ShiftBlock[] = [
  // Dr. Carter
  { id: 'sh-1', staffId: 'u-1', day: 0, startHour: 8, endHour: 12, type: 'shift', room: 'Exam 1' },
  { id: 'sh-2', staffId: 'u-1', day: 0, startHour: 12, endHour: 13, type: 'break' },
  { id: 'sh-3', staffId: 'u-1', day: 0, startHour: 13, endHour: 17, type: 'shift', room: 'Exam 1' },
  { id: 'sh-4', staffId: 'u-1', day: 1, startHour: 8, endHour: 12, type: 'shift', room: 'Surgery' },
  { id: 'sh-5', staffId: 'u-1', day: 1, startHour: 13, endHour: 18, type: 'shift', room: 'Exam 1' },
  { id: 'sh-6', staffId: 'u-1', day: 2, startHour: 8, endHour: 17, type: 'shift', room: 'Exam 2' },
  { id: 'sh-7', staffId: 'u-1', day: 3, startHour: 8, endHour: 14, type: 'shift', room: 'Exam 1' },
  { id: 'sh-8', staffId: 'u-1', day: 4, startHour: 8, endHour: 17, type: 'shift', room: 'Exam 1' },
  // Dr. Park
  { id: 'sh-10', staffId: 'u-2', day: 0, startHour: 9, endHour: 17, type: 'shift', room: 'Exam 2' },
  { id: 'sh-11', staffId: 'u-2', day: 1, startHour: 8, endHour: 12, type: 'shift', room: 'Dental' },
  { id: 'sh-12', staffId: 'u-2', day: 1, startHour: 13, endHour: 17, type: 'shift', room: 'Exam 2' },
  { id: 'sh-13', staffId: 'u-2', day: 2, startHour: 10, endHour: 18, type: 'shift', room: 'Exam 1' },
  { id: 'sh-14', staffId: 'u-2', day: 3, startHour: 8, endHour: 18, type: 'shift', room: 'Exam 2' },
  { id: 'sh-15', staffId: 'u-2', day: 5, startHour: 8, endHour: 13, type: 'shift', room: 'Exam 1' },
  // Sarah Tech
  { id: 'sh-20', staffId: 'u-3', day: 0, startHour: 8, endHour: 16, type: 'shift' },
  { id: 'sh-21', staffId: 'u-3', day: 1, startHour: 8, endHour: 16, type: 'shift' },
  { id: 'sh-22', staffId: 'u-3', day: 2, startHour: 8, endHour: 16, type: 'shift' },
  { id: 'sh-23', staffId: 'u-3', day: 3, startHour: 8, endHour: 16, type: 'shift' },
  { id: 'sh-24', staffId: 'u-3', day: 4, startHour: 8, endHour: 16, type: 'shift' },
  // Mike Tech
  { id: 'sh-30', staffId: 'u-4', day: 0, startHour: 10, endHour: 18, type: 'shift' },
  { id: 'sh-31', staffId: 'u-4', day: 1, startHour: 10, endHour: 18, type: 'shift' },
  { id: 'sh-32', staffId: 'u-4', day: 3, startHour: 10, endHour: 18, type: 'shift' },
  { id: 'sh-33', staffId: 'u-4', day: 4, startHour: 10, endHour: 18, type: 'shift' },
  { id: 'sh-34', staffId: 'u-4', day: 5, startHour: 8, endHour: 14, type: 'shift' },
  // Lisa Reception
  { id: 'sh-40', staffId: 'u-5', day: 0, startHour: 7, endHour: 15, type: 'shift' },
  { id: 'sh-41', staffId: 'u-5', day: 1, startHour: 7, endHour: 15, type: 'shift' },
  { id: 'sh-42', staffId: 'u-5', day: 2, startHour: 7, endHour: 15, type: 'shift' },
  { id: 'sh-43', staffId: 'u-5', day: 3, startHour: 7, endHour: 15, type: 'shift' },
  { id: 'sh-44', staffId: 'u-5', day: 4, startHour: 7, endHour: 15, type: 'shift' },
  { id: 'sh-45', staffId: 'u-5', day: 5, startHour: 7, endHour: 12, type: 'shift' },
];

const ROOMS: Room[] = [
  { id: 'r-1', name: 'Exam Room 1', type: 'exam', capacity: 1, icon: Stethoscope },
  { id: 'r-2', name: 'Exam Room 2', type: 'exam', capacity: 1, icon: Stethoscope },
  { id: 'r-3', name: 'Surgery Suite', type: 'surgery', capacity: 1, icon: Briefcase },
  { id: 'r-4', name: 'Dental Suite', type: 'dental', capacity: 1, icon: Stethoscope },
  { id: 'r-5', name: 'Imaging Room', type: 'imaging', capacity: 1, icon: MapPin },
];

const ROLE_STYLES = {
  vet: { bg: 'bg-blue-100 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', label: 'Veterinarian' },
  tech: { bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', label: 'Technician' },
  receptionist: { bg: 'bg-pink-100 dark:bg-pink-950/40', text: 'text-pink-700 dark:text-pink-400', label: 'Receptionist' },
};

function formatHour(h: number) {
  if (h === 12) return '12 PM';
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
}

export default function SchedulingPage() {
  const [view, setView] = useState<'staff' | 'rooms'>('staff');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);

  const filteredShifts = selectedStaff
    ? MOCK_SHIFTS.filter((s) => s.staffId === selectedStaff)
    : MOCK_SHIFTS;

  // Staff stats
  const staffStats = useMemo(() => {
    return STAFF.map((staff) => {
      const shifts = MOCK_SHIFTS.filter((s) => s.staffId === staff.id && s.type === 'shift');
      const totalHours = shifts.reduce((sum, s) => sum + (s.endHour - s.startHour), 0);
      const daysWorked = new Set(shifts.map((s) => s.day)).size;
      return { ...staff, totalHours, daysWorked };
    });
  }, []);

  // Room utilization
  const roomUtil = useMemo(() => {
    return ROOMS.map((room) => {
      const assignedShifts = MOCK_SHIFTS.filter((s) => s.room === room.name.replace('Room ', '').replace(' Suite', ''));
      const totalHours = assignedShifts.reduce((sum, s) => sum + (s.endHour - s.startHour), 0);
      const maxHours = 6 * 10; // 6 working days x 10 hours
      return { ...room, totalHours, utilization: Math.round((totalHours / maxHours) * 100) };
    });
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Scheduling</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & Resource Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border/40 p-0.5">
            <button
              onClick={() => setView('staff')}
              className={cn('rounded-md px-3 py-1.5 text-xs font-semibold transition-all', view === 'staff' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
            >
              Staff View
            </button>
            <button
              onClick={() => setView('rooms')}
              className={cn('rounded-md px-3 py-1.5 text-xs font-semibold transition-all', view === 'rooms' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
            >
              Room View
            </button>
          </div>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/90 px-5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-[0.98]">
            <Plus className="h-4 w-4" /> Add Shift
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Staff List / Room List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {view === 'staff' ? 'Team Members' : 'Rooms & Resources'}
          </h3>

          {view === 'staff' ? (
            <div className="space-y-2">
              <button
                onClick={() => setSelectedStaff(null)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                  !selectedStaff ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20' : 'border-border/40 hover:bg-muted/30',
                )}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-xs font-bold text-white">
                  All
                </div>
                <div>
                  <p className="text-sm font-semibold">All Staff</p>
                  <p className="text-[10px] text-muted-foreground">{STAFF.length} members</p>
                </div>
              </button>
              {staffStats.map((staff) => {
                const roleStyle = ROLE_STYLES[staff.role];
                return (
                  <button
                    key={staff.id}
                    onClick={() => setSelectedStaff(selectedStaff === staff.id ? null : staff.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                      selectedStaff === staff.id ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20' : 'border-border/40 hover:bg-muted/30',
                    )}
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: staff.color }}
                    >
                      {staff.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{staff.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-bold', roleStyle.bg, roleStyle.text)}>
                          {roleStyle.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{staff.totalHours}h · {staff.daysWorked}d</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {roomUtil.map((room) => {
                const RoomIcon = room.icon;
                return (
                  <div key={room.id} className="rounded-xl border border-border/40 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <RoomIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{room.name}</p>
                        <p className="text-[10px] capitalize text-muted-foreground">{room.type}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Utilization</span>
                        <span className="text-[10px] font-bold tabular-nums">{room.utilization}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            room.utilization >= 80 ? 'bg-red-500' : room.utilization >= 50 ? 'bg-amber-500' : 'bg-emerald-500',
                          )}
                          style={{ width: `${room.utilization}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Schedule Grid */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
            <div className="flex items-center gap-2">
              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h3 className="text-sm font-semibold">This Week</h3>
              <button className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-blue-200" /> Vet</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-200" /> Tech</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-pink-200" /> Reception</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-gray-300" /> Break</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/30">
                <div className="p-2" />
                {DAYS.map((day, i) => (
                  <div key={day} className={cn('border-l border-border/20 p-2 text-center', i >= 5 && 'bg-muted/20')}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {day.slice(0, 3)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hour rows */}
              {HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/10">
                  <div className="flex items-start justify-end px-2 py-1">
                    <span className="text-[10px] tabular-nums text-muted-foreground/60">{formatHour(hour)}</span>
                  </div>
                  {DAYS.map((_, dayIdx) => {
                    const cellShifts = filteredShifts.filter(
                      (s) => s.day === dayIdx && s.startHour <= hour && s.endHour > hour
                    );
                    return (
                      <div
                        key={dayIdx}
                        className={cn(
                          'relative min-h-[32px] border-l border-border/10 p-0.5',
                          dayIdx >= 5 && 'bg-muted/10',
                        )}
                      >
                        {cellShifts.map((shift) => {
                          const staff = STAFF.find((s) => s.id === shift.staffId);
                          if (!staff) return null;
                          // Only render on the start hour to avoid duplicates
                          if (shift.startHour !== hour) return null;
                          const heightBlocks = shift.endHour - shift.startHour;
                          return (
                            <div
                              key={shift.id}
                              className={cn(
                                'absolute inset-x-0.5 z-10 overflow-hidden rounded-md border px-1.5 py-0.5 text-[9px] font-semibold leading-tight',
                                shift.type === 'break'
                                  ? 'border-gray-300 bg-gray-100 text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400'
                                  : 'border-transparent text-white',
                              )}
                              style={{
                                top: 0,
                                height: `${heightBlocks * 32}px`,
                                ...(shift.type !== 'break' && { backgroundColor: staff.color + 'cc' }),
                              }}
                            >
                              <span className="block truncate">{staff.name.split(' ')[0]}</span>
                              {shift.room && <span className="block truncate opacity-70">{shift.room}</span>}
                              {shift.type === 'break' && (
                                <span className="flex items-center gap-0.5"><Coffee className="h-2.5 w-2.5" /> Break</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {staffStats.map((staff) => {
          const roleStyle = ROLE_STYLES[staff.role];
          return (
            <motion.div
              key={staff.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border/60 bg-card p-4 shadow-card"
            >
              <div className="mb-3 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: staff.color }}
                >
                  {staff.avatar}
                </div>
                <div>
                  <p className="text-xs font-semibold">{staff.name}</p>
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[8px] font-bold', roleStyle.bg, roleStyle.text)}>
                    {roleStyle.label}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/30 p-2 text-center">
                  <p className="text-lg font-bold tabular-nums">{staff.totalHours}h</p>
                  <p className="text-[9px] text-muted-foreground">This Week</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-2 text-center">
                  <p className="text-lg font-bold tabular-nums">{staff.daysWorked}d</p>
                  <p className="text-[9px] text-muted-foreground">Days</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
