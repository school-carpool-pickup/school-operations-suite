'use client';

import { useState } from 'react';
import { Save, Info, Plus, Trash2, CheckCircle2, MapPin, Bluetooth } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function SchoolSettingsPage() {
  const [laneToDelete, setLaneToDelete] = useState<any>(null);

  const handleSave = () => {
    toast.success('Settings Saved', {
      description: 'Geofencing and Gateway Configurations have been synchronized.',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">School Settings</h2>
          <p className="text-[14.5px] font-medium text-muted-foreground mt-1 tracking-tight">Configure pickup lanes, geofencing, and BLE beacons</p>
        </div>
        <Button onClick={handleSave} className="h-10 px-5 rounded-[10px] font-bold gap-2 bg-[#171717] hover:bg-[#262626] text-white shadow-sm transition-colors border-0">
          <Save className="h-[18px] w-[18px]" /> Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Main Configurations) */}
        <div className="xl:col-span-2 space-y-6">
          
          <Card className="shadow-sm border-border/80">
            <CardHeader className="border-b border-border/40 bg-muted/10 py-4">
              <CardTitle className="text-[15px] font-bold flex items-center gap-2">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/80"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                School Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-[14px] border border-blue-200/60 bg-blue-50/50 p-4.5 px-5">
                <h4 className="font-bold text-[15px] text-blue-900 mb-1">International School Bangkok</h4>
                <p className="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer transition-colors">Configure pickup settings for your school</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/80">
            <CardHeader className="border-b border-border/40 bg-muted/10 py-4">
              <CardTitle className="text-[15px] font-bold flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground/80" />
                Geofencing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="rounded-[14px] border border-emerald-200/50 bg-emerald-50/50 p-4.5 flex gap-3 text-[13.5px] font-medium text-emerald-800 leading-relaxed shadow-sm">
                <Info className="h-[20px] w-[20px] shrink-0 mt-0.5 text-emerald-500" />
                <div>
                  <span className="font-bold mr-1">About Geofencing:</span>
                  Parents will automatically enter the pre-queue when they are within this distance from the school. <span className="font-bold text-emerald-900">This triggers their queue assignment.</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-bold text-foreground">Geofence Radius (meters)</Label>
                  <Input type="number" defaultValue={500} className="max-w-md h-12 rounded-[12px] bg-muted/20 border border-border/60 shadow-sm font-medium text-[15px] focus-visible:ring-1 focus-visible:ring-emerald-500/30 transition-all" />
                  <p className="text-[12px] font-medium text-muted-foreground/80 mt-1.5 ml-1">Recommended: 500-1000 meters. Current: 500m</p>
                </div>

                <div className="rounded-[16px] border border-emerald-100 bg-[#f8fafc] p-5 flex items-center justify-between mt-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="space-y-1">
                    <div className="font-bold text-[14.5px] text-foreground">Current Radius</div>
                    <div className="text-[12.5px] font-medium text-muted-foreground/80">GPS-based trigger distance</div>
                  </div>
                  <div className="text-3xl font-black text-emerald-500 mr-2 tracking-tight">500m</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/80">
            <CardHeader className="border-b border-border/40 bg-muted/10 py-5 flex flex-row items-center justify-between">
              <CardTitle className="text-[16px] font-bold text-foreground tracking-tight">Pickup Lanes / Gates Configuration</CardTitle>
              <Badge variant="secondary" className="font-semibold bg-white text-muted-foreground px-3 py-1 text-[12px] shadow-sm border border-border/60 rounded-full">3 lanes configured</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-6 bg-[#fafafa]">
              <div className="rounded-[14px] border border-purple-200/50 bg-purple-50/50 p-4.5 flex gap-3 text-[13.5px] font-medium text-purple-800 leading-relaxed shadow-sm">
                <Info className="h-[20px] w-[20px] shrink-0 mt-0.5 text-purple-500" />
                <div>
                  <span className="font-bold mr-1">Lane Assignment:</span>
                  Configure which gate/lane/door each grade should use for pickup. Parents will be automatically assigned to the correct lane based on their child&#39;s grade.
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Gate A - Elementary', grades: '1, 2, 3, 4', label: 'Main Gate A' },
                  { name: 'Gate B - Middle School', grades: '5, 6, 7, 8', label: 'Side Gate B' },
                ].map((lane, idx) => (
                  <div key={idx} className="flex flex-row items-center justify-between rounded-[14px] border border-border/80 p-4 px-5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3.5">
                        <h4 className="text-[15px] font-bold text-foreground">{lane.name}</h4>
                        <Badge variant="secondary" className="bg-muted/50 text-[11px] text-muted-foreground/80 px-2 py-0.5 border border-border/40 font-bold tracking-wide rounded-[8px]">
                          Grades {lane.grades}
                        </Badge>
                      </div>
                      <p className="text-[13px] font-medium text-muted-foreground/90 flex items-center gap-2">
                        <MapPin className="text-[#EF4444] h-[15px] w-[15px]" /> {lane.label}
                      </p>
                    </div>
                    <Button onClick={() => setLaneToDelete(lane)} variant="ghost" size="icon" className="h-[42px] w-[42px] rounded-[12px] bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors shadow-none shrink-0 border border-red-50">
                      <Trash2 className="h-[18px] w-[18px]" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="rounded-[16px] p-6 bg-white border border-border shadow-sm border-dashed">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[11.5px] text-muted-foreground/80 uppercase tracking-wider font-bold">Lane/Gate Name</Label>
                    <Input placeholder="e.g., Gate A - Elementary" className="h-[46px] rounded-[12px] bg-muted/10 border border-border/60 shadow-sm text-[14.5px] font-medium focus-visible:ring-1 focus-visible:ring-primary/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11.5px] text-muted-foreground/80 uppercase tracking-wider font-bold">Grades (comma-separated)</Label>
                    <Input placeholder="1, 2, 3, 4" className="h-[46px] rounded-[12px] bg-muted/10 border border-border/60 shadow-sm text-[14.5px] font-medium focus-visible:ring-1 focus-visible:ring-primary/20 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11.5px] text-muted-foreground/80 uppercase tracking-wider font-bold">Physical Location</Label>
                    <Select defaultValue="main">
                      <SelectTrigger className="flex h-[46px] w-full rounded-[12px] border border-border/60 bg-muted/10 px-4 text-[14.5px] font-medium shadow-sm transition-colors text-foreground focus-visible:ring-1 focus-visible:ring-primary/20">
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[14px] shadow-xl border-border/60 max-h-[300px]">
                         <SelectItem value="main" className="text-[14px] font-medium py-2.5 px-3">Main Gate A</SelectItem>
                         <SelectItem value="side" className="text-[14px] font-medium py-2.5 px-3">Side Gate B</SelectItem>
                         <SelectItem value="back" className="text-[14px] font-medium py-2.5 px-3">Back Gate C</SelectItem>
                         <SelectItem value="east" className="text-[14px] font-medium py-2.5 px-3">East Entrance</SelectItem>
                         <SelectItem value="west" className="text-[14px] font-medium py-2.5 px-3">West Entrance</SelectItem>
                         <SelectItem value="parking" className="text-[14px] font-medium py-2.5 px-3">Parking Lot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Sidebars) */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border/80">
            <CardHeader className="border-b border-border/40 bg-white py-5">
              <CardTitle className="text-[16px] font-bold text-foreground flex items-center gap-2.5">
                <Bluetooth className="h-[18px] w-[18px] text-muted-foreground/80" />
                BLE Beacon Distances
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="rounded-[14px] border border-blue-200/50 bg-blue-50/60 p-4.5 text-[13.5px] text-blue-800 font-medium leading-relaxed">
                <div className="font-bold flex items-center gap-2 mb-1.5 text-[14px] text-blue-900">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  BLE Beacons
                </div>
                <p>Set trigger distance for each Bluetooth beacon. Beacons are managed by business admin.</p>
              </div>

              <div className="space-y-6">
                {[
                  { name: 'Main Entrance', id: 'f7826da6-4fa2-4e98-8024-bc5b71e0893e' },
                  { name: 'Back Entrance', id: 'f7826da6-4fa2-4e98-8024-bc5b71e0893f' }
                ].map((beacon, idx) => (
                  <div key={idx} className="space-y-2 p-4 rounded-[14px] border border-border/60 bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="h-[22px] w-[22px] bg-blue-100 text-blue-600 rounded-[6px] flex items-center justify-center shrink-0">
                        <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 0.5V14.5M5 0.5L9.5 5L5 9.5M5 0.5L0.5 5L5 9.5M5 14.5L9.5 10L5 5.5M5 14.5L0.5 10L5 5.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <h4 className="font-bold text-[14.5px] text-foreground">{beacon.name}</h4>
                    </div>
                    <p className="font-mono text-[12px] font-medium text-muted-foreground/60 truncate pl-8">{beacon.id}</p>
                    
                    <div className="mt-4 pt-3 border-t border-border/40 space-y-1.5 pl-8">
                      <Label className="text-[12px] font-bold text-foreground">Trigger Distance (meters)</Label>
                      <Input type="number" defaultValue={50} className="h-11 rounded-[10px] bg-muted/20 border-border/60 shadow-none font-medium mt-1" />
                      <p className="text-[11.5px] font-medium text-muted-foreground/70 mt-1">Current: 50m</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[14px] border border-dashed border-border/80 p-4 text-[12.5px] font-medium text-muted-foreground/80 text-center bg-muted/10 leading-relaxed">
                BLE beacons are managed by business admin in the Business Dashboard
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/80 bg-[#FAFAFA]">
            <CardHeader className="bg-white py-5 rounded-t-xl border-b border-border/40">
              <CardTitle className="text-[16px] font-bold text-foreground tracking-tight">Settings Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 px-5 rounded-[16px] bg-emerald-50/60 border border-emerald-100 shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[12.5px] text-emerald-800/80 font-bold uppercase tracking-wider">Geofence Radius</span>
                  <span className="font-black text-[22px] text-emerald-500 tracking-tight leading-none">500m</span>
                </div>
                <CheckCircle2 className="h-[22px] w-[22px] text-emerald-500" />
              </div>
              
              <div className="flex items-center justify-between p-4 px-5 rounded-[16px] bg-purple-50/60 border border-purple-100 shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[12.5px] text-purple-800/80 font-bold uppercase tracking-wider">Pickup Lanes</span>
                  <span className="font-black text-[22px] text-purple-500 tracking-tight leading-none">3</span>
                </div>
                <CheckCircle2 className="h-[22px] w-[22px] text-purple-500" />
              </div>

              <div className="flex items-center justify-between p-4 px-5 rounded-[16px] bg-blue-50/60 border border-blue-100 shadow-sm">
                <div className="flex flex-col gap-1">
                  <span className="text-[12.5px] text-blue-800/80 font-bold uppercase tracking-wider">BLE Beacons</span>
                  <span className="font-black text-[22px] text-blue-500 tracking-tight leading-none">2</span>
                </div>
                <CheckCircle2 className="h-[22px] w-[22px] text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Delete Lane Modal */}
      <Dialog open={!!laneToDelete} onOpenChange={(open) => !open && setLaneToDelete(null)}>
        <DialogContent className="sm:max-w-[425px] p-8 rounded-[24px] border-border/40 shadow-2xl overflow-hidden gap-0">
          <div className="flex flex-col items-center text-center">
             <div className="h-16 w-16 rounded-[18px] bg-red-50 flex items-center justify-center mb-5 rotate-3 shadow-sm border border-red-100">
               <Trash2 className="h-8 w-8 text-red-500" />
             </div>
             <h3 className="text-xl font-bold text-foreground">Remove Pickup Lane</h3>
             <p className="text-[14.5px] font-medium text-muted-foreground mt-2 mb-8 px-2 leading-relaxed">
               Are you sure you want to remove <span className="font-bold text-foreground">{laneToDelete?.name}</span>? Students assigned to this lane will need to be reallocated.
             </p>
             <div className="flex w-full gap-3">
               <Button variant="outline" onClick={() => setLaneToDelete(null)} className="h-[46px] flex-1 rounded-[14px] shadow-none font-bold text-foreground/80 border-border/60 hover:bg-muted/30">
                 Cancel
               </Button>
               <Button onClick={() => setLaneToDelete(null)} className="h-[46px] flex-1 rounded-[14px] shadow-[0_4px_14px_0_rgba(239,68,68,0.2)] font-bold bg-[#EF4444] hover:bg-[#DC2626] text-white border-0 transition-all">
                 Remove Lane
               </Button>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
