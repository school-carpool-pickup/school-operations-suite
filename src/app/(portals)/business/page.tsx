'use client';

import { 
  Building2, DollarSign, Users, Car, Download, 
  ArrowUpRight, ArrowDownRight, ArrowRight, ChevronRight,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function BusinessDashboardPage() {
  const metricCards = [
    {
      title: 'Total Revenue (All Schools)',
      value: '฿487,500',
      subtitle: 'Last 30 days',
      trend: '+12.5%',
      trendType: 'positive',
      icon: DollarSign,
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      title: 'Active Schools',
      value: '12',
      subtitle: 'On platform',
      trend: '+2 new',
      trendType: 'positive',
      icon: Building2,
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Platform Users',
      value: '4,567',
      subtitle: 'Active parents',
      trend: '+15.2%',
      trendType: 'positive',
      icon: Users,
      iconColor: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Daily Pickups (All Schools)',
      value: '1,234',
      subtitle: 'Today',
      trend: '-2.1%',
      trendType: 'negative',
      icon: Car,
      iconColor: 'bg-orange-100 text-orange-600',
    }
  ];

  const schools = [
    { name: 'International School Bangkok', status: 'active', students: 850, pickups: 342, carpools: 127, revenue: '฿127,500', growth: '+12%' },
    { name: 'Bangkok Prep School', status: 'active', students: 620, pickups: 248, carpools: 95, revenue: '฿95,000', growth: '+8%' },
    { name: 'NIST International School', status: 'active', students: 740, pickups: 296, carpools: 112, revenue: '฿112,000', growth: '+15%' },
    { name: 'Shrewsbury International', status: 'active', students: 480, pickups: 192, carpools: 73, revenue: '฿73,000', growth: '+5%' },
    { name: 'KIS International', status: 'active', students: 550, pickups: 156, carpools: 59, revenue: '฿80,000', growth: '-3%' },
  ];

  const breakdownData = [
    { label: 'Carpool Transactions', amount: '฿340,000', percent: '70% of total revenue', color: 'bg-blue-500', width: '70%' },
    { label: 'Platform Fees', amount: '฿97,500', percent: '20% of total revenue', color: 'bg-[#10b981]', width: '20%' },
    { label: 'Premium Features', amount: '฿50,000', percent: '10% of total revenue', color: 'bg-[#a855f7]', width: '10%' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-foreground">Business Dashboard</h2>
          <p className="text-[14px] text-muted-foreground mt-0.5 font-medium">Platform-wide analytics and performance metrics</p>
        </div>
        <Button variant="outline" className="h-[38px] rounded-[8px] bg-white text-slate-700 shadow-sm border-slate-200 hover:bg-slate-50 font-semibold px-4 flex items-center gap-2">
          <Download className="w-4 h-4 text-slate-500" strokeWidth={2.5} /> Export Report
        </Button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((card, i) => (
          <Card key={i} className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardContent className="p-5 flex flex-col justify-between h-[130px]">
              <div className="flex justify-between items-start">
                <div className={`h-[42px] w-[42px] flex items-center justify-center rounded-[10px] ${card.iconColor}`}>
                  <card.icon className="h-[20px] w-[20px]" strokeWidth={2} />
                </div>
                <div className={`flex items-center gap-1 text-[13px] font-bold ${
                  card.trendType === 'positive' ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {card.trendType === 'positive' ? <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={3} /> : <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={3} />}
                  {card.trend}
                </div>
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground font-medium mb-0.5">{card.title}</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-[26px] font-black leading-none tracking-tight text-foreground">{card.value}</h3>
                  <p className="text-[12px] text-muted-foreground/80 font-medium pb-0.5">{card.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6 w-full">
          {/* School Performance */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-5 px-6 border-b border-slate-100">
              <CardTitle className="text-[16px] font-bold text-foreground">School Performance</CardTitle>
              <Button variant="outline" className="h-8 text-[12.5px] rounded-[6px] font-semibold border-slate-200 text-slate-700">View All Schools</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-slate-100/80 bg-slate-50/50">
                    <TableHead className="py-3 px-6 text-[12.5px] font-semibold text-slate-500 w-[35%]">School Name</TableHead>
                    <TableHead className="py-3 px-4 text-[12.5px] font-semibold text-slate-500 text-center">Students</TableHead>
                    <TableHead className="py-3 px-4 text-[12.5px] font-semibold text-slate-500 text-center">Daily Pickups</TableHead>
                    <TableHead className="py-3 px-4 text-[12.5px] font-semibold text-slate-500 text-center">Carpools</TableHead>
                    <TableHead className="py-3 px-4 text-[12.5px] font-semibold text-slate-500 text-right">Revenue</TableHead>
                    <TableHead className="py-3 px-6 text-[12.5px] font-semibold text-slate-500 text-right">Growth</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school, i) => (
                    <TableRow key={i} className={`border-b-slate-100/50 hover:bg-slate-50/80 ${i === schools.length - 1 ? 'border-0' : ''}`}>
                      <TableCell className="py-4 px-6 flex items-center gap-3">
                        <div className="h-10 w-10 flex shrink-0 items-center justify-center rounded-[10px] bg-blue-50 text-blue-500">
                          <Building2 className="h-[20px] w-[20px]" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-[14px] text-foreground">{school.name}</span>
                          <Badge variant="outline" className="w-fit text-[10px] py-0 px-2 h-4.5 font-bold bg-slate-100 text-slate-600 border-none rounded-[5px] uppercase tracking-wider">{school.status}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-[14px] text-slate-600 font-medium text-center">{school.students}</TableCell>
                      <TableCell className="py-4 px-4 text-[14.5px] font-bold text-foreground text-center">{school.pickups}</TableCell>
                      <TableCell className="py-4 px-4 text-[14px] font-bold text-blue-600 text-center">{school.carpools}</TableCell>
                      <TableCell className="py-4 px-4 text-[14.5px] font-bold text-emerald-600 text-right">{school.revenue}</TableCell>
                      <TableCell className={`py-4 px-6 text-[14px] font-bold text-right ${school.growth.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
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
              <CardTitle className="text-[16px] font-bold text-foreground">Revenue Breakdown (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="px-7 pb-7 space-y-6">
              {breakdownData.map((item, i) => (
                <div key={i} className="space-y-2.5">
                  <div className="flex justify-between items-center text-[14.5px] mb-1">
                    <span className="font-bold text-slate-700">{item.label}</span>
                    <span className="font-black text-foreground">{item.amount}</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100/80 rounded-full overflow-hidden border border-slate-200/40">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.width }} />
                  </div>
                  <p className="text-[12.5px] text-slate-500 font-medium">{item.percent}</p>
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
              <CardTitle className="text-[16px] font-bold text-foreground">Upcoming Payouts</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              
              {/* Total Pending Card */}
              <div className="bg-orange-50/70 border border-orange-100 rounded-[12px] p-5">
                <p className="text-[13px] font-semibold text-slate-600 mb-1">Total Pending</p>
                <div className="text-[28px] font-black text-primary tracking-tight">฿145,800</div>
                <p className="text-[12.5px] text-slate-500 font-medium mt-1">Scheduled: March 15, 2026</p>
              </div>

              {/* Sub-payouts */}
              <div className="border border-slate-200/80 rounded-[12px] p-4 flex justify-between items-center bg-white shadow-sm">
                <div>
                  <p className="text-[13.5px] font-bold text-slate-800">Driver Payouts</p>
                  <p className="text-[12px] text-slate-500 font-medium mt-0.5">90% of carpool revenue</p>
                </div>
                <div className="text-[15px] font-bold text-emerald-600">฿131,220</div>
              </div>

              <div className="border border-slate-200/80 rounded-[12px] p-4 flex justify-between items-center bg-white shadow-sm">
                <div>
                  <p className="text-[13.5px] font-bold text-slate-800">School Commissions</p>
                  <p className="text-[12px] text-slate-500 font-medium mt-0.5">10% of carpool revenue</p>
                </div>
                <div className="text-[15px] font-bold text-blue-600">฿14,580</div>
              </div>

              <Button className="w-full h-[42px] rounded-[10px] mt-2 bg-[#020617] hover:bg-slate-800 text-white font-bold text-[13.5px]">
                View All Payouts
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="text-[16px] font-bold text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <Button variant="outline" className="w-full justify-start h-[44px] rounded-[10px] font-semibold text-slate-700 border-slate-200/80 hover:bg-slate-50 shadow-sm text-[13.5px]">
                <Building2 className="w-[18px] h-[18px] mr-3 opacity-70" /> Add New School
              </Button>
              <Button variant="outline" className="w-full justify-start h-[44px] rounded-[10px] font-semibold text-slate-700 border-slate-200/80 hover:bg-slate-50 shadow-sm text-[13.5px]">
                <DollarSign className="w-[18px] h-[18px] mr-3 opacity-70" /> Process Payouts
              </Button>
              <Button variant="outline" className="w-full justify-start h-[44px] rounded-[10px] font-semibold text-slate-700 border-slate-200/80 hover:bg-slate-50 shadow-sm text-[13.5px]">
                <Users className="w-[18px] h-[18px] mr-3 opacity-70" /> View All Users
              </Button>
            </CardContent>
          </Card>

          {/* Carpool Pricing Model */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-5 px-6">
              <CardTitle className="text-[16px] font-bold text-foreground">Carpool Pricing Model</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <div className="bg-[#eff6ff] rounded-[12px] p-5">
                <p className="text-[13.5px] font-semibold text-slate-600 mb-1">Fixed Price per Trip</p>
                <div className="text-[34px] font-black text-blue-600 tracking-tight leading-none">฿300</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200/80 bg-white rounded-[10px] p-4 shadow-sm">
                  <p className="text-[12.5px] font-semibold text-slate-600 mb-1">Driver Gets</p>
                  <div className="text-[16px] font-black text-emerald-600 leading-none">฿270</div>
                  <p className="text-[11.5px] text-slate-400 font-medium mt-1.5">90%</p>
                </div>
                <div className="border border-slate-200/80 bg-white rounded-[10px] p-4 shadow-sm">
                  <p className="text-[12.5px] font-semibold text-slate-600 mb-1">Platform Fee</p>
                  <div className="text-[16px] font-black text-[#a855f7] leading-none">฿30</div>
                  <p className="text-[11.5px] text-slate-400 font-medium mt-1.5">10%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
