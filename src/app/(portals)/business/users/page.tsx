'use client';

import React from 'react';
import { 
  UsersRound, Users, Car, Shield, Search, Plus, 
  MoreVertical, ShieldCheck, Mail, Phone, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const mockUsers = [
  { id: 'USR-1042', name: 'Eleanor Pena', initials: 'EP', email: 'eleanor.p@example.com', phone: '+66 81 234 5678', role: 'Parent', school: 'International School Bangkok', joined: 'Oct 2025', status: 'Active' },
  { id: 'USR-1043', name: 'Marvin McKinney', initials: 'MM', email: 'marvin.m@example.com', phone: '+66 82 345 6789', role: 'Driver', school: 'Bangkok Prep School', joined: 'Nov 2025', status: 'Active' },
  { id: 'USR-1044', name: 'Alice Wong', initials: 'AW', email: 'alice.w@isb.ac.th', phone: '+66 83 456 7890', role: 'School Staff', school: 'International School Bangkok', joined: 'Jan 2026', status: 'Active' },
  { id: 'USR-1045', name: 'Jenny Wilson', initials: 'JW', email: 'jenny.w@example.com', phone: '+66 84 567 8901', role: 'Parent', school: 'NIST International', joined: 'Feb 2026', status: 'Pending' },
  { id: 'USR-1046', name: 'Robert Fox', initials: 'RF', email: 'robert.f@admin.safepickup.com', phone: '+66 85 678 9012', role: 'Business Admin', school: 'All Schools', joined: 'Sep 2025', status: 'Active' },
  { id: 'USR-1047', name: 'Jerome Bell', initials: 'JB', email: 'jerome.b@example.com', phone: '+66 86 789 0123', role: 'Driver', school: 'KIS International', joined: 'Dec 2025', status: 'Suspended' },
];

export default function PlatformUsersPage() {
  
  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'Parent':
        return <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 px-2.5 py-0.5 rounded-[6px] font-bold">Parent</Badge>;
      case 'Driver':
        return <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-[6px] font-bold">Driver</Badge>;
      case 'School Staff':
        return <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 px-2.5 py-0.5 rounded-[6px] font-bold">School Staff</Badge>;
      case 'Business Admin':
        return <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 px-2.5 py-0.5 rounded-[6px] font-bold tracking-wide">Business Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Active':
        return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-[12.5px] font-semibold text-slate-700">Active</span></div>;
      case 'Pending':
        return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[12.5px] font-semibold text-slate-700">Pending</span></div>;
      case 'Suspended':
        return <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[12.5px] font-semibold text-slate-700">Suspended</span></div>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 w-full max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-bold tracking-tight text-foreground leading-none">Platform Users</h2>
          <p className="text-[14px] text-muted-foreground mt-1.5 font-medium">Manage and monitor all parents, drivers, and school staff</p>
        </div>
        <Button className="h-[40px] rounded-[10px] bg-[#020617] hover:bg-slate-800 text-white shadow-sm font-semibold px-5 flex items-center gap-2 transition-all">
          <Plus className="w-[18px] h-[18px]" strokeWidth={2.5} /> Add User
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1 md:max-w-[360px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" strokeWidth={2} />
          <Input 
            placeholder="Search by name, email, or phone..." 
            className="pl-10 h-[44px] w-full rounded-[10px] bg-slate-50 border-slate-200/80 text-[14px] shadow-sm focus-visible:ring-2 focus-visible:ring-slate-200 focus-visible:bg-white focus-visible:ring-offset-0 font-medium placeholder:text-slate-500 transition-colors"
          />
        </div>
        
        <div className="w-full sm:w-[180px]">
          <Select defaultValue="all-roles">
            <SelectTrigger className="h-[44px] bg-white border-slate-200/80 focus:ring-slate-200 shadow-sm text-[14px] font-medium rounded-[10px] w-full">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-roles">All Roles</SelectItem>
              <SelectItem value="parent">Parents</SelectItem>
              <SelectItem value="driver">Drivers</SelectItem>
              <SelectItem value="staff">School Staff</SelectItem>
              <SelectItem value="admin">Business Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-[260px]">
          <Select defaultValue="all-schools">
            <SelectTrigger className="h-[44px] bg-white border-slate-200/80 focus:ring-slate-200 shadow-sm text-[14px] font-medium rounded-[10px] w-full">
              <SelectValue placeholder="School" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-schools">All Affiliations</SelectItem>
              <SelectItem value="isb">International School Bangkok</SelectItem>
              <SelectItem value="prep">Bangkok Prep School</SelectItem>
              <SelectItem value="nist">NIST International School</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-500 mb-0.5">Total Users</span>
              <span className="text-[26px] font-black text-foreground leading-none tracking-tight">4,567</span>
            </div>
            <div className="h-11 w-11 flex items-center justify-center rounded-full bg-blue-50 text-blue-500">
               <UsersRound className="w-[22px] h-[22px]" strokeWidth={2.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-500 mb-0.5">Parents</span>
              <span className="text-[26px] font-black text-foreground leading-none tracking-tight">3,892</span>
            </div>
            <div className="h-11 w-11 flex items-center justify-center rounded-full bg-purple-50 text-purple-500">
               <Users className="w-[22px] h-[22px]" strokeWidth={2.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-500 mb-0.5">Drivers</span>
              <span className="text-[26px] font-black text-foreground leading-none tracking-tight">127</span>
            </div>
            <div className="h-11 w-11 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
               <Car className="w-[22px] h-[22px]" strokeWidth={2.5} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-slate-500 mb-0.5">School Staff</span>
              <span className="text-[26px] font-black text-foreground leading-none tracking-tight">420</span>
            </div>
            <div className="h-11 w-11 flex items-center justify-center rounded-full bg-amber-50 text-amber-500">
               <ShieldCheck className="w-[22px] h-[22px]" strokeWidth={2.5} />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Users Data Table */}
      <Card className="rounded-[16px] border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        <CardHeader className="pb-4 pt-6 px-7 bg-white">
          <CardTitle className="text-[16px] font-bold text-foreground">User Directory</CardTitle>
        </CardHeader>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1050px]">
            {/* Header Row */}
            <div className="grid grid-cols-[2.5fr_1.5fr_2fr_2fr_1fr_1fr_80px] gap-4 px-7 py-3 border-y border-slate-100/80 bg-slate-50/50">
              <div className="text-[12.5px] font-semibold text-slate-500">User Profile</div>
              <div className="text-[12.5px] font-semibold text-slate-500">Role</div>
              <div className="text-[12.5px] font-semibold text-slate-500">Affiliation</div>
              <div className="text-[12.5px] font-semibold text-slate-500">Contact</div>
              <div className="text-[12.5px] font-semibold text-slate-500">Joined</div>
              <div className="text-[12.5px] font-semibold text-slate-500">Status</div>
              <div className="text-[12.5px] font-semibold text-slate-500 text-right">Actions</div>
            </div>

            {/* Data Rows */}
            <div className="flex flex-col bg-white">
              {mockUsers.map((user, i) => (
                <div key={user.id} className={`grid grid-cols-[2.5fr_1.5fr_2fr_2fr_1fr_1fr_80px] gap-4 px-7 py-4 items-center hover:bg-slate-50/50 transition-colors ${i !== mockUsers.length - 1 ? 'border-b border-slate-100/50' : ''}`}>
                  
                  {/* User Profile */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      <span className="text-[13px] font-bold text-slate-600">{user.initials}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-slate-800 leading-tight">{user.name}</span>
                      <span className="text-[12px] text-slate-400 font-medium tracking-tight">{user.id}</span>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    {getRoleBadge(user.role)}
                  </div>

                  {/* Affiliation */}
                  <div className="text-[13.5px] text-slate-600 font-medium line-clamp-1">
                    {user.school}
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-1 text-[12.5px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  </div>

                  {/* Joined Date */}
                  <div className="flex items-center gap-1.5 text-[13px] text-slate-600 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {user.joined}
                  </div>

                  {/* Status */}
                  <div>
                    {getStatusBadge(user.status)}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-0.5">
                    <button className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-[6px] transition-colors">
                      <MoreVertical className="w-[18px] h-[18px]" strokeWidth={2}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}
