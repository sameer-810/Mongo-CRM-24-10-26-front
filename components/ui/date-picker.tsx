"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  showClear?: boolean;
  disabled?: (date: Date) => boolean;
  className?: string;
  buttonClassName?: string;
  allowPastDates?: boolean;
  title?: string;
}

interface DateRangePickerProps {
  fromDate?: Date;
  toDate?: Date;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onApply?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  label?: string;
  showClear?: boolean;
  disabled?: (date: Date) => boolean;
  className?: string;
  buttonClassName?: string;
  allowPastDates?: boolean;
  title?: string;
  canApply?: boolean;
}

// Single Date Picker Component
export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  label,
  showClear = true,
  disabled,
  className,
  buttonClassName,
  allowPastDates = true,
  title = "Select Date",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClear = () => {
    onDateChange(undefined);
  };

  const defaultDisabled = (date: Date) => {
    if (!allowPastDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today;
    }
    return false;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            buttonClassName
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">{title}</span>
            {showClear && date && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
              setIsOpen(false);
            }}
            disabled={disabled || defaultDisabled}
            initialFocus
            className="rounded-md border"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Date Range Picker Component
export function DateRangePicker({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onApply,
  onCancel,
  placeholder = "Select Date",
  label,
  showClear = true,
  disabled,
  className,
  buttonClassName,
  allowPastDates = false,
  title = "Filter by Date",
  canApply = true,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempFromDate, setTempFromDate] = React.useState<Date | undefined>(
    fromDate
  );
  const [tempToDate, setTempToDate] = React.useState<Date | undefined>(toDate);

  React.useEffect(() => {
    setTempFromDate(fromDate);
    setTempToDate(toDate);
  }, [fromDate, toDate]);

  const handleClear = () => {
    setTempFromDate(undefined);
    setTempToDate(undefined);
    onFromDateChange(undefined);
    onToDateChange(undefined);
    setIsOpen(false);
  };

  const handleApply = () => {
    onFromDateChange(tempFromDate);
    onToDateChange(tempToDate);
    onApply?.();
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempFromDate(fromDate);
    setTempToDate(toDate);
    onCancel?.();
    setIsOpen(false);
  };

  const defaultDisabled = (date: Date) => {
    if (!allowPastDates) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return date > today;
    }
    return false;
  };

  const getDisplayText = () => {
    if (fromDate && toDate) {
      return `${format(fromDate, "dd MMM")} - ${format(toDate, "dd MMM")}`;
    }
    if (fromDate) {
      return format(fromDate, "dd MMM yyyy");
    }
    return placeholder;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-[160px] sm:w-[180px] lg:w-[190px] justify-start text-left font-normal bg-background border-border/50 text-xs hover:bg-accent/10 hover:border-accent/30 transition-colors",
            (fromDate || toDate) && "text-foreground border-primary/30",
            buttonClassName
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate font-medium">{getDisplayText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">{title}</span>
            {showClear && (fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Side-by-side calendars */}
          <div className="flex gap-4">
            {/* From Date Calendar */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground block">
                From Date
              </label>
              <div className="date-picker-from [&_.rdp-day_today]:!bg-cyan-500/25 [&_.rdp-day_today]:!text-cyan-700 dark:[&_.rdp-day_today]:!bg-cyan-400/30 dark:[&_.rdp-day_today]:!text-cyan-200 [&_.rdp-day_today]:!font-bold [&_.rdp-day_today]:!border-2 [&_.rdp-day_today]:!border-cyan-500 dark:[&_.rdp-day_today]:!border-cyan-400 [&_.rdp-day_today]:!rounded-md [&_button[data-selected-single='true']]:!bg-blue-600 [&_button[data-selected-single='true']]:!text-white dark:[&_button[data-selected-single='true']]:!bg-blue-500 [&_button[data-selected-single='true']]:!font-bold [&_button[data-selected-single='true']]:!shadow-lg [&_button[data-selected-single='true']]:!ring-2 [&_button[data-selected-single='true']]:!ring-blue-400/50 dark:[&_button[data-selected-single='true']]:!ring-blue-300/50">
                <Calendar
                  mode="single"
                  selected={tempFromDate}
                  onSelect={(date) => {
                    setTempFromDate(date || undefined);
                  }}
                  disabled={(date) => {
                    const customDisabled = disabled?.(date) || false;
                    const defaultDisabledValue = defaultDisabled(date);
                    const rangeDisabled = tempToDate ? date > tempToDate : false;
                    return customDisabled || defaultDisabledValue || rangeDisabled;
                  }}
                  initialFocus
                  className="rounded-md border"
                />
              </div>
            </div>

            {/* To Date Calendar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-0">
                <label className="text-xs font-medium text-muted-foreground">
                  To Date <span className="text-[10px] opacity-60">(Optional)</span>
                </label>
                {tempToDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTempToDate(undefined)}
                    className="h-5 px-1.5 text-[10px]"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div
                className={cn(
                  "date-picker-to [&_.rdp-day_today]:!bg-cyan-500/25 [&_.rdp-day_today]:!text-cyan-700 dark:[&_.rdp-day_today]:!bg-cyan-400/30 dark:[&_.rdp-day_today]:!text-cyan-200 [&_.rdp-day_today]:!font-bold [&_.rdp-day_today]:!border-2 [&_.rdp-day_today]:!border-cyan-500 dark:[&_.rdp-day_today]:!border-cyan-400 [&_.rdp-day_today]:!rounded-md [&_button[data-selected-single='true']]:!bg-emerald-600 [&_button[data-selected-single='true']]:!text-white dark:[&_button[data-selected-single='true']]:!bg-emerald-500 [&_button[data-selected-single='true']]:!font-bold [&_button[data-selected-single='true']]:!shadow-lg [&_button[data-selected-single='true']]:!ring-2 [&_button[data-selected-single='true']]:!ring-emerald-400/50 dark:[&_button[data-selected-single='true']]:!ring-emerald-300/50",
                  !tempFromDate && "opacity-50 pointer-events-none"
                )}
              >
                <Calendar
                  mode="single"
                  selected={tempToDate}
                  onSelect={(date) => {
                    setTempToDate(date || undefined);
                  }}
                  disabled={(date) => {
                    if (!tempFromDate) return true;
                    const customDisabled = disabled?.(date) || false;
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);
                    const defaultDisabledValue = date > today;
                    const rangeDisabled = date < tempFromDate;
                    return customDisabled || defaultDisabledValue || rangeDisabled;
                  }}
                  className="rounded-md border"
                />
              </div>
              {tempFromDate && (
                <p className="text-[10px] text-muted-foreground italic">
                  Leave empty for single date
                </p>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8 px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!canApply}
              className="h-8 px-4 text-xs font-medium"
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
