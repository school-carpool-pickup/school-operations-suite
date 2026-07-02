import { Badge } from '@/components/ui/badge';
import type { Beacon } from '@/types';

interface MockMapProps {
  beacons?: Beacon[];
  isLoading?: boolean;
}

export function MockMap({ beacons, isLoading }: MockMapProps) {
  // Simulate random coordinates for the beacons
  const getCoordinates = (id: string) => {
    let top = 40;
    let left = 50;

    if (id.includes('b1')) {
      top = 20;
      left = 30;
    }
    if (id.includes('b2')) {
      top = 60;
      left = 75;
    }
    if (id.includes('b3')) {
      top = 80;
      left = 20;
    }

    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="relative w-full h-[400px] bg-zinc-100 rounded-xl overflow-hidden border border-border">
      {/* Decorative Map Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* "Map" watermark */}
      <div className="absolute top-4 left-4 text-xs font-bold text-zinc-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md backdrop-blur-sm">
        Mock Map View
      </div>

      {!isLoading &&
        beacons?.map((beacon) => {
          const { top, left } = getCoordinates(beacon.id);
          const isOnline = beacon.status === 'online';

          return (
            <div
              key={beacon.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
              style={{ top, left }}
            >
              {/* Pulsing Beacon Dot */}
              <div className="relative flex h-4 w-4">
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-4 w-4 ${isOnline ? 'bg-primary' : 'bg-zinc-400'}`}
                ></span>
              </div>

              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-popover text-popover-foreground text-xs p-2 rounded-md shadow-lg whitespace-nowrap z-10 pointer-events-none border border-border">
                <div className="font-bold">{beacon.name}</div>
                <div className="text-muted-foreground flex items-center justify-between gap-4 mt-1">
                  <span>Battery: {beacon.battery}%</span>
                  <Badge
                    variant="outline"
                    className={`h-4 text-[10px] px-1 py-0 ${isOnline ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-800'}`}
                  >
                    {beacon.status}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
