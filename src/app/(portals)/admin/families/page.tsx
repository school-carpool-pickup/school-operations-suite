'use client';

import { useQuery } from '@tanstack/react-query';
import { crmService } from '@/mocks/services/crm';
import { CRMStatCards } from '@/components/shared/CRMStatCards';
import { CRMFilterBar } from '@/components/shared/CRMFilterBar';
import { CRMTableWrapper } from '@/components/shared/CRMTableWrapper';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, Car, Mail, Phone, MessageSquare, Ban, GraduationCap, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function FamilyCRMPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [banningFamily, setBanningFamily] = useState<any | null>(null);
  const [banningAccount, setBanningAccount] = useState<{name: string, familyName: string} | null>(null);

  const { data: families, isLoading } = useQuery({
    queryKey: ['families'],
    queryFn: crmService.getFamilies,
  });

  const stats = [
    { label: 'Total Families', value: families?.length || 0 },
    { label: 'Active', value: families?.filter(f => f.status === 'active').length || 0, colorClass: 'text-emerald-500' },
    { label: 'Banned', value: families?.filter(f => f.status === 'banned').length || 0, colorClass: 'text-red-500' },
    { label: 'Total Members', value: families?.reduce((acc, f) => acc + f.membersCount, 0) || 0, colorClass: 'text-blue-500' },
    { label: 'Total Students', value: families?.reduce((acc, f) => acc + f.studentsCount, 0) || 0, colorClass: 'text-violet-500' },
  ];

  const filters = [
    { placeholder: 'All Status', options: [{ label: 'Active', value: 'active' }, { label: 'Banned', value: 'banned' }, { label: 'Suspended', value: 'suspended' }] },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Family CRM</h2>
      </div>

      <CRMStatCards metrics={stats} />
      
      <CRMFilterBar 
        searchPlaceholder="Search by family name, parent name, or email..." 
        filters={filters} 
      />

      <CRMTableWrapper title={`Families (${families?.length || 0})`}>
        {isLoading ? (
           <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <div className="flex flex-col divide-y divide-border/50 bg-white">
            {families?.map((family) => (
              <div key={family.id} className="flex flex-col border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                {/* Main Row Header */}
                <div 
                  className="flex items-center justify-between p-6 group cursor-pointer"
                  onClick={() => setExpandedId(expandedId === family.id ? null : family.id)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-[42px] w-[42px] bg-blue-100">
                      <AvatarFallback className="text-blue-700 bg-blue-100 font-bold text-sm">
                        {family.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[15px]">{family.name}</span>
                        <Badge variant="secondary" className={family.status === 'active' ? 'bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[11px] font-semibold' : 'bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[11px] font-semibold'}>
                          {family.status}
                        </Badge>
                      </div>
                      <span className="text-[13px] text-muted-foreground/80 mt-0.5">
                        Primary: {family.primaryContact} &bull; {family.membersCount} members &bull; {family.studentsCount} students
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mr-1">
                      <div className="flex items-center gap-1.5">
                        <Car className="h-4 w-4 text-muted-foreground/60" />
                        <span className="font-medium text-foreground/80">{family.studentsCount}</span>
                      </div>
                      <span className="w-24 text-right text-[13px] font-medium text-foreground/70">{family.pickupsCount} pickups</span>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground/40 group-hover:text-foreground/70 transition-transform duration-200 ${expandedId === family.id ? 'rotate-180 text-foreground/70' : ''}`} />
                  </div>
                </div>

                {/* Expanded Content View */}
                {expandedId === family.id && (
                  <div className="flex flex-col px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-200 bg-white">
                    <div className="flex items-center mb-6">
                      <Button onClick={() => setBanningFamily(family)} variant="outline" className="h-8 shadow-none border-[#FCA5A5] text-[#EF4444] hover:bg-red-50 hover:text-red-700 gap-1.5 rounded-[8px] px-3 font-semibold text-[13px]">
                        <Ban className="h-3.5 w-3.5" />
                        Ban Entire Family
                      </Button>
                    </div>

                    {/* Primary Account Section */}
                    <div className="flex flex-col gap-3 mb-6">
                      <h4 className="text-[11px] font-bold text-muted-foreground tracking-wider">PRIMARY ACCOUNT</h4>
                      <div className="flex items-center justify-between border border-border/60 rounded-xl p-4 bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold text-sm">SJ</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">Sarah Johnson</span>
                              <Badge variant="secondary" className="bg-purple-100/80 text-purple-700 hover:bg-purple-100 border-none px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><GraduationCap className="h-3 w-3 inline" /> Primary</Badge>
                              <Badge variant="secondary" className="bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 text-[11px] font-semibold">active</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-[12px] text-muted-foreground mt-1 font-medium">
                              <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> sarah.johnson@gmail.com</span>
                              <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> +66 81 234 5678</span>
                              <span className="flex items-center gap-1.5 text-emerald-600"><MessageSquare className="h-3 w-3" /> @sarah_j</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setBanningAccount({ name: 'Sarah Johnson', familyName: family.name })} className="h-8 w-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"><Ban className="h-4 w-4" /></button>
                      </div>
                    </div>

                    {/* Additional Accounts Section */}
                    <div className="flex flex-col gap-3 mb-6">
                      <h4 className="text-[11px] font-bold text-muted-foreground tracking-wider">ADDITIONAL & SUPPLEMENTARY ACCOUNTS (2)</h4>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between border border-border/60 rounded-xl p-4 bg-white shadow-sm">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-zinc-100 text-zinc-700 font-semibold text-sm">MJ</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">Michael Johnson</span>
                                <Badge variant="secondary" className="bg-blue-100/80 text-blue-700 hover:bg-blue-100 border-none px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider">additional</Badge>
                                <Badge variant="secondary" className="bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 text-[11px] font-semibold">active</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-[12px] text-muted-foreground mt-1 font-medium">
                                <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> michael.johnson@gmail.com</span>
                                <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> +66 81 234 5679</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setBanningAccount({ name: 'Michael Johnson', familyName: family.name })} className="h-8 w-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"><Ban className="h-4 w-4" /></button>
                        </div>
                        
                        <div className="flex items-center justify-between border border-border/60 rounded-xl p-4 bg-white shadow-sm">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-zinc-100 text-zinc-700 font-semibold text-sm">GM</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-foreground">Grandma Mary</span>
                                <Badge variant="secondary" className="bg-zinc-100/80 text-zinc-600 hover:bg-zinc-100 border-none px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider">supplementary</Badge>
                                <Badge variant="secondary" className="bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 text-[11px] font-semibold">active</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-[12px] text-muted-foreground mt-1 font-medium">
                                <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> mary.j@gmail.com</span>
                                <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> +66 81 234 5680</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setBanningAccount({ name: 'Grandma Mary', familyName: family.name })} className="h-8 w-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"><Ban className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>

                    {/* Students Section */}
                    <div className="flex flex-col gap-3 mb-6">
                      <h4 className="text-[11px] font-bold text-muted-foreground tracking-wider">STUDENTS (3)</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between border border-border/60 rounded-xl p-3 px-4 bg-white shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-sm text-foreground">Emma Johnson</span>
                              <span className="text-[12px] text-muted-foreground font-medium">Grade 3 - Section 3A</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border border-border/60 rounded-xl p-3 px-4 bg-white shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-sm text-foreground">Liam Johnson</span>
                              <span className="text-[12px] text-muted-foreground font-medium">Grade 1 - Section 1B</span>
                            </div>
                          </div>
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                        </div>
                        
                        <div className="flex items-center justify-between border border-border/60 rounded-xl p-3 px-4 bg-white shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                              <GraduationCap className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-sm text-foreground">Sophie Johnson</span>
                              <span className="text-[12px] text-muted-foreground font-medium">Grade 2 - Section 2A</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer Info Row */}
                    <div className="flex items-center gap-6 border-t border-border/50 pt-4 mt-2">
                       <span className="text-[12px] font-medium text-muted-foreground">Joined: 2024-01-15</span>
                       <span className="text-[12px] font-medium text-muted-foreground">2 vehicles</span>
                       <span className="text-[12px] font-medium text-muted-foreground">145 total pickups</span>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CRMTableWrapper>

      {/* Ban Family Modal */}
      <Dialog open={!!banningFamily} onOpenChange={(open) => !open && setBanningFamily(null)}>
        <DialogContent className="sm:max-w-[500px] p-6 gap-6 rounded-[16px]">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-xl font-bold">Ban Family</DialogTitle>
            <DialogDescription className="text-[14.5px] text-muted-foreground/90 leading-relaxed font-medium">
              This will ban ALL members of the {banningFamily?.name}. They will not be able to use pickup or carpool services.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50/70 border border-red-200/80 rounded-[10px] p-4 flex gap-3 text-[14px] text-red-700 font-medium items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <p className="leading-snug">All active pickups and carpool requests for this family will be cancelled.</p>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <Button type="button" variant="outline" onClick={() => setBanningFamily(null)} className="rounded-xl px-5 shadow-none font-medium text-foreground h-11">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => setBanningFamily(null)} className="rounded-xl px-5 h-11 gap-2 font-bold shadow-none text-md text-white bg-[#EF4444] hover:bg-[#DC2626]">
              <Ban className="h-4 w-4" />
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Individual Account Modal */}
      <Dialog open={!!banningAccount} onOpenChange={(open) => !open && setBanningAccount(null)}>
        <DialogContent className="sm:max-w-[500px] p-6 gap-6 rounded-[16px]">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-xl font-bold">Ban Account</DialogTitle>
            <DialogDescription className="text-[14.5px] text-muted-foreground/90 leading-relaxed font-medium">
              Ban {banningAccount?.name}&apos;s individual account. They will not be able to initiate pickups or carpool.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50/70 border border-red-200/80 rounded-[10px] p-4 flex gap-3 text-[14px] text-red-700 font-medium items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
            <p className="leading-snug">Any active pickups initiated by this member will be cancelled.</p>
          </div>

          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <Button type="button" variant="outline" onClick={() => setBanningAccount(null)} className="rounded-xl px-5 shadow-none font-medium text-foreground h-11">
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => setBanningAccount(null)} className="rounded-xl px-5 h-11 gap-2 font-bold shadow-none text-md text-white bg-[#EF4444] hover:bg-[#DC2626]">
              <Ban className="h-4 w-4" />
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
