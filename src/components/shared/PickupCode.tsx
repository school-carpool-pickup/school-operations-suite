import { cn } from '@/lib/utils';

interface PickupCodeProps {
  code?: string | null;
  /** What to say before a code exists — "Not queued yet". */
  notQueuedLabel: string;
  className?: string;
}

/**
 * A pickup's queue number, or a muted note that it hasn't got one yet.
 *
 * The backend now issues the number when the car reaches the queue rather than
 * when the pickup starts, so every pickup still on its way has none. These
 * places used to fall back to the first 8 characters of the pickup's id, which
 * looks exactly like a queue number to gate staff and is nothing of the kind.
 */
export function PickupCode({
  code,
  notQueuedLabel,
  className,
}: PickupCodeProps) {
  if (code) return <span className={className}>{code}</span>;
  return (
    <span
      className={cn(className, 'font-normal italic text-muted-foreground/70')}
    >
      {notQueuedLabel}
    </span>
  );
}
