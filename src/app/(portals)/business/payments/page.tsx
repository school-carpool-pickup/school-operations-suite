'use client';

import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const pendingPayouts = [
  {
    id: '#1',
    name: 'Sarah Johnson',
    type: 'Driver',
    school: 'International School Bangkok',
    rides: 45,
    period: 'March 1-14, 2026',
    amount: '฿13,500',
    status: 'Pending',
  },
  {
    id: '#2',
    name: 'Michael Chen',
    type: 'Driver',
    school: 'Bangkok Prep School',
    rides: 42,
    period: 'March 1-14, 2026',
    amount: '฿12,600',
    status: 'Pending',
  },
  {
    id: '#3',
    name: 'Emma Davis',
    type: 'Driver',
    school: 'NIST International',
    rides: 38,
    period: 'March 1-14, 2026',
    amount: '฿11,400',
    status: 'Pending',
  },
  {
    id: '#4',
    name: 'James Wilson',
    type: 'Driver',
    school: 'Shrewsbury International',
    rides: 35,
    period: 'March 1-14, 2026',
    amount: '฿10,500',
    status: 'Pending',
  },
  {
    id: '#5',
    name: 'Lisa Anderson',
    type: 'Driver',
    school: 'KIS International',
    rides: 32,
    period: 'March 1-14, 2026',
    amount: '฿9,600',
    status: 'Pending',
  },
];

export default function PayoutsManagementPage() {
  const t = useTranslations('Business.Payments');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>(
    'pending',
  );

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
        <Button className="h-[40px] rounded-[10px] bg-[#020617] hover:bg-slate-800 text-white shadow-sm font-semibold px-5 flex items-center gap-2 transition-all">
          <Download className="w-4 h-4 text-white/80" strokeWidth={2.5} />{' '}
          {t('exportPayouts')}
        </Button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Highlighted Orange Card */}
        <Card className="rounded-[16px] border-none shadow-[0_4px_12px_rgba(249,115,22,0.15)] bg-[#f97316] text-white">
          <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px] relative">
            <div className="absolute top-5 right-5">
              <Calendar className="w-5 h-5 text-white/80" strokeWidth={2} />
            </div>
            <div>
              <div className="h-10 w-10 flex items-center justify-center rounded-[10px] bg-white/20 mb-3 backdrop-blur-sm">
                <DollarSign className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white/90 mb-1">
                {t('totalPendingPayouts')}
              </p>
              <div className="text-[32px] font-black leading-none tracking-tight">
                ฿131,220
              </div>
              <p className="text-[12px] font-medium text-white/80 mt-1.5">
                {t('dueDate', { date: 'March 15, 2026' })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Drivers Card */}
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
            <div className="absolute top-5 right-5 text-emerald-500">
              <ArrowUpRight className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="h-10 w-10 flex items-center justify-center rounded-[10px] bg-emerald-50 mb-3">
                <Users className="w-5 h-5 text-emerald-500" strokeWidth={2} />
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-500 mb-1">
                {t('activeCarpoolDrivers')}
              </p>
              <div className="text-[32px] font-black leading-none tracking-tight text-slate-900">
                127
              </div>
              <p className="text-[12px] font-medium text-slate-400 mt-1.5">
                {t('totalRidesPeriod', { count: 425 })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Last Payout Card */}
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] relative overflow-hidden">
          <CardContent className="p-6 flex flex-col justify-between h-full min-h-[140px]">
            <div>
              <div className="h-10 w-10 flex items-center justify-center rounded-[10px] bg-purple-50 mb-3">
                <CheckCircle2
                  className="w-5 h-5 text-purple-500"
                  strokeWidth={2}
                />
              </div>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-500 mb-1">
                {t('lastPayout')}
              </p>
              <div className="text-[32px] font-black leading-none tracking-tight text-slate-900">
                ฿128,450
              </div>
              <p className="text-[12px] font-medium text-slate-400 mt-1.5">
                {t('processedDate', { date: 'March 1, 2026' })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-100/80 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2 rounded-full text-[13.5px] font-bold transition-all whitespace-nowrap ${
              activeTab === 'pending'
                ? 'bg-[#020617] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('tabPending', { count: 5 })}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2 rounded-full text-[13.5px] font-bold transition-all whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-[#020617] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('tabCompleted', { count: 2 })}
          </button>
        </div>

        <div className="relative w-full sm:w-[320px]">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400"
            strokeWidth={2}
          />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-11 h-[42px] w-full rounded-full bg-slate-50 border-slate-200/80 text-[14px] shadow-sm focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white focus-visible:ring-offset-0 font-medium placeholder:text-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Table Card */}
      <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-7 bg-white flex flex-row items-center justify-between border-b border-slate-100/50">
          <CardTitle className="text-[16px] font-bold text-foreground">
            {t('pendingPayoutsTitle')}
          </CardTitle>
          <Button className="h-[36px] rounded-[8px] bg-[#020617] hover:bg-slate-800 text-white font-semibold px-5 shadow-sm">
            {t('processAllPayouts')}
          </Button>
        </CardHeader>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header Row */}
            <div className="grid grid-cols-[2fr_1fr_2.5fr_1fr_1.5fr_1.2fr_1.2fr_100px] gap-4 px-7 py-3 border-b border-slate-100/80 bg-white">
              <div className="text-[13px] font-semibold text-slate-500">
                {t('columnRecipient')}
              </div>
              <div className="text-[13px] font-semibold text-slate-500">
                {t('columnType')}
              </div>
              <div className="text-[13px] font-semibold text-slate-500">
                {t('columnSchool')}
              </div>
              <div className="text-[13px] font-semibold text-slate-500 text-center">
                {t('columnRides')}
              </div>
              <div className="text-[13px] font-semibold text-slate-500">
                {t('columnPeriod')}
              </div>
              <div className="text-[13px] font-semibold text-slate-500 text-right">
                {t('columnAmount')}
              </div>
              <div className="text-[13px] font-semibold text-slate-500 text-center pl-2">
                {t('columnStatus')}
              </div>
              <div className="text-[13px] font-semibold text-slate-500 text-right pr-4">
                {t('columnActions')}
              </div>
            </div>

            {/* Data Rows */}
            <div className="flex flex-col bg-white">
              {pendingPayouts.map((payout, i) => (
                <div
                  key={payout.id}
                  className={`grid grid-cols-[2fr_1fr_2.5fr_1fr_1.5fr_1.2fr_1.2fr_100px] gap-4 px-7 py-4 items-center hover:bg-slate-50/50 transition-colors ${i !== pendingPayouts.length - 1 ? 'border-b border-slate-100/50' : ''}`}
                >
                  {/* Recipient */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-emerald-50 flex items-center justify-center shrink-0">
                      <Users
                        className="w-5 h-5 text-emerald-500"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-slate-900 leading-tight">
                        {payout.name}
                      </div>
                      <div className="text-[12px] text-slate-400 font-medium mt-0.5">
                        {t('idPrefix', { id: payout.id })}
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <Badge
                      variant="outline"
                      className="bg-white border-emerald-200 text-emerald-600 px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold tracking-wide"
                    >
                      {payout.type === 'Driver' ? t('typeDriver') : payout.type}
                    </Badge>
                  </div>

                  {/* School */}
                  <div className="text-[13.5px] text-slate-600 font-medium">
                    {payout.school}
                  </div>

                  {/* Rides */}
                  <div className="text-[14px] font-bold text-slate-900 text-center">
                    {payout.rides}
                  </div>

                  {/* Period */}
                  <div className="text-[13px] text-slate-500 font-medium">
                    {payout.period}
                  </div>

                  {/* Amount */}
                  <div className="text-[15px] font-black text-emerald-600 text-right">
                    {payout.amount}
                  </div>

                  {/* Status */}
                  <div className="flex justify-center pl-2">
                    <Badge
                      variant="outline"
                      className="bg-amber-50/50 border-amber-200/60 text-amber-600 px-2.5 py-1 rounded-[6px] text-[11.5px] font-bold tracking-wide flex items-center gap-1.5 shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {payout.status === 'Pending'
                        ? t('statusPending')
                        : payout.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pr-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-[30px] rounded-[6px] border-slate-200 text-slate-700 font-bold px-3 text-[12px]"
                    >
                      {t('process')}
                    </Button>
                    <button
                      type="button"
                      className="h-[30px] w-[30px] flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-[6px] transition-colors"
                    >
                      <XCircle className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {/* Payout Schedule */}
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-[15px] font-bold text-foreground">
              {t('payoutScheduleTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 text-[14px]">
            <div className="border border-slate-200/80 rounded-[12px] p-5 flex justify-between items-center bg-slate-50/50">
              <div>
                <p className="font-bold text-slate-800">{t('driverPayouts')}</p>
                <p className="text-[13px] text-slate-500 font-medium mt-1">
                  {t('biweeklySchedule')}
                </p>
              </div>
              <Badge className="bg-[#020617] hover:bg-[#020617] text-white border-none px-3 py-1 rounded-[6px] text-[11px] font-bold tracking-wide uppercase shadow-sm">
                {t('scheduleActive')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-[15px] font-bold text-foreground">
              {t('paymentMethodsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            <div className="border border-emerald-100 rounded-[12px] p-5 flex justify-between items-center bg-white shadow-sm">
              <div>
                <p className="font-bold text-slate-800 text-[14px]">
                  {t('bankTransfer')}
                </p>
                <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                  {t('primaryMethod')}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500"
                  strokeWidth={3}
                />
              </div>
            </div>

            <div className="border border-emerald-100 rounded-[12px] p-5 flex justify-between items-center bg-white shadow-sm">
              <div>
                <p className="font-bold text-slate-800 text-[14px]">
                  {t('promptPay')}
                </p>
                <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                  {t('promptPayDesc')}
                </p>
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                <CheckCircle2
                  className="w-3.5 h-3.5 text-emerald-500"
                  strokeWidth={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
