import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CRMTableWrapperProps {
  title: string;
  children: React.ReactNode;
}

export function CRMTableWrapper({ title, children }: CRMTableWrapperProps) {
  return (
    <Card className="shadow-sm border-border overflow-hidden">
      <CardHeader className="py-4 border-b border-border/50">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">{children}</div>
      </CardContent>
    </Card>
  );
}
