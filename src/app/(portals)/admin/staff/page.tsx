'use client';

import { useQuery } from '@tanstack/react-query';
import { crmService } from '@/mocks/services/crm';
import { CRMStatCards } from '@/components/shared/CRMStatCards';
import { CRMFilterBar } from '@/components/shared/CRMFilterBar';
import { CRMTableWrapper } from '@/components/shared/CRMTableWrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserPlus, MoreVertical, Send, Ban, Trash2, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CRMField } from '@/components/shared/CRMField';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function StaffCRMPage() {
  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: crmService.getStaff,
  });

  const stats = [
    { label: 'Total Staff', value: staff?.length || 0 },
    { label: 'Active', value: staff?.filter(s => s.status === 'active').length || 0, colorClass: 'text-emerald-500' },
    { label: 'Administrators', value: staff?.filter(s => s.role === 'Administrator').length || 0, colorClass: 'text-violet-500' },
    { label: 'Suspended', value: staff?.filter(s => s.status === 'suspended').length || 0, colorClass: 'text-orange-500' },
  ];

  const filters = [
    { placeholder: 'All Roles', options: [{ label: 'Administrator', value: 'admin' }, { label: 'Staff', value: 'staff' }] },
    { placeholder: 'All Status', options: [{ label: 'Active', value: 'active' }, { label: 'Suspended', value: 'suspended' }] },
  ];

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [managingStaff, setManagingStaff] = useState<any>(null);
  const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);

  const handleSendInvite = () => {
    setIsInviteModalOpen(false);
    toast.success('Invite Sent Successfully', {
      description: 'An invitation email has been dispatched to the staff member.'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Staff CRM</h2>
      </div>

      <CRMStatCards metrics={stats} />
      
      <CRMFilterBar 
        searchPlaceholder="Search by name or email..." 
        filters={filters} 
        actionLabel="Invite Staff" 
        actionIcon={<UserPlus className="h-4 w-4" />} 
        onActionClick={() => setIsInviteModalOpen(true)}
      />

      <CRMTableWrapper title={`Staff Directory (${staff?.length || 0})`}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : staff?.map((member) => (
              <TableRow key={member.id} className="hover:bg-muted/30">
                <TableCell className="pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-primary/10">
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{member.name}</span>
                      <span className="text-xs text-muted-foreground">{member.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={member.role === 'Administrator' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-2.5 py-0.5' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-none px-2.5 py-0.5'}>
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={member.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-0.5' : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-2.5 py-0.5'}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{member.lastLogin}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{member.joined}</TableCell>
                <TableCell className="text-right pr-6">
                  <button onClick={() => setManagingStaff(member)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CRMTableWrapper>

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Invite School Staff</DialogTitle>
              <DialogDescription className="text-[15px] mt-1.5">
                Send an invite link via the staff member's school email address.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex flex-col gap-5 p-6 pt-2">
            <CRMField 
              label="Full Name" 
              placeholder="e.g. Khun Somchai" 
            />
            
            <CRMField 
              type="email" 
              label="School Email" 
              placeholder="name@sunshine.school.th" 
              description="Must be a school email domain" 
            />
            
            <CRMField 
              type="select" 
              label="Role" 
              defaultValue="staff" 
              options={[
                { label: 'Administrator', value: 'admin' },
                { label: 'Staff', value: 'staff' }
              ]} 
            />
          </div>
          
          <div className="p-6 pt-2 flex justify-end gap-3 mt-2">
            <Button variant="outline" className="h-11 px-6 rounded-xl border-border shadow-none font-medium" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
            <Button className="h-11 px-6 rounded-xl gap-2 font-medium shadow-none bg-[#C084FC] hover:bg-[#A855F7] text-white" onClick={handleSendInvite}>
              <Send className="h-[18px] w-[18px]" />
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Staff Modal */}
      <Dialog open={!!managingStaff} onOpenChange={(open) => !open && setManagingStaff(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden gap-0">
          <div className="p-6 pb-4 border-b border-border/50">
            <DialogHeader className="mb-1 text-left">
              <DialogTitle className="text-xl font-bold">Manage: {managingStaff?.name}</DialogTitle>
              <DialogDescription className="text-sm">
                {managingStaff?.email}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex flex-col gap-4 p-6 pt-5">
            <div className="flex items-center border border-border/50 rounded-xl p-3 px-4 bg-muted/20">
              <span className="text-sm text-muted-foreground font-medium w-[120px]">Current Role:</span>
              <Badge variant="secondary" className={managingStaff?.role === 'Administrator' ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-none px-2.5 py-0.5' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-none px-2.5 py-0.5'}>
                {managingStaff?.role}
              </Badge>
            </div>
            
            <div className="flex items-center border border-border/50 rounded-xl p-3 px-4 bg-muted/20">
              <span className="text-sm text-muted-foreground font-medium w-[120px]">Current Status:</span>
              <Badge variant="secondary" className={managingStaff?.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2.5 py-0.5' : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-none px-2.5 py-0.5'}>
                {managingStaff?.status}
              </Badge>
            </div>
            
            <div className="flex flex-col gap-3 mt-1">
              {managingStaff?.status === 'active' ? (
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 h-11"
                  onClick={() => {
                    toast.success('Account Suspended', { description: `${managingStaff?.name}'s account has been suspended.` });
                    setManagingStaff(null);
                  }}
                >
                  <Ban className="mr-3 h-4 w-4" /> Suspend Account
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 h-11"
                  onClick={() => {
                     toast.success('Account Reactivated', { description: `${managingStaff?.name}'s account is active again.` });
                     setManagingStaff(null);
                  }}
                >
                  <CheckCircle className="mr-3 h-4 w-4" /> Reactivate Account
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 h-11"
                onClick={() => setIsConfirmRemoveOpen(true)}
              >
                <Trash2 className="mr-3 h-4 w-4" /> Remove Staff Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Staff Modal */}
      <Dialog open={isConfirmRemoveOpen} onOpenChange={setIsConfirmRemoveOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription className="mt-2 text-[13px] leading-relaxed">
              Are you absolute sure you want to completely remove <strong className="text-foreground font-semibold">{managingStaff?.name}</strong>? This action cannot be undone and will permanently revoke their access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" className="border-border shadow-none" onClick={() => setIsConfirmRemoveOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="gap-2 shadow-none" onClick={() => {
              toast.error('Staff Member Removed', {
                 description: `${managingStaff?.name} has been permanently removed from the system.`
              });
              setIsConfirmRemoveOpen(false);
              setManagingStaff(null);
            }}>
               <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
