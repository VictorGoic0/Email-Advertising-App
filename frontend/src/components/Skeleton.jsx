import { cn } from '@/lib/utils';

/**
 * Skeleton - Loading placeholder component
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

/**
 * SkeletonCard - Skeleton for card components
 */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card shadow">
      <div className="p-6 space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

/**
 * SkeletonMetricCard - Skeleton for metric cards
 */
export function SkeletonMetricCard() {
  return (
    <div className="rounded-xl border bg-card shadow p-6 space-y-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

