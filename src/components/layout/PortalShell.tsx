'use client';

import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  Bluetooth,
  Briefcase,
  Building2,
  Car,
  Check,
  ChevronRight,
  CircleUser,
  ClipboardList,
  CreditCard,
  DollarSign,
  GraduationCap,
  Home,
  LayoutDashboard,
  LineChart,
  LogOut,
  Radio,
  School,
  Settings,
  Shield,
  Trash2,
  Users,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type PortalIdentifier, portals } from '@/config/portals';
import { useAppStore } from '@/hooks/use-app-store';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useMockNotifications } from '@/hooks/use-mock-notifications';
import { apiKeys, useApi } from '@/lib/api';
import type { ApiEnvelope, UserMe } from '@/types';

const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  UsersRound,
  GraduationCap,
  Car,
  Settings,
  ClipboardList,
  Bell,
  CircleUser,
  LineChart,
  CreditCard,
  Radio,
  Home,
  Briefcase,
  Building2,
  DollarSign,
  Bluetooth,
  ArrowUpFromLine,
  ArrowDownToLine,
};

interface PortalShellProps {
  children: React.ReactNode;
  portalId: PortalIdentifier;
}

export function PortalShell({ children, portalId }: PortalShellProps) {
  const config = portals[portalId];
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearSession = useAuthStore((s) => s.clearSession);
  const roles = useAuthStore((s) => s.roles);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notifications, markAllAsRead, clearNotifications } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const pathname = usePathname();
  const t = useTranslations();
  const tShell = useTranslations('Portal.shell');

  useMockNotifications();

  // Profile lives in React Query so it stays fresh without a manual store
  // hydration step. Disabled while logged out so we don't fire a doomed
  // request from the layout itself.
  const meQuery = useApi<ApiEnvelope<UserMe>>(apiKeys.users.me(), {
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
  const me = meQuery.data?.data;

  // TEMP: backend hasn't shipped `GET /api/v1/schools/:id` yet. We were
  // 404-ing on every page load. For now, show a fallback name from env.
  // To re-enable the real lookup once backend lands the endpoint:
  //   const schoolQuery = useApi<ApiEnvelope<School>>(
  //     apiKeys.schools.byId(me.school_id),
  //     { enabled: !!me?.school_id, staleTime: 60 * 60 * 1000 },
  //   );
  //   const schoolName = schoolQuery.data?.data?.name ?? '';
  const schoolName = process.env.NEXT_PUBLIC_MOCK_SCHOOL_NAME ?? '';
  const isSchoolLoading = false;

  const fullName =
    me && (me.first_name || me.last_name)
      ? `${me.first_name} ${me.last_name}`.trim()
      : (me?.email ?? '');
  const initials =
    me?.first_name || me?.last_name
      ? `${me.first_name?.[0] ?? ''}${me.last_name?.[0] ?? ''}`.toUpperCase()
      : (me?.email?.[0]?.toUpperCase() ?? 'U');

  // Title-case the JWT role string for display ("admin" → "Admin"). Roles
  // come from the login response (`LoginData.roles`). Falls back to the
  // portal id if the JWT didn't carry any.
  const primaryRole = roles[0] ?? portalId;
  const roleLabel =
    primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1).toLowerCase();

  const handleLogout = () => {
    clearSession();
    queryClient.clear();
    router.push('/login');
  };

  return (
    <div
      className={`flex min-h-screen w-full bg-background ${config.themeClass}`}
    >
      {/* Sidebar Overlay */}
      <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col sticky top-0 h-screen">
        <div className="flex shrink-0 flex-col gap-3 border-b border-border/50 px-6 py-5">
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
              <span className="text-2xl font-bold leading-none tracking-tight text-foreground">
                SafePickup
              </span>
              <span className="mt-1.5 text-sm font-medium leading-none text-muted-foreground">
                {t(config.nameKey)}
              </span>
            </div>
          </Link>
          {schoolName && (
            <div
              className="inline-flex max-w-full items-center gap-1.5 self-start rounded-full bg-primary/10 px-2.5 py-1 text-primary"
              title={schoolName}
            >
              <School className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate text-[12px] font-semibold">
                {schoolName}
              </span>
            </div>
          )}
        </div>
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-2 p-4">
            {config.navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== config.basePath &&
                  pathname.startsWith(item.href));
              const Icon = IconMap[item.icon] || LayoutDashboard;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`}
                    />
                    {t(item.titleKey)}
                  </div>
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom — "Logged in as" identity card + logout. Replaces the
            old "Back to Landing" link (still reachable via the avatar
            dropdown's Switch Portal item). */}
        <div className="shrink-0 border-t border-border/50 p-4 space-y-3">
          {me && (
            <div className="space-y-0.5 px-2">
              <span className="text-[11px] font-medium text-muted-foreground/80">
                {tShell('loggedInAs')}
              </span>
              <p className="text-[14px] font-bold text-foreground leading-tight">
                {fullName || tShell('guest')}
              </p>
              <p className="text-[11.5px] text-muted-foreground/80 leading-snug pt-0.5">
                {schoolName ? `${roleLabel} · ${schoolName}` : roleLabel}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
          >
            <LogOut className="h-5 w-5" />
            {tShell('signOut')}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-glass-panel px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">{t(config.nameKey)}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                  />
                }
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h4 className="font-semibold text-sm">
                    {tShell('notifications')}
                  </h4>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={markAllAsRead}
                        title={tShell('markAllRead')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={clearNotifications}
                      title={tShell('clearAll')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[300px]">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {tShell('noNotifications')}
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
                            {!notif.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-primary mt-1" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground mt-2 block">
                            {formatDistanceToNow(new Date(notif.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="h-auto gap-3 rounded-xl px-2 py-1.5 hover:bg-muted/50"
                  />
                }
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                    {meQuery.isLoading ? '' : initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start leading-tight md:flex">
                  {meQuery.isLoading ? (
                    <>
                      <span className="h-3 w-24 animate-pulse rounded bg-muted" />
                      <span className="mt-1.5 h-2.5 w-32 animate-pulse rounded bg-muted/70" />
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-[13.5px] text-foreground">
                        {fullName || tShell('guest')}
                      </span>
                      <span className="text-[11.5px] text-muted-foreground">
                        {schoolName ||
                          (isSchoolLoading
                            ? tShell('loadingSchool')
                            : tShell('schoolUnknown'))}
                      </span>
                    </>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                {/*
                  Base UI requires `GroupLabel` (rendered by DropdownMenuLabel)
                  to live inside a `<Menu.Group>` — without it the primitive
                  throws `MenuGroupRootContext is missing`. Always wrap the
                  account-info block in DropdownMenuGroup.
                */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {fullName || tShell('guest')}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {me?.email ?? ''}
                      </p>
                      {schoolName && (
                        <p className="pt-1.5 text-xs leading-none text-muted-foreground/80">
                          {schoolName}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>{tShell('profile')}</DropdownMenuItem>
                <DropdownMenuItem>{tShell('settings')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/">{tShell('switchPortal')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-700 focus:bg-red-50"
                >
                  {tShell('signOut')}
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
