import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface FieldOption {
  value: string;
  label: string;
}

export type CRMFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'select'
  | 'textarea'
  | 'switch'
  | 'checkbox'
  | 'radio'
  | 'date';

/** Every input type we support boils down to one of these primitive shapes. */
export type CRMFieldValue = string | number | boolean | Date | undefined;

export interface CRMFieldProps {
  type?: CRMFieldType;
  label: string;
  name?: string;
  description?: string;
  placeholder?: string;
  value?: CRMFieldValue;
  defaultValue?: CRMFieldValue;
  onChange?: (val: CRMFieldValue) => void;
  options?: FieldOption[];
  className?: string; // Appended to the inner input directly
  wrapperClassName?: string; // Appended to the outer wrap
  disabled?: boolean;
}

export function CRMField({
  type = 'text',
  label,
  name,
  description,
  placeholder,
  value,
  defaultValue,
  onChange,
  options = [],
  className,
  wrapperClassName,
  disabled,
}: CRMFieldProps) {
  // Architectural design standard for inputs (h-11, rounded-12px, soft-grey bg)
  const standardizedBase =
    'bg-[#F9FAFB] border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 min-h-11 rounded-[12px] px-4 text-sm placeholder:text-muted-foreground/50 transition-colors';

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            placeholder={placeholder}
            disabled={disabled}
            defaultValue={defaultValue as string | number | undefined}
            value={value as string | number | undefined}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              standardizedBase,
              'py-3 resize-y min-h-[100px]',
              className,
            )}
          />
        );

      case 'select':
        return (
          <Select
            disabled={disabled}
            defaultValue={defaultValue as string | undefined}
            value={value as string | undefined}
            onValueChange={(v) => onChange?.(v ?? undefined)}
          >
            <SelectTrigger
              className={cn(
                standardizedBase,
                'h-11 w-full font-medium bg-[#F9FAFB]',
                className,
              )}
            >
              <SelectValue placeholder={placeholder || 'Select option'} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-sm">
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'switch':
        return (
          <Switch
            disabled={disabled}
            checked={Boolean(value ?? defaultValue)}
            onCheckedChange={onChange}
            className={className}
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            disabled={disabled}
            checked={Boolean(value ?? defaultValue)}
            onCheckedChange={onChange}
            className={cn(
              'h-5 w-5 rounded-[6px] border-muted-foreground/30',
              className,
            )}
          />
        );

      case 'radio':
        return (
          <RadioGroup
            disabled={disabled}
            defaultValue={defaultValue as string | undefined}
            value={value as string | undefined}
            onValueChange={(v) => onChange?.(v ?? undefined)}
            className={cn('flex flex-col gap-3', className)}
          >
            {options.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-3">
                <RadioGroupItem
                  value={opt.value}
                  id={`radio-${name}-${opt.value}`}
                />
                <label
                  htmlFor={`radio-${name}-${opt.value}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {opt.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant={'outline'}
                  className={cn(
                    standardizedBase,
                    'w-full h-11 justify-start text-left font-normal',
                    !value && 'text-muted-foreground',
                    className,
                  )}
                >
                  <CalendarIcon className="mr-3 h-4 w-4" />
                  {value ? (
                    format(new Date(value as string | number | Date), 'PPP')
                  ) : (
                    <span>{placeholder || 'Pick a date'}</span>
                  )}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0 rounded-xl" align="start">
              <Calendar
                mode="single"
                selected={
                  value ? new Date(value as string | number | Date) : undefined
                }
                onSelect={onChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      default:
        return (
          <Input
            type={type}
            disabled={disabled}
            placeholder={placeholder}
            defaultValue={defaultValue as string | number | undefined}
            value={value as string | number | undefined}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(standardizedBase, 'h-11', className)}
          />
        );
    }
  };

  if (type === 'switch' || type === 'checkbox') {
    return (
      <div className={cn('flex items-start gap-3', wrapperClassName)}>
        <div className="mt-0.5">{renderInput()}</div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {description && (
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {renderInput()}
      {description && (
        <p className="text-[13px] text-muted-foreground mt-0.5 px-0.5 leading-snug">
          {description}
        </p>
      )}
    </div>
  );
}
