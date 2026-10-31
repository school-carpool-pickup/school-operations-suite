import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  /** Rendered width and height in px. */
  size: number;
  className?: string;
  /** Loaded eagerly — it is above the fold on every login screen. */
  priority?: boolean;
}

/** The "Student Pick Up" logo. Same artwork as the parent app's icon. */
export function BrandLogo({ size, className, priority }: BrandLogoProps) {
  return (
    <Image
      src="/brand/logo.png"
      alt="Student Pick Up"
      width={size}
      height={size}
      priority={priority}
      className={cn('shrink-0', className)}
    />
  );
}
