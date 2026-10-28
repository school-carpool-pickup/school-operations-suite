import type { AdminPickup } from '@/types';

/** "Isuzu MUX White" — what staff look for at the gate besides the plate. */
export function vehicleModel(pickup: Pick<AdminPickup, 'vehicle'>): string {
  return [pickup.vehicle.brand, pickup.vehicle.model, pickup.vehicle.color]
    .filter(Boolean)
    .join(' ');
}
