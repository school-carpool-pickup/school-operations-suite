'use client';

import { useState } from 'react';
import { 
  ArrowUpCircle, CheckCircle2, Car, GraduationCap, 
  CheckCircle, Clock, Search, Hash, MapPin, User, XCircle 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';

export default function PickupManagementPage() {
  const [quickMarkOpen, setQuickMarkOpen] = useState(false);
  const [markType, setMarkType] = useState<'id' | 'student'>('id');
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'other'>('active');

  const [pickups, setPickups] = useState([
    {
      id: 'PU-20260224-004',
      queue: 'A-003',
      status: 'ready',
      isCarpool: false,
      students: ['Hana Nakamura', 'Ren Nakamura'],
      parent: 'Yuki Nakamura',
      plate: 'จฉ-3456',
      lane: 'Lane A',
      started: '02:55 PM',
      colorBg: 'bg-purple-50/10',
      colorBorder: 'border-purple-200/50'
    },
    {
      id: 'PU-20260224-003',
      queue: 'A-004',
      status: 'queued',
      isCarpool: true,
      carpoolExtra: '+Mia Chen',
      students: ['Oliver Anderson'],
      parent: 'David Anderson',
      plate: 'คง-9012',
      lane: 'Lane A',
      started: '03:00 PM',
      colorBg: 'bg-blue-50/10',
      colorBorder: 'border-blue-200/50'
    },
    {
      id: 'PU-20260224-005',
      queue: null,
      status: 'pending',
      carType: 'Taxi',
      students: ['Aarav Patel'],
      parent: 'Priya Patel',
      plate: 'Taxi #4521',
      lane: null,
      started: '03:10 PM',
      colorBg: 'bg-amber-50/20',
      colorBorder: 'border-yellow-200/50'
    }
  ]);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setPickups((prev) => prev.map(p => {
      if (p.id === id) {
        let bgStyle = p.colorBg;
        let borderStyle = p.colorBorder;
        
        if (newStatus === 'ready') {
          bgStyle = 'bg-purple-50/10';
          borderStyle = 'border-purple-200/50';
        } else if (newStatus === 'completed') {
          bgStyle = 'bg-emerald-50/10';
          borderStyle = 'border-emerald-200/50';
        }
        
        return { ...p, status: newStatus, colorBg: bgStyle, colorBorder: borderStyle };
      }
      return p;
    }));
  };

  const filteredPickups = pickups.filter(p => {
    if (activeTab === 'active') return p.status !== 'completed';
    if (activeTab === 'completed') return p.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-foreground">Pickup Management</h2>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Pending Card */}
        <Card className="shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-yellow-200/60 rounded-[14px] overflow-hidden">
          <CardContent className="p-4.5 px-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-[10px] bg-amber-50 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-500" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold text-muted-foreground/80 tracking-wide uppercase">Pending</span>
              <span className="text-[22px] font-black text-amber-600 leading-none mt-1">1</span>
            </div>
          </CardContent>
        </Card>

        {/* In Queue Card */}
        <Card className="shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-blue-200/60 rounded-[14px] overflow-hidden">
          <CardContent className="p-4.5 px-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-[10px] bg-blue-50 flex items-center justify-center shrink-0">
              <ArrowUpCircle className="h-5 w-5 text-blue-500" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold text-muted-foreground/80 tracking-wide uppercase">In Queue</span>
              <span className="text-[22px] font-black text-blue-600 leading-none mt-1">1</span>
            </div>
          </CardContent>
        </Card>

        {/* Ready Card */}
        <Card className="shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-purple-200/60 rounded-[14px] overflow-hidden">
          <CardContent className="p-4.5 px-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-[10px] bg-purple-50 flex items-center justify-center shrink-0">
              <Car className="h-5 w-5 text-purple-500" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12.5px] font-semibold text-muted-foreground/80 tracking-wide uppercase">Ready</span>
              <span className="text-[22px] font-black text-purple-600 leading-none mt-1">1</span>
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
      </div>

      {/* Toolbox Row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
          <Input 
            className="pl-10 h-12 rounded-[12px] bg-muted/20 border-border/50 text-[14px] w-full focus-visible:ring-1 focus-visible:ring-primary/30" 
            placeholder="Search by student name, parent, plate, queue #..." 
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px] h-12 rounded-[12px] bg-muted/20 border-border/50 text-[14px] font-semibold focus:ring-1 focus:ring-primary/30">
            <SelectValue placeholder="All Lanes" />
          </SelectTrigger>
          <SelectContent className="rounded-[12px]">
             <SelectGroup>
                <SelectItem value="all" className="font-semibold px-4 flex items-center justify-between cursor-pointer">
                  All Lanes
                </SelectItem>
                <SelectItem value="a" className="px-4">Lane A</SelectItem>
                <SelectItem value="b" className="px-4">Lane B</SelectItem>
                <SelectItem value="c" className="px-4">Lane C</SelectItem>
             </SelectGroup>
          </SelectContent>
        </Select>
        <Button 
          className="h-12 px-6 rounded-[12px] bg-[#10B981] hover:bg-[#059669] text-white font-bold tracking-wide transition-all shadow-[0_2px_8px_rgba(16,185,129,0.25)]" 
          onClick={() => setQuickMarkOpen(true)}
        >
          <CheckCircle className="w-4 h-4 mr-2" strokeWidth={2.5}/> Quick Mark
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1.5 bg-muted/30 border border-border/50 rounded-full w-full">
        <Button 
          variant="ghost" 
          onClick={() => setActiveTab('active')}
          className={`flex-1 rounded-full font-bold text-[13.5px] h-10 transition-all ${activeTab === 'active' ? 'bg-white shadow-sm text-foreground hover:bg-white' : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'}`}
        >
          <Car className="w-4 h-4 mr-2.5 opacity-50"/> Active ({pickups.filter(p => p.status !== 'completed').length})
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setActiveTab('completed')}
          className={`flex-1 rounded-full font-bold text-[13.5px] h-10 transition-all ${activeTab === 'completed' ? 'bg-white shadow-sm text-foreground hover:bg-white' : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'}`}
        >
          <CheckCircle2 className="w-4 h-4 mr-2.5 opacity-50"/> Completed ({pickups.filter(p => p.status === 'completed').length})
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setActiveTab('other')}
          className={`flex-1 rounded-full font-bold text-[13.5px] h-10 transition-all ${activeTab === 'other' ? 'bg-white shadow-sm text-foreground hover:bg-white' : 'text-muted-foreground hover:bg-white/50 hover:text-foreground'}`}
        >
          <XCircle className="w-4 h-4 mr-2.5 opacity-50"/> Other (0)
        </Button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredPickups.map((pickup, idx) => (
          <div key={idx} className={`rounded-[16px] border ${pickup.colorBorder} ${pickup.colorBg} p-5 pb-4 shadow-sm hover:shadow-md transition-shadow`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {pickup.queue ? (
                  <span className="text-[17px] font-black text-foreground">{pickup.queue}</span>
                ) : null}
                
                {pickup.status === 'queued' ? (
                  <Badge variant="outline" className="bg-blue-50/80 text-blue-600 border-none px-2 py-0.5 rounded-[6px] font-bold text-[11px] tracking-wide flex items-center gap-1.5">
                    <ArrowUpCircle className="w-3.5 h-3.5" /> Queued
                  </Badge>
                ) : pickup.status === 'ready' ? (
                  <Badge variant="outline" className="bg-purple-50/80 text-purple-600 border-none px-2 py-0.5 rounded-[6px] font-bold text-[11px] tracking-wide flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" /> Ready
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-none px-2 py-0.5 rounded-[6px] font-bold text-[11px] tracking-wide flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Pending
                  </Badge>
                )}

                {pickup.carType === 'Taxi' && (
                  <Badge variant="outline" className="bg-amber-50/80 text-amber-600 border-none px-2 py-0.5 rounded-[6px] font-bold text-[11px] tracking-wide">
                    Taxi
                  </Badge>
                )}

                {pickup.isCarpool && (
                  <Badge variant="outline" className="bg-purple-50/80 text-purple-500 border-none px-2.5 py-0.5 rounded-[6px] font-bold text-[11px] tracking-wide flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    Carpool
                  </Badge>
                )}
              </div>
              <span className="text-[13px] text-muted-foreground/70 font-mono font-medium tracking-tight bg-white/40 px-2 py-1 rounded-[6px] backdrop-blur-sm border border-border/30">
                {pickup.id}
              </span>
            </div>
            
            {/* Student Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {pickup.students.map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] border border-border/60 bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-[13.5px] font-bold text-foreground/90">
                  <GraduationCap className="w-4 h-4 text-blue-500" strokeWidth={2.5} /> {s}
                </div>
              ))}
              {pickup.carpoolExtra && (
                <div className="text-[12px] font-bold text-purple-500 ml-1">
                  {pickup.carpoolExtra}
                </div>
              )}
            </div>

            {/* Parent Info Line */}
            <div className="flex items-center gap-5 text-[13.5px] text-muted-foreground/90 font-medium mb-5 pl-1">
              <div className="flex items-center gap-2"><User className="w-4 h-4 opacity-50" /> {pickup.parent}</div>
              <div className="flex items-center gap-2"><Car className="w-4 h-4 opacity-50" /> {pickup.plate}</div>
              {pickup.lane && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-50" /> {pickup.lane}</div>}
            </div>

            {/* Footer Line */}
            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <span className="text-[12.5px] text-muted-foreground/80 font-medium pl-1">Started {pickup.started}</span>
              <div className="flex gap-2.5">
                {pickup.status === 'queued' || pickup.status === 'pending' ? (
                  <Button 
                    variant="outline" 
                    className="h-[38px] rounded-[10px] font-bold text-foreground bg-white hover:bg-muted/50 border-border/60 shadow-sm px-4"
                    onClick={() => handleUpdateStatus(pickup.id, 'ready')}
                  >
                     <Car className="w-4 h-4 mr-2 text-muted-foreground"/> Ready
                  </Button>
                ) : null}
                {pickup.status !== 'completed' && (
                  <Button 
                    className="h-[38px] rounded-[10px] bg-[#10B981] hover:bg-[#059669] text-white font-bold shadow-[0_2px_6px_rgba(16,185,129,0.2)] border-0 px-4 transition-colors"
                    onClick={() => handleUpdateStatus(pickup.id, 'completed')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" strokeWidth={2.5}/> Complete
                  </Button>
                )}
                {pickup.status === 'completed' && (
                  <Badge variant="outline" className="h-[38px] px-4 rounded-[10px] bg-emerald-50 text-emerald-600 border-emerald-200 font-bold text-[12.5px]">
                    <CheckCircle2 className="w-4 h-4 mr-2"/> Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Mark Modal */}
      <Dialog open={quickMarkOpen} onOpenChange={setQuickMarkOpen}>
        <DialogContent className="sm:max-w-[460px] p-7 rounded-[18px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border-border/40 gap-0 outline-none">
          <div className="space-y-1.5">
            <h2 className="flex items-center gap-2.5 text-[20px] font-bold text-foreground tracking-tight">
              <CheckCircle2 className="text-[#10B981] w-[22px] h-[22px]" strokeWidth={2.5} />
              Quick Mark / Unmark
            </h2>
            <p className="text-[14.5px] text-slate-500 font-medium">
              Quickly find and mark pickups by ID or student name.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button 
              variant={markType === 'id' ? 'default' : 'outline'} 
              className={`h-[42px] rounded-[10px] font-bold px-4 transition-none text-[13.5px] ${markType === 'id' ? 'bg-[#2563eb] hover:bg-[#2563eb]/90 text-white border-0 shadow-md shadow-blue-500/20' : 'text-slate-700 hover:text-slate-900 border-slate-200/80 bg-white hover:bg-slate-50 shadow-sm'}`}
              onClick={() => setMarkType('id')}>
              <Hash className={`w-4 h-4 mr-2.5 ${markType === 'id' ? 'text-white' : 'text-slate-700'}`} strokeWidth={2.5}/> By Pickup ID
            </Button>
            <Button 
              variant={markType === 'student' ? 'default' : 'outline'}
              className={`h-[42px] rounded-[10px] font-bold px-4 transition-none text-[13.5px] ${markType === 'student' ? 'bg-[#2563eb] hover:bg-[#2563eb]/90 text-white border-0 shadow-md shadow-blue-500/20' : 'text-slate-700 hover:text-slate-900 border-slate-200/80 bg-white hover:bg-slate-50 shadow-sm'}`}
              onClick={() => setMarkType('student')}>
              <GraduationCap className={`w-4 h-4 mr-2.5 ${markType === 'student' ? 'text-white' : 'text-slate-700'}`} strokeWidth={2.5}/> By Student Name
            </Button>
          </div>
          
          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={2} />
            <Input 
               placeholder={markType === 'id' ? "e.g. PU-202602..." : "e.g. Emma Johnson"}
               className="pl-11 h-[48px] w-full rounded-[12px] bg-slate-100 border-transparent text-[15px] shadow-none focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-slate-100 focus-visible:ring-offset-0 font-medium placeholder:text-slate-400/80 transition-all"
               autoFocus
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
