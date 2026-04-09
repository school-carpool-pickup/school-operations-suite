'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, Users, Search, Plus, MapPin, CheckCircle2, 
  XCircle, AlertCircle, Settings
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const schools = [
  {
    id: 1,
    name: 'International School Bangkok',
    address: '123 Sukhumvit Road, Bangkok 10110',
    status: 'Active',
    apiConnected: true,
    lanesConfigured: true,
    stats: { students: '850', parents: '1,234', pickups: '342', carpools: '127', revenue: '฿127,500', growth: '+12%' },
    lanes: ['Lane A: Grades 1, 2, 3', 'Lane B: Grades 4, 5, 6', 'Lane C: Grades 7, 8, 9', 'Lane D: Grades 10, 11, 12']
  },
  {
    id: 2,
    name: 'Bangkok Prep School',
    address: '456 Rama IV Road, Bangkok 10120',
    status: 'Active',
    apiConnected: true,
    lanesConfigured: true,
    stats: { students: '620', parents: '890', pickups: '248', carpools: '95', revenue: '฿95,000', growth: '+8%' },
    lanes: ['Lane A: Grades 1, 2, 3, 4', 'Lane B: Grades 5, 6, 7, 8', 'Lane C: Grades 9, 10, 11, 12']
  },
  {
    id: 3,
    name: 'NIST International School',
    address: '789 Sathorn Road, Bangkok 10120',
    status: 'Active',
    apiConnected: false,
    lanesConfigured: true,
    stats: { students: '740', parents: '1,067', pickups: '296', carpools: '112', revenue: '฿112,000', growth: '+15%' },
    lanes: ['Lane A: Grades 0, 1, 2', 'Lane B: Grades 3, 4, 5', 'Lane C: Grades 6, 7, 8', 'Lane D: Grades 9, 10, 11, 12']
  },
  {
    id: 4,
    name: 'Shrewsbury International',
    address: '321 Charoenkrung Road, Bangkok 10500',
    status: 'Active',
    apiConnected: true,
    lanesConfigured: false,
    stats: { students: '480', parents: '692', pickups: '192', carpools: '73', revenue: '฿73,000', growth: '+5%' },
    lanes: []
  },
  {
    id: 5,
    name: 'KIS International',
    address: '654 Petchburi Road, Bangkok 10400',
    status: 'Pending Setup',
    apiConnected: false,
    lanesConfigured: false,
    stats: { students: '550', parents: '793', pickups: '156', carpools: '59', revenue: '฿80,000', growth: '-3%' },
    lanes: []
  }
];

export default function SchoolCRMPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-foreground">School CRM</h2>
          <p className="text-[14px] text-muted-foreground mt-1 font-medium">Manage schools on the SafePickup platform</p>
        </div>
        <Link href="/business/schools/new">
          <Button className="h-[40px] rounded-[10px] bg-[#020617] hover:bg-slate-800 text-white shadow-sm font-semibold px-5 flex items-center gap-2">
            <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} /> Add New School
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" strokeWidth={2} />
          <Input 
            placeholder="Search schools..." 
            className="pl-10 h-[44px] w-full rounded-[10px] bg-slate-100 border-transparent text-[14px] shadow-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-slate-100 focus-visible:ring-offset-0 font-medium placeholder:text-slate-500 transition-colors"
          />
        </div>
        <Button variant="outline" className="h-[44px] rounded-[10px] font-semibold text-slate-700 border-slate-200/80 bg-white shadow-sm px-4">
          All Schools (5)
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13.5px] font-semibold text-slate-500 mb-0.5">Total Schools</span>
              <span className="text-[28px] font-black text-foreground leading-none tracking-tight">5</span>
            </div>
            <div className="h-[42px] w-[42px] rounded-full flex items-center justify-center bg-blue-50/50">
               <Building2 className="w-5 h-5 text-blue-600" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13.5px] font-semibold text-slate-500 mb-0.5">Active Schools</span>
              <span className="text-[28px] font-black text-foreground leading-none tracking-tight">4</span>
            </div>
            <div className="h-[42px] w-[42px] rounded-full flex items-center justify-center bg-emerald-50/50">
               <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13.5px] font-semibold text-slate-500 mb-0.5">Total Students</span>
              <span className="text-[28px] font-black text-foreground leading-none tracking-tight">3,240</span>
            </div>
            <div className="h-[42px] w-[42px] rounded-full flex items-center justify-center bg-purple-50/50">
               <Users className="w-5 h-5 text-purple-600" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13.5px] font-semibold text-slate-500 mb-0.5">Setup Incomplete</span>
              <span className="text-[28px] font-black text-foreground leading-none tracking-tight">3</span>
            </div>
            <div className="h-[42px] w-[42px] rounded-full flex items-center justify-center bg-orange-50/50">
               <AlertCircle className="w-[22px] h-[22px] text-orange-500" strokeWidth={2.5} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schools List */}
      <div className="space-y-4">
        {schools.map(school => (
          <Card key={school.id} className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
            <CardContent className="p-0">
              
              {/* Card Header Row */}
              <div className="p-6 pb-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-[12px] bg-[#eff6ff] flex shrink-0 items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" strokeWidth={2} />
                  </div>
                  <div className="flex flex-col gap-1.5 mt-0.5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[18px] font-bold tracking-tight text-slate-900 leading-none">{school.name}</h3>
                      <Badge 
                        variant="secondary" 
                        className={`font-semibold rounded-[6px] px-2.5 h-[22px] text-[11.5px] ${
                          school.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50' 
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-50'
                        }`}
                      >
                        {school.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[13.5px] text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5" />
                      {school.address}
                    </div>

                    <div className="flex items-center gap-5 mt-1 text-[13px] font-semibold">
                      <div className="flex items-center gap-1.5">
                        {school.apiConnected ? (
                          <><CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2.5} /><span className="text-slate-600">API Connected</span></>
                        ) : (
                          <><XCircle className="w-4 h-4 text-red-500" strokeWidth={2.5} /><span className="text-slate-600">API Not Connected</span></>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {school.lanesConfigured ? (
                          <><CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={2.5} /><span className="text-slate-600">Lanes Configured</span></>
                        ) : (
                          <><XCircle className="w-4 h-4 text-red-500" strokeWidth={2.5} /><span className="text-slate-600">Lanes Not Configured</span></>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link href={`/business/schools/${school.id}`}>
                    <Button variant="outline" size="sm" className="h-[36px] rounded-[8px] border-slate-200 text-slate-700 font-semibold px-4">
                      <Settings className="w-4 h-4 mr-2" /> Settings
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="h-px w-full bg-slate-100/80" />

              {/* Stats Row */}
              <div className="p-6 py-5">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                  <div className="flex flex-col">
                    <span className="text-[12.5px] font-semibold text-slate-400 mb-1">Students</span>
                    <span className="text-[18px] font-black text-slate-800">{school.stats.students}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12.5px] font-semibold text-slate-400 mb-1">Parents</span>
                    <span className="text-[18px] font-black text-slate-800">{school.stats.parents}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12.5px] font-semibold text-slate-400 mb-1">Daily Pickups</span>
                    <span className="text-[18px] font-black text-blue-600">{school.stats.pickups}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12.5px] font-semibold text-slate-400 mb-1">Carpools</span>
                    <span className="text-[18px] font-black text-[#a855f7]">{school.stats.carpools}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12.5px] font-semibold text-slate-400 mb-1">Revenue</span>
                    <span className="text-[18px] font-black text-emerald-600">{school.stats.revenue}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12.5px] font-semibold text-slate-400 mb-1">Growth</span>
                    <span className={`text-[18px] font-black ${school.stats.growth.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {school.stats.growth}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lanes Configuration (Conditional) */}
              {school.lanes.length > 0 && (
                <>
                  <div className="h-px w-full bg-slate-100/80" />
                  <div className="p-6 py-5 bg-white">
                    <p className="text-[13px] font-bold text-slate-700 mb-3">Pickup Lanes Configuration:</p>
                    <div className="flex flex-wrap gap-2">
                      {school.lanes.map((lane, i) => (
                        <div key={i} className="text-[12.5px] font-semibold px-3 py-1.5 rounded-[8px] border border-slate-200/80 bg-slate-50 text-slate-600 shadow-sm">
                          {lane}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
