'use client';

import { AlertTriangle, Bluetooth, Info, Navigation, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Distance Config tab. Backend doesn't expose geofence/BLE config endpoints
 * yet — values are purely client-side and the Save button just confirms
 * via toast. When the backend ships:
 *   1. Replace `useState` defaults with values from a `useApi` call.
 *   2. Wire `handleSave` to a `useApiMutation` that PATCHes the school
 *      config.
 *   3. Drop the "preview only" caveat in the toast description.
 */
const DEFAULT_GEOFENCE_M = 500;
const DEFAULT_BLE_M = 15;

export function DistanceConfigCard() {
  const t = useTranslations('Admin.Settings');

  const [geofence, setGeofence] = useState<number>(DEFAULT_GEOFENCE_M);
  const [ble, setBle] = useState<number>(DEFAULT_BLE_M);

  const handleSave = () => {
    // No-op until backend ships. Toast acts as a UI receipt for the demo.
    toast.success(t('distancesSavedTitle'), {
      id: 'distance-save',
      description: t('distancesSavedDescription', {
        geofence,
        ble,
      }),
    });
  };

  return (
    <>
      <div className="mb-5">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {t('distanceConfigTitle')}
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('distanceConfigSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DistanceCard
          icon={
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Navigation className="h-5 w-5" />
            </div>
          }
          title={t('geofenceDistanceTitle')}
          subtitle={t('geofenceDistanceSubtitle')}
          value={geofence}
          onChange={setGeofence}
          hint={t('geofenceDistanceHint')}
          note={{
            tone: 'warning',
            body: t('geofenceDistanceRecommendation'),
          }}
        />
        <DistanceCard
          icon={
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Bluetooth className="h-5 w-5" />
            </div>
          }
          title={t('bleDistanceTitle')}
          subtitle={t('bleDistanceSubtitle')}
          value={ble}
          onChange={setBle}
          hint={t('bleDistanceHint')}
          note={{
            tone: 'info',
            body: t('bleDistanceRecommendation'),
          }}
        />
      </div>

      <Card className="mt-5 shadow-sm border-border/80 p-0">
        <CardContent className="p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm flex items-center gap-6 flex-wrap">
            <span className="font-semibold text-muted-foreground">
              {t('currentValuesLabel')}
            </span>
            <span className="text-muted-foreground">
              {t('currentValuesGeofence')}{' '}
              <span className="font-bold text-foreground">{geofence}m</span>
            </span>
            <span className="text-muted-foreground">
              {t('currentValuesBle')}{' '}
              <span className="font-bold text-foreground">{ble}m</span>
            </span>
          </div>
          <Button
            type="button"
            onClick={handleSave}
            className="h-10 px-4 rounded-[10px] font-semibold gap-2 shadow-sm"
          >
            <Save className="h-4 w-4" />
            {t('saveDistances')}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Distance card                                                              */
/* -------------------------------------------------------------------------- */

interface DistanceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: number;
  onChange: (v: number) => void;
  hint: string;
  note: { tone: 'warning' | 'info'; body: string };
}

function DistanceCard({
  icon,
  title,
  subtitle,
  value,
  onChange,
  hint,
  note,
}: DistanceCardProps) {
  const t = useTranslations('Admin.Settings');
  const noteToneClasses =
    note.tone === 'warning'
      ? 'border-amber-200 bg-amber-50/70 text-amber-900'
      : 'border-blue-200 bg-blue-50/70 text-blue-900';
  const noteIcon =
    note.tone === 'warning' ? (
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
    ) : (
      <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
    );

  return (
    <Card className="shadow-sm border-border/80 p-0">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          {icon}
          <div className="min-w-0">
            <h4 className="text-[15px] font-bold text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">{t('distanceMeters')}</Label>
          <Input
            type="number"
            min={0}
            value={value}
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              onChange(Number.isFinite(next) ? next : 0);
            }}
          />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hint}
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 flex gap-2 text-xs leading-relaxed ${noteToneClasses}`}
        >
          {noteIcon}
          <span>{note.body}</span>
        </div>
      </CardContent>
    </Card>
  );
}
