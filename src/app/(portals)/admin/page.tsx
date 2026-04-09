'use client';

import { Users, Car, GraduationCap, UserCog, UserCheck, UserX, Server, Database, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const handleApprove = (name: string) => {
    toast.success(`Approved ${name}`, {
      description: 'An activation email has been sent to the parent.'
    });
  };

  const handleReject = (name: string) => {
    toast.error(`Rejected ${name}`, {
      description: 'The parent registration has been declined.'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Families</p>
                <div className="text-4xl font-extrabold tracking-tight">6</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium">5 active</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Pickups Today</p>
                <div className="text-4xl font-extrabold tracking-tight">7</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <Car className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium">3 active now</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Students Enrolled</p>
                <div className="text-4xl font-extrabold tracking-tight">9</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium">across 6 families</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Staff Members</p>
                <div className="text-4xl font-extrabold tracking-tight">6</div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <UserCog className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium">5 active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="py-4 border-b border-border/50 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Pending Approvals</CardTitle>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">3 pending</Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { name: 'Sarah Johnson', email: 'sarah.j@example.com', badge: 'Primary Parent', date: '2026-02-24' },
                { name: 'Michael Chen', email: 'm.chen@example.com', badge: 'Additional Parent', date: '2026-02-24' },
                { name: 'Emma Davis', email: 'emma.d@example.com', badge: 'Primary Parent', date: '2026-02-23' },
              ].map((parent, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm gap-4">
                  <div className="flex flex-col space-y-2">
                    <div>
                      <h4 className="font-bold text-foreground text-base tracking-tight">{parent.name}</h4>
                      <p className="text-sm text-muted-foreground">{parent.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-none font-medium hover:bg-blue-100">
                        {parent.badge}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-medium">{parent.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleApprove(parent.name)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-semibold shrink-0">
                      <UserCheck className="h-4 w-4" /> Approve
                    </Button>
                    <Button onClick={() => handleReject(parent.name)} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 shrink-0 px-2.5">
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions and Status */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { title: 'Staff CRM', desc: 'Manage school staff', icon: <UserCog className="h-5 w-5 text-muted-foreground" />, href: '/admin/staff' },
                { title: 'Family CRM', desc: 'Manage families & accounts', icon: <Users className="h-5 w-5 text-muted-foreground" />, href: '/admin/families' },
                { title: 'Student CRM', desc: 'Student records & health', icon: <GraduationCap className="h-5 w-5 text-muted-foreground" />, href: '/admin/students' },
                { title: 'Pickup CRM', desc: "Today's pickup status", icon: <Car className="h-5 w-5 text-muted-foreground" />, href: '/admin/pickups' },
              ].map((action, idx) => (
                <Link key={idx} href={action.href} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-md hover:border-border/80 transition-all group">
                  <div className="p-2 rounded-lg bg-muted/50 group-hover:bg-muted/80 transition-colors">
                    {action.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{action.title}</span>
                    <span className="text-xs text-muted-foreground">{action.desc}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="py-4 border-b border-border/50">
              <CardTitle className="text-base">System Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Server Status</span>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none px-2 font-medium">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none px-2 font-medium">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">API Response</span>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none px-2 font-medium">Fast</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
