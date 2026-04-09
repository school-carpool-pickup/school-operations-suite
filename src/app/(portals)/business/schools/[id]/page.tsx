'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Save, CheckCircle2, Info, AlertCircle, 
  Clock, CheckSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SchoolDetailsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/business/schools" className="mt-1.5 h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[24px] font-bold tracking-tight text-foreground leading-none">International School Bangkok</h2>
            </div>
            <p className="text-[14px] text-muted-foreground mt-1.5 font-medium">School settings and configuration</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 text-[12px] font-bold tracking-wide uppercase">
            active
          </Badge>
          <Button className="h-[40px] rounded-[10px] bg-[#020617] hover:bg-slate-800 text-white shadow-sm font-semibold px-5 flex items-center gap-2 transition-all">
            <Save className="w-[18px] h-[18px]" strokeWidth={2.5} /> Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-2">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6 w-full">
          
          {/* Basic Information */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-7">
              <CardTitle className="text-[16px] font-bold text-foreground">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="px-7 pb-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[13.5px] font-semibold text-slate-700">School Name</label>
                  <Input 
                    defaultValue="International School Bangkok" 
                    className="h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13.5px] font-semibold text-slate-700">Grades</label>
                  <Input 
                    defaultValue="1-12" 
                    className="h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[13.5px] font-semibold text-slate-700">Address</label>
                <Input 
                  defaultValue="123 Sukhumvit Road, Bangkok 10110" 
                  className="h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-[13.5px] font-semibold text-slate-700">Phone</label>
                  <Input 
                    defaultValue="+66 2 123 4567" 
                    className="h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13.5px] font-semibold text-slate-700">Email</label>
                  <Input 
                    defaultValue="info@isb.ac.th" 
                    className="h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13.5px] font-semibold text-slate-700">Website</label>
                  <Input 
                    defaultValue="https://www.isb.ac.th" 
                    className="h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* School API Integration */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-7 flex flex-row items-center justify-between">
              <CardTitle className="text-[16px] font-bold text-foreground">School API Integration</CardTitle>
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} /> Connected
              </div>
            </CardHeader>
            <CardContent className="px-7 pb-7 space-y-5">
              
              <div className="bg-blue-50/80 border border-blue-100 rounded-[10px] p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13.5px] font-bold text-blue-800 mb-0.5">About API Integration</h4>
                  <p className="text-[13px] text-blue-600/90 font-medium leading-relaxed">
                    Connect to your school's student information system to automatically sync student data. This enables real-time verification during parent registration.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13.5px] font-semibold text-slate-700">API Endpoint</label>
                <Input 
                  defaultValue="https://api.isb.ac.th/students" 
                  className="h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[13.5px] font-semibold text-slate-700">API Key</label>
                <Input 
                  type="password"
                  defaultValue="••••••••••••••••••••••••••••" 
                  className="h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                />
              </div>

              <div className="h-[42px] flex items-center px-4 rounded-[8px] bg-slate-50 border border-slate-200/60 text-[13px] text-slate-500 font-medium tracking-wide">
                Last synchronized: 3/11/2026, 10:30:00 AM
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" className="h-[40px] rounded-[8px] font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 px-5">
                  Test Connection
                </Button>
                <Button variant="outline" className="h-[40px] rounded-[8px] font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 px-5">
                  Sync Now
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Pickup Settings */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-7">
              <CardTitle className="text-[16px] font-bold text-foreground">Pickup Settings</CardTitle>
            </CardHeader>
            <CardContent className="px-7 pb-7 space-y-6">
              
              <div className="bg-purple-50/60 border border-purple-100 rounded-[10px] p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13.5px] font-bold text-purple-800 mb-0.5">Lane Configuration</h4>
                  <p className="text-[13px] text-purple-600/90 font-medium leading-relaxed">
                    Pickup lanes, gates, and geofencing are configured by school administrators in their admin portal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[13.5px] font-semibold text-slate-700">Pickup Start Time</label>
                  <div className="relative">
                    <Input 
                      defaultValue="14:30" 
                      className="pl-4 pr-10 h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13.5px] font-semibold text-slate-700">Pickup End Time</label>
                  <div className="relative">
                    <Input 
                      defaultValue="16:00" 
                      className="pl-4 pr-10 h-[42px] rounded-[8px] bg-slate-50/80 border-slate-200 focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white text-[14px] font-medium shadow-none"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-[10px] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-bold text-slate-800">Allow Carpool Marketplace</p>
                  <p className="text-[13px] text-slate-500 font-medium mt-0.5">Enable parents to request and offer carpools</p>
                </div>
                <div className="w-5 h-5 rounded-[4px] bg-blue-500 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-[10px] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-bold text-slate-800">Require BLE Beacon</p>
                  <p className="text-[13px] text-slate-500 font-medium mt-0.5">Use Bluetooth beacons for more accurate queue assignment</p>
                </div>
                <div className="w-5 h-5 rounded-[4px] bg-blue-500 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-4 h-4 text-white" />
                </div>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* Right Column (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6 w-full">
          
          {/* School Statistics */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-[16px] font-bold text-foreground">School Statistics</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              
              <div className="bg-slate-50/80 rounded-[12px] p-4">
                <p className="text-[12.5px] font-semibold text-slate-500 mb-1">Total Students</p>
                <div className="text-[26px] font-black text-slate-800 leading-none">850</div>
              </div>

              <div className="bg-blue-50/50 rounded-[12px] p-4">
                <p className="text-[12.5px] font-semibold text-slate-500 mb-1">Active Parents</p>
                <div className="text-[26px] font-black text-blue-500 leading-none">1,234</div>
              </div>

              <div className="bg-emerald-50/50 rounded-[12px] p-4">
                <p className="text-[12.5px] font-semibold text-slate-500 mb-1">Daily Pickups</p>
                <div className="text-[26px] font-black text-emerald-600 leading-none">342</div>
              </div>

              <div className="bg-purple-50/50 rounded-[12px] p-4">
                <p className="text-[12.5px] font-semibold text-slate-500 mb-1">Carpool Rides</p>
                <div className="text-[26px] font-black text-[#a855f7] leading-none">127</div>
              </div>

            </CardContent>
          </Card>

          {/* Financial Settings */}
          <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-[16px] font-bold text-foreground">Financial Settings</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-6">
              
              <div className="bg-amber-50/80 border border-amber-200/60 rounded-[10px] p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={2.5}/>
                <div>
                  <h4 className="text-[13px] font-bold text-amber-800 mb-0.5">Driver Payouts Only</h4>
                  <p className="text-[12.5px] text-amber-700/80 font-medium leading-relaxed">
                    Carpool drivers receive manual payouts from the business owner. School commissions have been removed.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13.5px] font-semibold text-slate-700">Driver Payout Schedule</label>
                <Select defaultValue="monthly">
                  <SelectTrigger className="h-[42px] bg-slate-50/80 border-slate-200 focus:ring-slate-200 text-[14px] font-medium shadow-none rounded-[8px]">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100">
                <p className="text-[13.5px] font-semibold text-slate-500">Carpool Pricing</p>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="font-semibold text-slate-700">Per Carpool Ride</span>
                  <span className="font-black text-slate-900">฿300</span>
                </div>
                <div className="flex justify-between items-center text-[14px]">
                  <span className="font-semibold text-slate-700">Driver Gets (Fixed)</span>
                  <span className="font-black text-emerald-600">฿300</span>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-[16px] border border-red-200/60 shadow-sm bg-red-50/30">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-[16px] font-bold text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              <Button variant="outline" className="w-full h-[44px] rounded-[10px] font-bold text-orange-600 border-orange-200 bg-white hover:bg-orange-50/50 hover:text-orange-700">
                Suspend School
              </Button>
              <Button variant="outline" className="w-full h-[44px] rounded-[10px] font-bold text-red-600 border-red-200 bg-white hover:bg-red-50/50 hover:text-red-700">
                Delete School
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
