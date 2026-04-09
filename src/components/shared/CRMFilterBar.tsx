import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

export interface FilterOption {
  placeholder: string;
  options: { label: string; value: string }[];
}

interface CRMFilterBarProps {
  searchPlaceholder?: string;
  filters?: FilterOption[];
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  actionClassName?: string;
  onActionClick?: () => void;
}

export function CRMFilterBar({
  searchPlaceholder = 'Search...',
  filters = [],
  actionLabel,
  actionIcon,
  actionClassName,
  onActionClick
}: CRMFilterBarProps) {
  return (
    <Card className="p-3 mb-6 shadow-sm flex flex-col sm:flex-row gap-3 items-center border-border">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground/70" />
        <Input 
          placeholder={searchPlaceholder} 
          className="pl-10 bg-muted/40 border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 h-10 text-[14px]"
        />
      </div>
      
      <div className="flex gap-3 w-full sm:w-auto items-center">
        {filters.map((filter, index) => (
          <Select key={index}>
            <SelectTrigger className="w-full sm:w-[140px] bg-[#F4F5F7] hover:bg-[#EAECEF] transition-colors border-0 shadow-none text-[13.5px] h-10 rounded-[10px] px-4 font-medium focus:ring-1 focus:ring-primary/20">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-sm">
              <SelectItem value="all" className="font-medium text-[13.5px]">{filter.placeholder}</SelectItem>
              {filter.options.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-[13.5px]">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {actionLabel && (
          <Button onClick={onActionClick} className={`h-10 px-5 gap-2 font-medium rounded-xl shadow-none ${actionClassName || ''}`}>
            {actionIcon}
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
