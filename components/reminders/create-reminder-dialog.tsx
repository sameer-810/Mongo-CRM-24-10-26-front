"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { addReminderAction } from "@/app/leads/actions";
import { useAuth } from "@/contexts/auth-context";
import { useReminders } from "@/contexts/reminder-context";

interface CreateReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultLeadId?: string;
}

const REMINDER_TYPES = [
  { value: "call", label: "Call Back" },
  { value: "meeting", label: "Meeting" },
  { value: "follow_up", label: "Follow Up" },
  { value: "document", label: "Document Collection" },
  { value: "other", label: "Other" },
] as const;

export default function CreateReminderDialog({
  open,
  onOpenChange,
  defaultLeadId,
}: CreateReminderDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshReminders } = useReminders();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("09:00");
  const [type, setType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setDate(new Date());
      setTime("09:00");
      setType("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!defaultLeadId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No lead selected",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reminder title",
      });
      return;
    }

    if (!date) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a date",
      });
      return;
    }

    if (!type) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a reminder type",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const [hours, minutes] = time.split(":").map(Number);
      const reminderDateTime = new Date(date);
      reminderDateTime.setHours(hours, minutes, 0, 0);

      const result = await addReminderAction({
        leadId: parseInt(defaultLeadId),
        userId: user?.id ? parseInt(user.id) : 0,
        title: title.trim(),
        description: description.trim(),
        reminderDateTime: reminderDateTime.toISOString(),
        status: "pending",
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Reminder created successfully",
        });
        // Refresh reminders to update the list
        await refreshReminders();
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to create reminder",
        });
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create reminder",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="pb-4 border-b px-6 pt-6 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-1">
                Create Reminder
              </DialogTitle>
              <DialogDescription className="text-sm">
                Set a reminder for follow-up
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-5 px-6 py-6 overflow-y-auto flex-1">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Follow up on application"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10"
                required
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select reminder type" />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Date <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium">
                Time <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-10 pl-10"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Add any additional notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20 shrink-0">
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none h-10"
              >
                {isSubmitting ? "Creating..." : "Create Reminder"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
