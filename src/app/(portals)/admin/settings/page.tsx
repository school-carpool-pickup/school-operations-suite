'use client';

import { ArrowUpDown, Layers, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DistanceConfigCard } from './_DistanceConfigCard';
import { LaneOverrideRulesCard } from './_LaneOverrideRulesCard';
import { LanesConfigCard } from './_LanesConfigCard';

/**
 * Admin → Settings.
 *
 * Three tabs:
 *   - Lanes & Grades  — wired to /api/v1/admin/{lanes,grades}
 *   - Override Rules  — wired to /api/v1/admin/lane-rules (mock fixtures
 *     today; backend module hasn't shipped yet but the wire-up is real).
 *   - Distance Config — local-only for now; backend doesn't expose
 *     geofence/BLE config endpoints.
 */
type SettingsTab = 'lanes' | 'overrides' | 'distance';

export default function SchoolSettingsPage() {
  const t = useTranslations('Admin.Settings');
  const [tab, setTab] = useState<SettingsTab>('lanes');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {t('title')}
        </h2>
        <p className="text-[14.5px] font-medium text-muted-foreground mt-1 tracking-tight">
          {t('subtitle')}
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as SettingsTab)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 w-full h-12 p-1 rounded-xl bg-muted/40">
          <TabsTrigger
            value="lanes"
            className="rounded-lg text-sm font-semibold gap-2"
          >
            <Layers className="h-4 w-4" />
            {t('tabLanesGrades')}
          </TabsTrigger>
          <TabsTrigger
            value="overrides"
            className="rounded-lg text-sm font-semibold gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            {t('tabOverrideRules')}
          </TabsTrigger>
          <TabsTrigger
            value="distance"
            className="rounded-lg text-sm font-semibold gap-2"
          >
            <Navigation className="h-4 w-4" />
            {t('tabDistanceConfig')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lanes" className="pt-6">
          <LanesConfigCard />
        </TabsContent>
        <TabsContent value="overrides" className="pt-6">
          <LaneOverrideRulesCard />
        </TabsContent>
        <TabsContent value="distance" className="pt-6">
          <DistanceConfigCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
