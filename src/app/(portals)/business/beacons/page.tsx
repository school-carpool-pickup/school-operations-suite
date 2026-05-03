'use client';

import {
  AlertCircle,
  Bluetooth,
  Building2,
  Info,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mockBeacons = [
  {
    id: '#1',
    name: 'Main Entrance',
    school: 'International School Bangkok',
    uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e',
    major: 1,
    minor: 1,
    status: 'active',
  },
  {
    id: '#2',
    name: 'Back Entrance',
    school: 'International School Bangkok',
    uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e0893f',
    major: 1,
    minor: 2,
    status: 'active',
  },
  {
    id: '#3',
    name: 'East Gate',
    school: 'Bangkok Prep School',
    uuid: 'f7826da6-4fa2-4e98-8024-bc5b71e08940',
    major: 2,
    minor: 1,
    status: 'active',
  },
];

export default function BLEBeaconsPage() {
  const t = useTranslations('Business.Beacons');
  const tCommon = useTranslations('Common');
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-foreground leading-none">
            {t('title')}
          </h2>
          <p className="text-[14px] text-muted-foreground mt-1.5 font-medium">
            {t('subtitle')}
          </p>
        </div>
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="h-[40px] rounded-[10px] bg-[#020617] hover:bg-slate-800 text-white shadow-sm font-semibold px-5 flex items-center gap-2 transition-all"
          >
            <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} />{' '}
            {t('addBeacon')}
          </Button>
        )}
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50/60 border border-blue-200/60 rounded-[12px] p-5 flex items-start gap-3 shadow-sm">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-[13.5px] font-bold text-blue-800 mb-0.5">
            {t('aboutHeading')}
          </h4>
          <p className="text-[13px] text-blue-600/90 font-medium leading-relaxed">
            {t('aboutBody')}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-1/2 md:w-[400px]">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400"
            strokeWidth={2}
          />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-10 h-[44px] w-full rounded-[10px] bg-slate-50 border-slate-200/80 text-[14px] shadow-sm focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white focus-visible:ring-offset-0 font-medium placeholder:text-slate-500 transition-colors"
          />
        </div>
        <div className="w-full sm:w-1/2 md:w-[320px]">
          <Select defaultValue="all">
            <SelectTrigger className="h-[44px] bg-white border-slate-200/80 focus:ring-slate-200 shadow-sm text-[14px] font-medium rounded-[10px] w-full">
              <SelectValue placeholder={t('schoolFilterPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filterAllSchools')}</SelectItem>
              <SelectItem value="isb">
                {t('filterIsbCount', { count: 2 })}
              </SelectItem>
              <SelectItem value="prep">
                {t('filterPrepCount', { count: 3 })}
              </SelectItem>
              <SelectItem value="nist">
                {t('filterNistCount', { count: 1 })}
              </SelectItem>
              <SelectItem value="shrewsbury">
                {t('filterShrewsburyCount', { count: 2 })}
              </SelectItem>
              <SelectItem value="kis">
                {t('filterKisCount', { count: 0 })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-500 mb-0.5">
                {t('statTotalBeacons')}
              </span>
              <span className="text-[26px] font-black text-foreground leading-none tracking-tight">
                3
              </span>
            </div>
            <div className="flex items-center justify-center text-blue-500">
              <Bluetooth className="w-6 h-6" strokeWidth={2.5} />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-500 mb-0.5">
                {t('statActiveBeacons')}
              </span>
              <span className="text-[26px] font-black text-foreground leading-none tracking-tight">
                3
              </span>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-500 mb-0.5">
                {t('statSchoolsWithBeacons')}
              </span>
              <span className="text-[26px] font-black text-foreground leading-none tracking-tight">
                4
              </span>
            </div>
            <div className="flex items-center justify-center text-purple-500">
              <Building2 className="w-6 h-6" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-500 mb-0.5">
                {t('statAvgPerSchool')}
              </span>
              <span className="text-[26px] font-black text-foreground leading-none tracking-tight">
                0.6
              </span>
            </div>
            <div className="flex items-center justify-center text-orange-500">
              <AlertCircle className="w-6 h-6" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Beacon Form (Conditional) */}
      {showAddForm && (
        <Card className="rounded-[16px] border border-blue-200 shadow-md bg-blue-50/20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="pb-4 pt-6 px-6 border-b border-slate-100 bg-white/50">
            <CardTitle className="text-[16px] font-bold text-foreground">
              {t('addNewBeaconTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-5 bg-white space-y-5">
            <div className="space-y-2">
              <span className="text-[13.5px] font-semibold text-slate-700">
                {t('schoolLabel')}
              </span>
              <Select>
                <SelectTrigger className="h-[42px] bg-slate-50/80 border-slate-200 focus:ring-slate-200 text-[14px] font-medium shadow-none rounded-[8px]">
                  <SelectValue placeholder={t('selectSchoolPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="isb">
                    International School Bangkok
                  </SelectItem>
                  <SelectItem value="prep">Bangkok Prep School</SelectItem>
                  <SelectItem value="nist">
                    NIST International School
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-[13.5px] font-semibold text-slate-700">
                {t('beaconNameLabel')}
              </span>
              <Input
                placeholder={t('beaconNamePlaceholder')}
                className="h-[42px] rounded-[8px] bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[13.5px] font-semibold text-slate-700">
                {t('uuidLabel')}
              </span>
              <div className="flex gap-3">
                <Input
                  placeholder={t('uuidPlaceholder')}
                  className="h-[42px] rounded-[8px] bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none placeholder:text-slate-400 font-mono flex-1"
                />
                <Button
                  variant="outline"
                  className="h-[42px] rounded-[8px] font-semibold text-slate-700 border-slate-200 px-5 shrink-0"
                >
                  {tCommon('generate')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[13.5px] font-semibold text-slate-700">
                  {t('majorLabel')}
                </span>
                <Input
                  defaultValue="1"
                  className="h-[42px] rounded-[8px] bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[13.5px] font-semibold text-slate-700">
                  {t('minorLabel')}
                </span>
                <Input
                  defaultValue="1"
                  className="h-[42px] rounded-[8px] bg-slate-50 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <Button className="w-full h-[42px] rounded-[8px] bg-[#020617] hover:bg-slate-800 text-white font-bold tracking-wide">
                {t('addBeacon')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="w-full h-[42px] rounded-[8px] font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
              >
                {tCommon('cancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Beacons Table */}
      <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-7 bg-white">
          <CardTitle className="text-[16px] font-bold text-foreground">
            {t('tableTitle', { count: mockBeacons.length })}
          </CardTitle>
        </CardHeader>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header Row */}
            <div className="grid grid-cols-[2.5fr_2.5fr_3fr_1.5fr_1fr_100px] gap-4 px-7 py-3 border-y border-slate-100/80 bg-slate-50/50">
              <div className="text-[12.5px] font-semibold text-slate-500">
                {t('columnBeaconName')}
              </div>
              <div className="text-[12.5px] font-semibold text-slate-500">
                {t('columnSchool')}
              </div>
              <div className="text-[12.5px] font-semibold text-slate-500">
                {t('columnUuid')}
              </div>
              <div className="text-[12.5px] font-semibold text-slate-500">
                {t('columnMajorMinor')}
              </div>
              <div className="text-[12.5px] font-semibold text-slate-500">
                {t('columnStatus')}
              </div>
              <div className="text-[12.5px] font-semibold text-slate-500 text-right pr-4">
                {t('columnActions')}
              </div>
            </div>

            {/* Data Rows */}
            <div className="flex flex-col bg-white">
              {mockBeacons.map((beacon, i) => (
                <div
                  key={beacon.id}
                  className={`grid grid-cols-[2.5fr_2.5fr_3fr_1.5fr_1fr_100px] gap-4 px-7 py-5 items-center hover:bg-slate-50/50 transition-colors ${i !== mockBeacons.length - 1 ? 'border-b border-slate-100/50' : ''}`}
                >
                  {/* Beacon Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-blue-50/80 flex items-center justify-center shrink-0">
                      <Bluetooth
                        className="w-5 h-5 text-blue-500"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-slate-800">
                        {beacon.name}
                      </div>
                      <div className="text-[12px] text-slate-400 font-medium">
                        {t('idPrefix', { id: beacon.id })}
                      </div>
                    </div>
                  </div>

                  {/* School */}
                  <div className="flex items-center gap-2 text-[13.5px] text-slate-600 font-medium">
                    <Building2 className="w-4 h-4 opacity-50 shrink-0" />
                    {beacon.school}
                  </div>

                  {/* UUID */}
                  <div>
                    <span className="text-[12.5px] font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-[6px] tracking-tight">
                      {beacon.uuid}
                    </span>
                  </div>

                  {/* Major/Minor */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-600 border border-slate-200 bg-white px-2 py-0.5 rounded-[4px] shadow-sm">
                      {t('majorPrefix', { value: beacon.major })}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 border border-slate-200 bg-white px-2 py-0.5 rounded-[4px] shadow-sm">
                      {t('minorPrefix', { value: beacon.minor })}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 border-none text-emerald-600 px-2 py-0.5 rounded-[6px] text-[11px] font-bold tracking-wide uppercase"
                    >
                      {beacon.status === 'active'
                        ? tCommon('active')
                        : beacon.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pr-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-[6px]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Guide Section */}
      <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] bg-white">
        <CardHeader className="pb-4 pt-6 px-7">
          <CardTitle className="text-[15px] font-bold text-foreground">
            {t('guideTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-7 pb-7">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50/80 rounded-[12px] p-5 border border-slate-100">
              <h4 className="text-[14px] font-bold text-slate-800 mb-1.5">
                {t('guideStep1Title')}
              </h4>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                {t('guideStep1Body')}
              </p>
            </div>
            <div className="bg-slate-50/80 rounded-[12px] p-5 border border-slate-100">
              <h4 className="text-[14px] font-bold text-slate-800 mb-1.5">
                {t('guideStep2Title')}
              </h4>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                {t('guideStep2Body')}
              </p>
            </div>
            <div className="bg-slate-50/80 rounded-[12px] p-5 border border-slate-100">
              <h4 className="text-[14px] font-bold text-slate-800 mb-1.5">
                {t('guideStep3Title')}
              </h4>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                {t('guideStep3Body')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
