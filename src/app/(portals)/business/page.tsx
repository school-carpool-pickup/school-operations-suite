'use client';

import {
  Building2,
  Car,
  DollarSign,
  Download,
  Info,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { apiKeys, useApi } from '@/lib/api';
import type { AnalyticsSummaryResponse } from '@/types';

export default function BusinessDashboardPage() {
  const t = useTranslations('Business.Dashboard');

  // KAN-18: metric cards read GET /v1/analytics/summary through the
  // dispatcher (fixture-backed until the backend module ships).
  const summaryQuery = useApi<AnalyticsSummaryResponse>(
    apiKeys.analytics.summary(),
  );
  const summary = summaryQuery.data?.data;
  const metric = (value: number | undefined, prefix = ''): string =>
    value === undefined ? '—' : `${prefix}${value.toLocaleString('en-US')}`;

  const metricCards = [
    {
      title: t('metricRevenueTitle'),
      value: metric(summary?.total_revenue, '฿'),
      subtitle: t('metricRevenueSubtitle'),
      icon: DollarSign,
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      title: t('metricSchoolsTitle'),
      value: metric(summary?.total_schools),
      subtitle: t('metricSchoolsSubtitle'),
      icon: Building2,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      title: t('metricUsersTitle'),
      value: metric(summary?.total_users),
      subtitle: t('metricUsersSubtitle'),
      icon: Users,
      iconColor: 'bg-purple-100 text-purple-600',
    },
    {
      title: t('metricPickupsTitle'),
      value: metric(summary?.total_pickups),
      subtitle: t('metricPickupsSubtitle'),
      icon: Car,
      iconColor: 'bg-orange-100 text-orange-600',
    },
  ];

  const schools = [
    {
      name: 'International School Bangkok',
      status: 'active',
      students: 850,
      pickups: 342,
      carpools: 127,
      revenue: '฿127,500',
      growth: '+12%',
    },
    {
      name: 'Bangkok Prep School',
      status: 'active',
      students: 620,
      pickups: 248,
      carpools: 95,
      revenue: '฿95,000',
      growth: '+8%',
    },
    {
      name: 'NIST International School',
      status: 'active',
      students: 740,
      pickups: 296,
      carpools: 112,
      revenue: '฿112,000',
      growth: '+15%',
    },
    {
      name: 'Shrewsbury International',
      status: 'active',
      students: 480,
      pickups: 192,
      carpools: 73,
      revenue: '฿73,000',
      growth: '+5%',
    },
    {
      name: 'KIS International',
      status: 'active',
      students: 550,
      pickups: 156,
      carpools: 59,
      revenue: '฿80,000',
      growth: '-3%',
    },
  ];

  const breakdownData = [
    {
      label: t('carpoolTransactions'),
      amount: '฿340,000',
      percent: t('percentOfTotal', { percent: 70 }),
      color: 'bg-blue-500',
      width: '70%',
    },
    {
      label: t('platformFees'),
      amount: '฿97,500',
      percent: t('percentOfTotal', { percent: 20 }),
      color: 'bg-[#10b981]',
      width: '20%',
    },
    {
      label: t('premiumFeatures'),
      amount: '฿50,000',
      percent: t('percentOfTotal', { percent: 10 }),
      color: 'bg-[#a855f7]',
      width: '10%',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-foreground">
            {t('title')}
          </h2>
          <p className="text-[14px] text-muted-foreground mt-0.5 font-medium">
            {t('subtitle')}
          </p>
        </div>
        <Button
          variant="outline"
          className="h-[38px] rounded-[8px] bg-white text-slate-700 shadow-sm border-slate-200 hover:bg-slate-50 font-semibold px-4 flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-slate-500" strokeWidth={2.5} />{' '}
          {t('exportReport')}
        </Button>
      </div>

      {/* Top Metrics Grid — backed by GET /v1/analytics/summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <Card
            key={card.title}
            className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]"
          >
            <CardContent className="p-5 flex flex-col justify-between h-[130px]">
              <div className="flex justify-between items-start">
                <div
                  className={`h-[42px] w-[42px] flex items-center justify-center rounded-[10px] ${card.iconColor}`}
                >
                  <card.icon className="h-[20px] w-[20px]" strokeWidth={2} />
                </div>
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground font-medium mb-0.5">
                  {card.title}
                </p>
                <div className="flex items-end justify-between">
                  <h3 className="text-[26px] font-black leading-none tracking-tight text-foreground">
                    {card.value}
                  </h3>
                  <p className="text-[12px] text-muted-foreground/80 font-medium pb-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sections below still render demo data — no backend module yet. */}
      <div className="bg-amber-50/80 border border-amber-200/70 rounded-[12px] p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
          {t('staticSectionsNote')}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6 w-full">
          {/* School Performance */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-5 px-6 border-b border-slate-100">
              <CardTitle className="text-[16px] font-bold text-foreground">
                {t('schoolPerformance')}
              </CardTitle>
              <Button
                variant="outline"
                className="h-8 text-[12.5px] rounded-[6px] font-semibold border-slate-200 text-slate-700"
              >
                {t('viewAllSchools')}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-slate-100/80 bg-slate-50/50">
                    <TableHead className="py-3 px-6 text-[12.5px] font-semibold text-slate-500 w-[35%]">
                      {t('columnSchoolName')}
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[12.5px] font-semibold text-slate-500 text-center">
                      {t('columnStudents')}
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[12.5px] font-semibold text-slate-500 text-center">
                      {t('columnDailyPickups')}
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[12.5px] font-semibold text-slate-500 text-center">
                      {t('columnCarpools')}
                    </TableHead>
                    <TableHead className="py-3 px-4 text-[12.5px] font-semibold text-slate-500 text-right">
                      {t('columnRevenue')}
                    </TableHead>
                    <TableHead className="py-3 px-6 text-[12.5px] font-semibold text-slate-500 text-right">
                      {t('columnGrowth')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school, i) => (
                    <TableRow
                      key={school.name}
                      className={`border-b-slate-100/50 hover:bg-slate-50/80 ${i === schools.length - 1 ? 'border-0' : ''}`}
                    >
                      <TableCell className="py-4 px-6 flex items-center gap-3">
                        <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-[10px] bg-blue-50 text-blue-500">
                          <Building2 className="h-[20px] w-[20px]" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-[14px] text-foreground">
                            {school.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="w-fit text-[10px] py-0 px-2 h-4.5 font-bold bg-slate-100 text-slate-600 border-none rounded-[5px] uppercase tracking-wider"
                          >
                            {school.status === 'active'
                              ? t('statusActive')
                              : school.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-[14px] text-slate-600 font-medium text-center">
                        {school.students}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-[14.5px] font-bold text-foreground text-center">
                        {school.pickups}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-[14px] font-bold text-blue-600 text-center">
                        {school.carpools}
                      </TableCell>
                      <TableCell className="py-4 px-4 text-[14.5px] font-bold text-emerald-600 text-right">
                        {school.revenue}
                      </TableCell>
                      <TableCell
                        className={`py-4 px-6 text-[14px] font-bold text-right ${school.growth.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}
                      >
                        {school.growth}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Revenue Breakdown */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-5 pt-6 px-7">
              <CardTitle className="text-[16px] font-bold text-foreground">
                {t('revenueBreakdown')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-7 pb-7 space-y-6">
              {breakdownData.map((item) => (
                <div key={item.label} className="space-y-2.5">
                  <div className="flex justify-between items-center text-[14.5px] mb-1">
                    <span className="font-bold text-slate-700">
                      {item.label}
                    </span>
                    <span className="font-black text-foreground">
                      {item.amount}
                    </span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100/80 rounded-full overflow-hidden border border-slate-200/40">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: item.width }}
                    />
                  </div>
                  <p className="text-[12.5px] text-slate-500 font-medium">
                    {item.percent}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6 w-full relative">
          {/* Upcoming Payouts */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-[16px] font-bold text-foreground">
                {t('upcomingPayouts')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {/* Total Pending Card */}
              <div className="bg-orange-50/70 border border-orange-100 rounded-[12px] p-5">
                <p className="text-[13px] font-semibold text-slate-600 mb-1">
                  {t('totalPending')}
                </p>
                <div className="text-[28px] font-black text-primary tracking-tight">
                  ฿145,800
                </div>
                <p className="text-[12.5px] text-slate-500 font-medium mt-1">
                  {t('scheduledOn', { date: 'March 15, 2026' })}
                </p>
              </div>

              {/* Sub-payouts */}
              <div className="border border-slate-200/80 rounded-[12px] p-4 flex justify-between items-center bg-white shadow-sm">
                <div>
                  <p className="text-[13.5px] font-bold text-slate-800">
                    {t('driverPayouts')}
                  </p>
                  <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                    {t('driverPayoutsDesc')}
                  </p>
                </div>
                <div className="text-[15px] font-bold text-emerald-600">
                  ฿131,220
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-[12px] p-4 flex justify-between items-center bg-white shadow-sm">
                <div>
                  <p className="text-[13.5px] font-bold text-slate-800">
                    {t('schoolCommissions')}
                  </p>
                  <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                    {t('schoolCommissionsDesc')}
                  </p>
                </div>
                <div className="text-[15px] font-bold text-blue-600">
                  ฿14,580
                </div>
              </div>

              <Button className="w-full h-[42px] rounded-[10px] mt-2 bg-[#020617] hover:bg-slate-800 text-white font-bold text-[13.5px]">
                {t('viewAllPayouts')}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="text-[16px] font-bold text-foreground">
                {t('quickActions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start h-[44px] rounded-[10px] font-semibold text-slate-700 border-slate-200/80 hover:bg-slate-50 shadow-sm text-[13.5px]"
              >
                <Building2 className="w-[18px] h-[18px] mr-3 opacity-70" />{' '}
                {t('addNewSchool')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-[44px] rounded-[10px] font-semibold text-slate-700 border-slate-200/80 hover:bg-slate-50 shadow-sm text-[13.5px]"
              >
                <DollarSign className="w-[18px] h-[18px] mr-3 opacity-70" />{' '}
                {t('processPayouts')}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-[44px] rounded-[10px] font-semibold text-slate-700 border-slate-200/80 hover:bg-slate-50 shadow-sm text-[13.5px]"
              >
                <Users className="w-[18px] h-[18px] mr-3 opacity-70" />{' '}
                {t('viewAllUsers')}
              </Button>
            </CardContent>
          </Card>

          {/* Carpool Pricing Model */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-5 px-6">
              <CardTitle className="text-[16px] font-bold text-foreground">
                {t('carpoolPricingModel')}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <div className="bg-[#eff6ff] rounded-[12px] p-5">
                <p className="text-[13.5px] font-semibold text-slate-600 mb-1">
                  {t('fixedPricePerTrip')}
                </p>
                <div className="text-[34px] font-black text-blue-600 tracking-tight leading-none">
                  ฿300
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200/80 bg-white rounded-[10px] p-4 shadow-sm">
                  <p className="text-[12.5px] font-semibold text-slate-600 mb-1">
                    {t('driverGets')}
                  </p>
                  <div className="text-[16px] font-black text-emerald-600 leading-none">
                    ฿270
                  </div>
                  <p className="text-[11.5px] text-slate-400 font-medium mt-1.5">
                    90%
                  </p>
                </div>
                <div className="border border-slate-200/80 bg-white rounded-[10px] p-4 shadow-sm">
                  <p className="text-[12.5px] font-semibold text-slate-600 mb-1">
                    {t('platformFee')}
                  </p>
                  <div className="text-[16px] font-black text-[#a855f7] leading-none">
                    ฿30
                  </div>
                  <p className="text-[11.5px] text-slate-400 font-medium mt-1.5">
                    10%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
