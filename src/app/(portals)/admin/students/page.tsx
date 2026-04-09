'use client';

import { useQuery } from '@tanstack/react-query';
import { crmService } from '@/mocks/services/crm';
import { CRMStatCards } from '@/components/shared/CRMStatCards';
import { CRMFilterBar } from '@/components/shared/CRMFilterBar';
import { CRMTableWrapper } from '@/components/shared/CRMTableWrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Eye, FileText, Edit, ShieldAlert, Phone, Users, Camera, Save, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CRMField } from '@/components/shared/CRMField';
import { Button } from '@/components/ui/button';

export default function StudentCRMPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { data: students, isLoading } = useQuery({
    queryKey: ['students-all'],
    queryFn: crmService.getStudents,
  });

  const { data: statsData } = useQuery({
    queryKey: ['studentStats'],
    queryFn: crmService.getStudentStats,
  });

  const stats = [
    { label: 'Total Students', value: statsData?.total || 0 },
    { label: 'Enrolled', value: statsData?.enrolled || 0, colorClass: 'text-emerald-500 font-bold' },
    { label: <span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> With Notes</span> as unknown as string, value: statsData?.withNotes || 0, colorClass: 'text-blue-500 font-bold' },
  ];

  const filters = [
    { placeholder: 'All Grades', options: [{ label: 'Grade 1', value: '1' }, { label: 'Grade 2', value: '2' }, { label: 'Grade 3', value: '3' }, { label: 'Grade 4', value: '4' }, { label: 'Grade 5', value: '5' }, { label: 'Grade 6', value: '6' }] },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Student CRM</h2>
      </div>

      <CRMStatCards metrics={stats} />
      
      <CRMFilterBar 
        searchPlaceholder="Search by name, email, ID, or family..." 
        filters={filters} 
      />

      <CRMTableWrapper title={`Student Directory (${students?.length || 0})`}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-border/50">
              <TableHead className="pl-6 font-bold text-foreground h-12">Student</TableHead>
              <TableHead className="font-bold text-foreground">Grade</TableHead>
              <TableHead className="font-bold text-foreground">Family</TableHead>
              <TableHead className="font-bold text-foreground">Notes</TableHead>
              <TableHead className="font-bold text-foreground">Status</TableHead>
              <TableHead className="text-right pr-6 font-bold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : students?.map((student) => (
              <TableRow key={student.id} className="hover:bg-muted/10 border-b-border/40 transition-colors">
                <TableCell className="pl-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-[38px] w-[38px] bg-blue-100 border-0">
                      <AvatarFallback className="text-blue-700 bg-blue-100 text-[13px] font-bold">
                        {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-[13.5px] text-foreground/90">{student.name}</span>
                      <span className="text-[12.5px] text-muted-foreground mt-0.5">{student.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-blue-100/80 text-blue-700 hover:bg-blue-100 border-none px-2 py-0 text-[11px] font-semibold tracking-wide">
                    {student.grade}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-[13.5px] text-muted-foreground/90">{student.family}</TableCell>
                <TableCell className="text-[13.5px] text-muted-foreground max-w-[200px] truncate">{student.notes}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-emerald-100/80 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0 text-[11px] font-semibold tracking-wide">
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <button onClick={() => { setSelectedStudent(student); setIsEditing(false); }} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground/60 hover:text-foreground">
                    <Eye className="h-[18px] w-[18px]" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CRMTableWrapper>

      {/* Student Detail & Edit Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => {
        if (!open) {
          setSelectedStudent(null);
          setIsEditing(false);
        }
      }}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-[16px] gap-0 border-border/40 shadow-xl">
          {selectedStudent && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <Avatar className="h-[52px] w-[52px] bg-blue-100 border-0">
                    <AvatarFallback className="text-blue-700 bg-blue-100 text-lg font-bold">
                      {selectedStudent.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <h3 className="text-[19px] font-bold text-foreground leading-tight">{selectedStudent.name}</h3>
                    <span className="text-[13.5px] text-muted-foreground">{selectedStudent.email}</span>
                  </div>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="h-[34px] shadow-none rounded-[8px] px-3.5 font-semibold text-[13px] gap-1.5 mr-6 border-border/60 hover:bg-muted/50">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
              </div>
              
              <div className="space-y-7">
                {/* BASIC INFORMATION */}
                <div className="space-y-3.5">
                  <h4 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider">Basic Information</h4>
                  {!isEditing ? (
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-muted/30 border border-border/60 rounded-[12px] p-3.5">
                        <span className="text-[12px] font-medium text-muted-foreground block mb-0.5">ID</span>
                        <span className="text-[14.5px] font-medium font-mono text-foreground/90">{selectedStudent.id.replace('stu_', 'student-')}</span>
                      </div>
                      <div className="bg-muted/30 border border-border/60 rounded-[12px] p-3.5">
                        <span className="text-[12px] font-medium text-muted-foreground block mb-0.5">Grade & Section</span>
                        <span className="text-[14.5px] font-medium text-foreground/90">{selectedStudent.grade}</span>
                      </div>
                      <div className="bg-muted/30 border border-border/60 rounded-[12px] p-3.5">
                        <span className="text-[12px] font-medium text-muted-foreground flex gap-1.5 items-center mb-0.5">
                          <Users className="h-3.5 w-3.5"/> Family
                        </span>
                        <span className="text-[14.5px] font-medium text-foreground/90">{selectedStudent.family}</span>
                      </div>
                      <div className="bg-muted/30 border border-border/60 rounded-[12px] p-3.5">
                        <span className="text-[12px] font-medium text-muted-foreground flex gap-1.5 items-center mb-0.5">
                          <Camera className="h-3.5 w-3.5"/> Photo Consent
                        </span>
                        <span className="text-[14px] font-bold text-emerald-600">Granted</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-muted/30 border border-border/60 rounded-[12px] p-3.5">
                        <span className="text-[12px] font-medium text-muted-foreground block mb-0.5">ID</span>
                        <span className="text-[14.5px] font-medium font-mono text-foreground/90">{selectedStudent.id.replace('stu_', 'student-')}</span>
                      </div>
                      <div className="bg-muted/30 border border-border/60 rounded-[12px] p-3.5">
                        <span className="text-[12px] font-medium text-muted-foreground block mb-0.5">Grade & Section</span>
                        <span className="text-[14.5px] font-medium text-foreground/90">{selectedStudent.grade}</span>
                      </div>
                      <CRMField 
                        type="text" 
                        label="Family" 
                        placeholder="Family" 
                        defaultValue={selectedStudent.family} 
                      />
                      <CRMField 
                        type="select" 
                        label="Photo Consent" 
                        options={[{value: 'yes', label: 'Yes'}, {value: 'no', label: 'No'}]} 
                        defaultValue="yes" 
                      />
                    </div>
                  )}
                </div>

                {/* EMERGENCY CONTACT */}
                <div className="space-y-3.5">
                  <h4 className="flex items-center gap-2 text-[12px] font-bold text-red-500 uppercase tracking-wider">
                    <ShieldAlert className="h-4 w-4" /> Emergency Contact
                  </h4>
                  {!isEditing ? (
                    <div className="bg-red-50/40 border border-red-100 rounded-[12px] p-4">
                      <span className="text-[14.5px] font-medium text-foreground/90 block">Sarah Johnson</span>
                      <span className="text-[13.5px] text-muted-foreground flex gap-2 items-center mt-1.5 font-medium">
                        <Phone className="h-3.5 w-3.5" /> +66 81 234 5678
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3.5">
                      <CRMField type="text" label="Name" defaultValue="Sarah Johnson" />
                      <CRMField type="text" label="Phone" defaultValue="+66 81 234 5678" />
                    </div>
                  )}
                </div>

                {/* IMPORTANT NOTES */}
                <div className="space-y-3.5">
                  <h4 className="flex items-center gap-2 text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <FileText className="h-4 w-4" /> Important Notes
                  </h4>
                  {!isEditing ? (
                    <p className={`text-[14.5px] font-medium ${selectedStudent.notes?.length > 1 && selectedStudent.notes !== '-' ? 'text-foreground/90' : 'text-blue-400/80'}`}>
                      {selectedStudent.notes?.length > 1 && selectedStudent.notes !== '-' ? selectedStudent.notes : 'No notes added'}
                    </p>
                  ) : (
                    <CRMField type="textarea" label="" placeholder="Add any important notes about this student (visible to parents in the app)..." defaultValue={selectedStudent.notes?.length > 1 && selectedStudent.notes !== '-' ? selectedStudent.notes : ''} />
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 mt-8">
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl px-5 h-11 shadow-none font-semibold text-foreground/80 gap-2 border-border/80">
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button onClick={() => setIsEditing(false)} className="bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl px-5 h-11 shadow-none font-bold text-white gap-2 text-md">
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
