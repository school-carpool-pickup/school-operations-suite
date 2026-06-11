'use client';

import {
  AlertTriangle,
  Bluetooth,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Save,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiKeys, useApi, useApiMutation } from '@/lib/api';
import type {
  AdminSchoolConfigResponse,
  AdminSchoolConfigUpdateInput,
} from '@/types';

/**
 * Distance Config tab — wired to `GET`/`PUT /api/v1/admin/school-configs`.
 *
 * The PUT replaces the whole config, so we hydrate every field (including
 * the school coordinates) from the GET first and send all four back on
 * save — otherwise an admin who only edits a distance would zero out the
 * school's lat/lng. The backend derives `school_id` from the JWT.
 */
const DEFAULT_GEOFENCE_M = 500;
const DEFAULT_BLE_M = 15;

export function DistanceConfigCard() {
  const t = useTranslations('Admin.Settings');

  const configQuery = useApi<AdminSchoolConfigResponse>(
    apiKeys.adminSchoolConfig.get(),
  );

  const [geofence, setGeofence] = useState<number>(DEFAULT_GEOFENCE_M);
  const [ble, setBle] = useState<number>(DEFAULT_BLE_M);
  // Coordinates are kept as strings so decimals can be typed freely; parsed
  // to float on save.
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');

  // Hydrate from the backend once, the first time the config arrives. A ref
  // guard keeps a background refetch from clobbering in-progress edits.
  const hydratedRef = useRef(false);
  useEffect(() => {
    const cfg = configQuery.data?.data?.config;
    if (cfg && !hydratedRef.current) {
      hydratedRef.current = true;
      setGeofence(cfg.geofence);
      setBle(cfg.ble_beacon);
      setLatitude(String(cfg.latitude));
      setLongitude(String(cfg.longitude));
    }
  }, [configQuery.data]);

  const mutation = useApiMutation<
    AdminSchoolConfigResponse,
    AdminSchoolConfigUpdateInput
  >((input) => apiKeys.adminSchoolConfig.update(input), {
    onSuccess: (res) => {
      if (res?.error?.code) {
        toast.error(t('distancesSaveErrorTitle'), {
          id: 'distance-save',
          description: res.error.message || t('distancesSaveErrorGeneric'),
        });
        return;
      }
      toast.success(t('distancesSavedTitle'), {
        id: 'distance-save',
        description: t('distancesSavedDescription', { geofence, ble }),
      });
      configQuery.refetch();
    },
    onError: (err) => {
      const data = (
        err as { response?: { data?: { error?: { message?: string } } } }
      )?.response?.data;
      toast.error(t('distancesSaveErrorTitle'), {
        id: 'distance-save',
        description:
          data?.error?.message ?? err.message ?? t('distancesSaveErrorGeneric'),
      });
    },
  });

  const handleSave = () => {
    const lat = Number.parseFloat(latitude);
    const lng = Number.parseFloat(longitude);
    mutation.mutate({
      geofence,
      ble_beacon: ble,
      latitude: Number.isFinite(lat) ? lat : 0,
      longitude: Number.isFinite(lng) ? lng : 0,
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

      {configQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('distanceConfigLoading')}
        </div>
      ) : (
        <>
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
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[15px] font-bold text-foreground">
                    {t('schoolLocationTitle')}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('schoolLocationSubtitle')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CoordinateField
                  label={t('latitudeLabel')}
                  value={latitude}
                  onChange={setLatitude}
                  placeholder="13.7563"
                />
                <CoordinateField
                  label={t('longitudeLabel')}
                  value={longitude}
                  onChange={setLongitude}
                  placeholder="100.5018"
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('schoolLocationHint')}
              </p>
            </CardContent>
          </Card>

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
                disabled={mutation.isPending}
                className="h-10 px-4 rounded-[10px] font-semibold gap-2 shadow-sm"
              >
                {mutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {mutation.isPending
                  ? t('saveDistancesSaving')
                  : t('saveDistances')}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
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

/* -------------------------------------------------------------------------- */
/* Coordinate field                                                           */
/* -------------------------------------------------------------------------- */

interface CoordinateFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}

function CoordinateField({
  label,
  value,
  onChange,
  placeholder,
}: CoordinateFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">{label}</Label>
      <Input
        type="number"
        step="any"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
