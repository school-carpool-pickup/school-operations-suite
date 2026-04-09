'use client';

import { ArrowUpCircle, CheckCircle2, Car, GraduationCap, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function StaffDashboardPage() {
  const recentPickups = [
    {
      queue: 'A-004',
      status: 'queued',
      isCarpool: true,
      students: 'Oliver Anderson',
      parentInfo: 'David Anderson • คง-9012',
    },
    {
      queue: 'A-003',
      status: 'ready',
      isCarpool: false,
      students: 'Hana Nakamura, Ren Nakamura',
      parentInfo: 'Yuki Nakamura • จฉ-3456',
    },
    {
      queue: null,
      status: 'pending',
      isCarpool: false,
      students: 'Aarav Patel',
      parentInfo: 'Priya Patel • Taxi #4521',
    }
  ];

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-foreground">Dashboard</h2>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Active Card */}
        <Card className="shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-blue-200/60 rounded-[14px] overflow-hidden">
          <CardContent className="p-4.5 px-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-[10px] bg-blue-50 flex items-center justify-center shrink-0">
              <ArrowUpCircle className="h-5 w-5 text-blue-500" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold text-muted-foreground/80 tracking-wide uppercase">Active</span>
              <span className="text-[22px] font-black text-blue-600 leading-none mt-1">3</span>
            </div>
          </CardContent>
        </Card>

        {/* Completed Card */}
        <Card className="shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-emerald-200/60 rounded-[14px] overflow-hidden">
          <CardContent className="p-4.5 px-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-[10px] bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold text-muted-foreground/80 tracking-wide uppercase">Completed</span>
              <span className="text-[22px] font-black text-emerald-600 leading-none mt-1">2</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Today Card */}
        <Card className="shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-border/60 rounded-[14px] overflow-hidden">
          <CardContent className="p-4.5 px-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-[10px] bg-muted/50 flex items-center justify-center shrink-0 border border-border/40">
              <Car className="h-5 w-5 text-muted-foreground/70" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold text-muted-foreground/80 tracking-wide uppercase">Total Today</span>
              <span className="text-[22px] font-black text-foreground/90 leading-none mt-1">7</span>
            </div>
          </CardContent>
        </Card>

        {/* Students Card */}
        <Card className="shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-border/60 rounded-[14px] overflow-hidden">
          <CardContent className="p-4.5 px-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-[10px] bg-purple-50 flex items-center justify-center shrink-0">
              <GraduationCap className="h-5 w-5 text-purple-500" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold text-muted-foreground/80 tracking-wide uppercase">Students</span>
              <span className="text-[22px] font-black text-purple-600 leading-none mt-1">9</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pickup Management Banner */}
      <div className="rounded-[16px] border border-blue-100/80 bg-[#f8fafc] p-6 flex items-center justify-between shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
        <div className="space-y-1">
          <h3 className="text-[16px] font-bold text-foreground">Pickup Management</h3>
          <p className="text-[13.5px] text-muted-foreground/90 font-medium">Mark, unmark, and manage today's pickups by ID or student name.</p>
        </div>
        <Link href="/staff/pickups">
          <Button className="h-10 px-5 rounded-[10px] bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-sm border-0">
            Open Pickups <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Active Pickups List */}
      <div className="rounded-[16px] border border-border/60 bg-white shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-bold text-foreground">Active Pickups</h3>
          <Link href="/staff/pickups">
            <Button variant="outline" className="h-8 rounded-[8px] px-4 text-[12px] font-bold text-muted-foreground hover:text-foreground">
              View All
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {recentPickups.map((pickup, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-[14px] border border-border/60 p-4.5 px-5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-border/80 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  {pickup.queue ? (
                    <span className="font-bold text-[16px] text-foreground">{pickup.queue}</span>
                  ) : null}
                  
                  {pickup.status === 'queued' ? (
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-none px-2 py-0.5 rounded-[6px] font-bold text-[10.5px] tracking-wide">
                      queued
                    </Badge>
                  ) : pickup.status === 'ready' ? (
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 border-none px-2 py-0.5 rounded-[6px] font-bold text-[10.5px] tracking-wide">
                      ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-none px-2 py-0.5 rounded-[6px] font-bold text-[10.5px] tracking-wide">
                      pending
                    </Badge>
                  )}

                  {pickup.isCarpool && (
                    <Badge variant="outline" className="bg-purple-50/50 text-purple-500 border-none px-2 py-0.5 rounded-[6px] font-bold text-[10.5px] tracking-wide flex items-center gap-1">
                       <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                       Carpool
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-foreground/90">{pickup.students}</span>
                  <span className="text-[12.5px] text-muted-foreground/80 mt-0.5 font-medium">{pickup.parentInfo}</span>
                </div>
              </div>

              <Link href="/staff/pickups">
                <Button className="h-[38px] px-4 rounded-[10px] bg-[#10B981] hover:bg-[#059669] text-white font-bold gap-2 shadow-sm border-0 transition-all">
                  <CheckCircle className="h-4 w-4" /> Manage
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
