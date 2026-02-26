'use client';

import { cn } from '../lib/utils';

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-muted/60 via-muted to-muted/60 bg-[length:200%_100%]',
        className,
      )}
      style={style}
    />
  );
}

/** Stat card skeleton for the dashboard */
export function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-card">
      <div className="absolute inset-x-0 top-0 h-[2px] animate-pulse bg-muted" />
      <div className="flex items-start justify-between">
        <div>
          <Shimmer className="mb-3 h-3 w-20" />
          <Shimmer className="h-7 w-16" />
        </div>
        <Shimmer className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}

/** Table row skeleton */
export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-border/30 px-5 py-3.5">
      {Array.from({ length: cols }).map((_, i) => (
        <Shimmer
          key={i}
          className={cn(
            'h-4',
            i === 0 ? 'w-16' : i === 1 ? 'w-28' : i === cols - 1 ? 'w-16' : 'w-20',
          )}
        />
      ))}
    </div>
  );
}

/** List item skeleton for schedule/visits */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5">
      <Shimmer className="h-4 w-14 shrink-0" />
      <div className="flex-1">
        <Shimmer className="mb-1.5 h-4 w-32" />
        <Shimmer className="h-3 w-48" />
      </div>
      <Shimmer className="h-6 w-16 rounded-full" />
    </div>
  );
}

/** Chart placeholder skeleton */
export function ChartSkeleton() {
  return (
    <div className="flex h-[220px] items-end gap-2 px-4 pb-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Shimmer
          key={i}
          className="flex-1 rounded-t-md"
          style={{ height: `${30 + Math.sin(i * 0.8) * 25 + i * 8}%` }}
        />
      ))}
    </div>
  );
}

/** Full card skeleton */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
      <Shimmer className="mb-4 h-4 w-24" />
      <div className="my-3 h-px bg-border/30" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Page-level dashboard skeleton */
export function DashboardSkeleton() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Shimmer className="mb-2 h-3 w-24" />
        <Shimmer className="h-8 w-40" />
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
              <Shimmer className="h-8 w-8 rounded-lg" />
              <div>
                <Shimmer className="mb-1 h-4 w-24" />
                <Shimmer className="h-3 w-32" />
              </div>
            </div>
            <ChartSkeleton />
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
            <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
              <Shimmer className="h-8 w-8 rounded-lg" />
              <div>
                <Shimmer className="mb-1 h-4 w-28" />
                <Shimmer className="h-3 w-20" />
              </div>
            </div>
            <div className="divide-y divide-border/50">
              {Array.from({ length: 4 }).map((_, j) => (
                <ListItemSkeleton key={j} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Patient profile skeleton */
export function PatientProfileSkeleton() {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Shimmer className="h-9 w-9 rounded-xl" />
        <Shimmer className="h-14 w-14 rounded-2xl" />
        <div className="flex-1">
          <Shimmer className="mb-1 h-3 w-20" />
          <Shimmer className="h-7 w-36" />
        </div>
        <Shimmer className="h-9 w-16 rounded-xl" />
      </div>
      <CardSkeleton lines={4} />
      <div className="mt-4">
        <CardSkeleton lines={3} />
      </div>
    </div>
  );
}

/** Table page skeleton */
export function TablePageSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <Shimmer className="mb-2 h-3 w-20" />
          <Shimmer className="h-8 w-32" />
        </div>
        <Shimmer className="h-10 w-36 rounded-xl" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
