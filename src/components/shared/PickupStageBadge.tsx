import { ArrowUpCircle, Car, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Colour-coded badge for a pickup's backend `stage_label`
 * (active | prepare | queued | completed | cancelled).
 *
 * Shared by the admin Pickup CRM and the staff pickup board. The caller
 * passes the already-translated `text` so each portal keeps its own i18n
 * namespace; this component only owns the colour + icon mapping.
 */
export function PickupStageBadge({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const base =
    'border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1';

  switch (label) {
    case 'completed':
      return (
        <Badge
          variant="outline"
          className={`bg-emerald-100/60 text-emerald-700 ${base}`}
        >
          <CheckCircle2 className="h-3 w-3" /> {text}
        </Badge>
      );
    case 'queued':
      return (
        <Badge
          variant="outline"
          className={`bg-blue-100/60 text-blue-700 ${base}`}
        >
          <ArrowUpCircle className="h-3 w-3" /> {text}
        </Badge>
      );
    case 'prepare':
      return (
        <Badge
          variant="outline"
          className={`bg-purple-100/60 text-purple-700 ${base}`}
        >
          <Car className="h-3 w-3" /> {text}
        </Badge>
      );
    case 'active':
      return (
        <Badge
          variant="outline"
          className={`bg-amber-100/60 text-amber-700 ${base}`}
        >
          <Clock className="h-3 w-3" /> {text}
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className={`bg-muted/60 text-muted-foreground/80 ${base}`}
        >
          <XCircle className="h-3 w-3" /> {text}
        </Badge>
      );
    default:
      return <Badge variant="outline">{text || label}</Badge>;
  }
}
