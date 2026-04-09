'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { portals, PortalIdentifier } from '@/config/portals';
import { useAuthStore } from '@/hooks/use-auth-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell, Check, Trash2, Shield, LayoutDashboard, Users, UsersRound,
  GraduationCap, Car, Settings, ClipboardList, LineChart, CreditCard,
  Radio, ChevronRight, LogOut, Home, Briefcase, Building2, DollarSign, Bluetooth
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/hooks/use-app-store';
import { useMockNotifications } from '@/hooks/use-mock-notifications';
import { formatDistanceToNow } from 'date-fns';

const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, UsersRound, GraduationCap, Car, Settings,
  ClipboardList, Bell, LineChart, CreditCard, Radio, Home, Briefcase,
  Building2, DollarSign, Bluetooth
};

interface PortalShellProps {
  children: React.ReactNode;
  portalId: PortalIdentifier;
}

export function PortalShell({ children, portalId }: PortalShellProps) {
  const config = portals[portalId];
  const { user } = useAuthStore();
  const { notifications, markAllAsRead, clearNotifications } = useAppStore();
  const unreadCount = notifications.filter(n => !n.read).length;
  const pathname = usePathname();

  useMockNotifications();

  return (
    <div className={`flex min-h-screen w-full bg-background ${config.themeClass}`}>
      {/* Sidebar Overlay */}
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col sticky top-0 h-screen">
        <div className="flex shrink-0 h-20 items-center border-b border-border/50 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-primary text-primary-foreground shadow-sm">
              {portalId === 'staff' ? (
                <Car className="h-[22px] w-[22px]" strokeWidth={2.5} />
              ) : portalId === 'business' ? (
                <Building2 className="h-[22px] w-[22px]" strokeWidth={2.5} />
              ) : (
                <Shield className="h-6 w-6" strokeWidth={2.5} />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold leading-none tracking-tight text-foreground">SafePickup</span>
              <span className="mt-1.5 text-sm font-medium leading-none text-muted-foreground">{config.name}</span>
            </div>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-2 p-4">
            {config.navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== config.basePath && pathname.startsWith(item.href));
              const Icon = IconMap[item.icon] || LayoutDashboard;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`} />
                    {item.title}
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="shrink-0 p-4 border-t border-border/50 space-y-1">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all">
            <LogOut className="h-5 w-5" />
            Back to Landing Page
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-glass-panel px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{config.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative rounded-full" />}>
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={markAllAsRead} title="Mark all read">
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={clearNotifications} title="Clear all">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications right now.
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-border/50 text-sm transition-colors ${!notif.read ? 'bg-primary/5' : 'opacity-80'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="leading-tight">{notif.message}</p>
                            {!notif.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1" />}
                          </div>
                          <span className="text-xs text-muted-foreground mt-2 block">
                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full" />}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-primary">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/">Switch Portal</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 relative">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none -z-10" />
          {children}
        </main>
      </div>
    </div>
  );
}
