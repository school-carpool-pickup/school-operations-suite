'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { crmService } from '@/mocks/services/crm';
import { CRMStatCards } from '@/components/shared/CRMStatCards';
import { CRMFilterBar } from '@/components/shared/CRMFilterBar';
import { CRMTableWrapper } from '@/components/shared/CRMTableWrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle2, RotateCcw, ArrowUpCircle, AlertCircle, Calendar, CheckCircle, Car, Clock, XCircle, Ban, Users, Hash, GraduationCap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function PickupCRMPage() {
  const queryClient = useQueryClient();
  const [quickMarkOpen, setQuickMarkOpen] = useState(false);
  const [searchBy, setSearchBy] = useState<'id' | 'student'>('id');
  const [selectedPickup, setSelectedPickup] = useState<any>(null);

  const { data: pickups, isLoading } = useQuery({
    queryKey: ['pickups'],
    queryFn: crmService.getPickups,
  });

  const stats = [
    { label: "Today's Total", value: pickups?.length || 0 },
    { label: 'Active', value: pickups?.filter(p => ['Queued', 'Ready', 'Pending'].includes(p.status)).length || 0, colorClass: 'text-blue-600 font-bold' },
    { label: 'Completed', value: pickups?.filter(p => p.status === 'Completed').length || 0, colorClass: 'text-emerald-500 font-bold' },
    { label: 'Carpool', value: pickups?.filter(p => p.isCarpool).length || 0, colorClass: 'text-purple-600 font-bold' },
    { label: 'No Show', value: pickups?.filter(p => p.status === 'No Show').length || 0, colorClass: 'text-[#EF4444] font-bold' },
  ];

  const filters = [
    { placeholder: 'All Status', options: [{ label: 'Pending', value: 'pending' }, { label: 'Queued', value: 'queued' }, { label: 'Ready', value: 'ready' }, { label: 'Completed', value: 'completed' }, { label: 'Cancelled', value: 'cancelled' }, { label: 'No Show', value: 'no show' }] },
    { placeholder: 'All Types', options: [{ label: 'Normal', value: 'normal' }, { label: 'Carpool', value: 'carpool' }, { label: 'Taxi', value: 'taxi' }] },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <Badge variant="outline" className="bg-emerald-100/60 text-emerald-700 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>;
      case 'Queued': return <Badge variant="outline" className="bg-blue-100/60 text-blue-700 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"><ArrowUpCircle className="h-3 w-3" /> Queued</Badge>;
      case 'Ready': return <Badge variant="outline" className="bg-purple-100/60 text-purple-700 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"><Car className="h-3 w-3" /> Ready</Badge>;
      case 'Pending': return <Badge variant="outline" className="bg-amber-100/60 text-amber-700 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'Cancelled': return <Badge variant="outline" className="bg-muted/60 text-muted-foreground/80 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
      case 'No Show': return <Badge variant="outline" className="bg-red-100/60 text-red-700 border-none px-2 py-0.5 rounded-[12px] font-semibold text-[11px] tracking-wide gap-1"><Ban className="h-3 w-3" /> No Show</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    queryClient.setQueryData(['pickups'], (old: any) => 
      old?.map((p: any) => p.id === id ? { ...p, status: newStatus } : p)
    );
    if (selectedPickup?.id === id) {
      setSelectedPickup((prev: any) => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Pickup CRM</h2>
      </div>

      <CRMStatCards metrics={stats} />
      
      <CRMFilterBar 
        searchPlaceholder="Search by pickup ID, parent, student, plate, queue #..." 
        filters={filters} 
        actionLabel="Quick Mark"
        actionIcon={<CheckCircle className="h-4 w-4" />}
        actionClassName="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
        onActionClick={() => setQuickMarkOpen(true)}
      />

      <div className="relative">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 text-[12px] font-bold text-muted-foreground/80 bg-muted/40 px-3 py-1.5 rounded-md">
          <Calendar className="h-3.5 w-3.5" />
          <span>2026-02-24</span>
        </div>
        <CRMTableWrapper title={`📅 Today's Pickups (${pickups?.length || 0})`}>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-border/50">
                <TableHead className="pl-6 font-bold text-foreground h-12">Pickup ID</TableHead>
                <TableHead className="font-bold text-foreground">Students</TableHead>
                <TableHead className="font-bold text-foreground">Parent / Vehicle</TableHead>
                <TableHead className="font-bold text-foreground">Queue</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="text-right pr-6 font-bold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : pickups?.map((pickup) => (
                <TableRow key={pickup.id} className="hover:bg-muted/10 border-b-border/40 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[13px] text-foreground/90">{pickup.id}</span>
                      <span className="text-[12px] text-muted-foreground/80 mt-0.5">{pickup.time}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-0.5">
                      {pickup.students.map((student, idx) => (
                        <span key={idx} className="text-[13px] font-medium text-foreground/90">{student}</span>
                      ))}
                      {pickup.isCarpool && (
                        <Badge className="bg-purple-100/60 text-purple-600 hover:bg-purple-100 border-none mt-1 w-fit text-[10.5px] px-1.5 py-0 font-semibold gap-1">
                          <Users className="h-3 w-3" /> +{pickup.carpoolExtra} carpool
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-[13.5px] text-foreground/90">{pickup.parent}</span>
                      <span className="text-[12px] text-muted-foreground/80 mt-0.5 flex items-center gap-2">
                        {pickup.vehicle}
                        {pickup.type === 'Taxi' && (
                          <span className="bg-amber-100/60 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-extrabold flex items-center">Taxi</span>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="font-bold text-[13px] font-mono text-foreground/90">{pickup.queue}</span>
                        {pickup.lane && <span className="text-[12px] text-muted-foreground ml-1.5">{pickup.lane}</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(pickup.status)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex flex-row justify-end items-center gap-3">
                      {pickup.status === 'Completed' ? (
                        <Button onClick={() => handleUpdateStatus(pickup.id, 'Ready')} variant="outline" className="h-8 text-[#EA580C] border-[#FED7AA] hover:bg-[#FFF7ED] hover:text-[#C2410C] rounded-[8px] px-3 font-semibold text-[13px] gap-1.5 shadow-none transition-colors">
                          <RotateCcw className="h-3.5 w-3.5" /> Unmark
                        </Button>
                      ) : pickup.status !== 'Cancelled' && pickup.status !== 'No Show' ? (
                        <Button onClick={() => handleUpdateStatus(pickup.id, 'Completed')} className="h-8 text-white bg-[#10B981] hover:bg-[#059669] rounded-[8px] px-3 font-semibold text-[13px] gap-1.5 shadow-none transition-colors">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Mark
                        </Button>
                      ) : null}
                      <button onClick={() => setSelectedPickup(pickup)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground/60 hover:text-foreground">
                        <Eye className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CRMTableWrapper>
      </div>

      {/* Quick Mark Modal */}
      <Dialog open={quickMarkOpen} onOpenChange={setQuickMarkOpen}>
        <DialogContent className="sm:max-w-[480px] p-7 rounded-[20px] border-border/40 shadow-xl overflow-hidden">
          <div className="flex items-center gap-2.5 mb-2">
            <CheckCircle className="h-[22px] w-[22px] text-emerald-500" />
            <h3 className="text-[19px] font-bold text-foreground tracking-tight">Quick Mark / Unmark Pickup</h3>
          </div>
          <p className="text-[14px] text-muted-foreground/90 font-medium leading-relaxed mb-6">
            Search by pickup ID or student name to quickly mark or unmark a pickup as completed.
          </p>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => setSearchBy('id')}
                variant={searchBy === 'id' ? 'default' : 'outline'} 
                className={`rounded-xl h-[34px] font-semibold text-[13px] px-3.5 shadow-none border border-border/60 ${searchBy === 'id' ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-0' : 'text-foreground hover:bg-muted/30 bg-transparent'}`}
              >
                <Hash className="h-3.5 w-3.5 mr-1.5 opacity-80" /> By Pickup ID
              </Button>
              <Button 
                onClick={() => setSearchBy('student')}
                variant={searchBy === 'student' ? 'default' : 'outline'} 
                className={`rounded-xl h-[34px] font-semibold text-[13px] px-3.5 shadow-none border border-border/60 ${searchBy === 'student' ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white border-0' : 'text-foreground hover:bg-muted/30 bg-transparent'}`}
              >
                <GraduationCap className="h-3.5 w-3.5 mr-1.5 opacity-80" /> By Student
              </Button>
            </div>
            
            <div className="relative mt-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground/60" />
              <Input 
                placeholder={searchBy === 'id' ? 'Enter pickup ID (e.g. PU-20260224-001)' : 'Enter student name (e.g. Emma Johnson)'} 
                className="pl-11 h-[48px] bg-white rounded-xl border-border/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-foreground/90 font-medium focus-visible:ring-1 focus-visible:ring-purple-500/40 focus-visible:border-purple-500/50 text-[14px] transition-all"
                autoFocus
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pickup Detail Modal */}
      <Dialog open={!!selectedPickup} onOpenChange={(open) => !open && setSelectedPickup(null)}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[20px] border-border/40 shadow-xl gap-0">
          {selectedPickup && (
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-col gap-1 mb-6 pr-8">
                <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Hash className="h-5 w-5 text-foreground font-bold" />
                  {selectedPickup.id}
                </h2>
                <p className="text-[13.5px] text-muted-foreground/90 font-medium">Pickup detail and management</p>
              </div>
              
              <div className="space-y-6">
                {/* Status Bar */}
                <div className="flex items-center justify-between bg-muted/20 border border-border/50 rounded-[14px] p-3 px-4">
                  <span className="font-semibold text-muted-foreground/80 text-[14px]">Status</span>
                  {getStatusBadge(selectedPickup.status)}
                </div>

                {/* STUDENTS */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <GraduationCap className="h-4 w-4" /> Students
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {selectedPickup.students.map((student: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-border/60 rounded-[14px] p-3 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3.5">
                          <div className="h-[36px] w-[36px] rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-[12px]">
                            {student.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                          </div>
                          <span className="font-bold text-foreground/90 text-[14.5px]">{student}</span>
                        </div>
                        <span className="text-[12.5px] font-mono font-medium text-muted-foreground/70">{`student-${idx+1}`}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Grid: Parent, Vehicle, Started, Completed */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-muted/10 border border-border/60 rounded-[14px] p-4">
                    <span className="text-[11.5px] font-semibold text-muted-foreground/80 flex items-center gap-2 mb-2 uppercase tracking-wider">
                      <Users className="h-3.5 w-3.5" /> Parent
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[14.5px] text-foreground/90">{selectedPickup.parent}</span>
                      <span className="text-[13px] font-medium text-muted-foreground mt-0.5">{selectedPickup.parent.split(' ')[1]} Family</span>
                    </div>
                  </div>
                  <div className="bg-muted/10 border border-border/60 rounded-[14px] p-4">
                    <span className="text-[11.5px] font-semibold text-muted-foreground/80 flex items-center gap-2 mb-2 uppercase tracking-wider">
                      <Car className="h-3.5 w-3.5" /> Vehicle
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-[14.5px] text-foreground/90">{selectedPickup.vehicle}</span>
                      <span className="text-[13px] font-medium text-muted-foreground mt-0.5">Toyota Fortuner (Silver)</span>
                    </div>
                  </div>
                  <div className="bg-muted/10 border border-border/60 rounded-[14px] p-4">
                    <span className="text-[11.5px] font-semibold text-muted-foreground/80 mb-2 block uppercase tracking-wider">Started</span>
                    <span className="font-bold text-[14.5px] text-foreground/90">{selectedPickup.time}</span>
                  </div>
                  <div className="bg-muted/10 border border-border/60 rounded-[14px] p-4">
                    <span className="text-[11.5px] font-semibold text-muted-foreground/80 mb-2 block uppercase tracking-wider">Completed</span>
                    <span className="font-bold text-[14.5px] text-foreground/90">{selectedPickup.status === 'Completed' ? '02:40 PM' : '—'}</span>
                  </div>
                </div>

                {/* CHANGE STATUS buttons */}
                <div className="space-y-3">
                  <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Change Status
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {['Pending', 'Queued', 'Ready', 'Completed', 'Cancelled', 'No Show'].map((statusOption) => {
                      const isActive = selectedPickup.status === statusOption;
                      return (
                        <Button 
                          key={statusOption}
                          onClick={() => handleUpdateStatus(selectedPickup.id, statusOption)}
                          variant={isActive ? 'default' : 'outline'}
                          className={`rounded-xl h-[36px] font-bold text-[13.5px] px-3.5 gap-2 shadow-none transition-all ${
                            isActive 
                              ? 'bg-[#c084fc] hover:bg-[#a855f7] text-white border-0'
                              : 'text-foreground/90 hover:bg-muted/40 border border-border/60 bg-transparent'
                          }`}
                        >
                          {statusOption === 'Completed' ? <CheckCircle2 className="h-4 w-4" /> : 
                           statusOption === 'Queued'    ? <ArrowUpCircle className="h-4 w-4" /> :
                           statusOption === 'Ready'     ? <Car className="h-4 w-4" /> :
                           statusOption === 'Pending'   ? <Clock className="h-4 w-4" /> :
                           statusOption === 'Cancelled' ? <XCircle className="h-4 w-4" /> :
                           <Ban className="h-4 w-4" />}
                           {statusOption}
                        </Button>
                      )
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
