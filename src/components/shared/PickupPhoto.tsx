'use client';

import type { ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PickupPhotoProps {
  /** Signed READ URL from the backend, or nothing. */
  src?: string | null;
  /** Shown when there is no photo, or it failed to load. */
  fallback: ReactNode;
  alt: string;
  /** Called when the photo fails — usually an expired signed URL. */
  onExpired?: () => void;
  className?: string;
}

/**
 * A photo on the pickup board — the child, the person collecting, or the car —
 * that degrades to a placeholder when the school hasn't supplied one or the
 * signed URL has expired.
 */
export function PickupPhoto({
  src,
  fallback,
  alt,
  onExpired,
  className,
}: PickupPhotoProps) {
  return (
    <Avatar className={cn('h-9 w-9 border-0', className)}>
      {src ? (
        <AvatarImage
          src={src}
          alt={alt}
          className="object-cover"
          onLoadingStatusChange={(status) => {
            if (status === 'error') onExpired?.();
          }}
        />
      ) : null}
      <AvatarFallback className="bg-zinc-100 text-[11px] font-bold text-zinc-500">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
