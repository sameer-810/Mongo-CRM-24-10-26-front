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
import { Reminder } from "@/lib/mock-data";
import { Lead } from "@/lib/types";
import { Bell, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { addReminderAction } from "@/app/leads/actions";
import { useAuth } from "@/contexts/auth-context";
import { useReminders } from "@/contexts/reminder-context";

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: () => void;
}

const REMINDER_TYPES = [
  { value: "call", label: "Call Back" },
  { value: "meeting", label: "Meeting" },
  { value: "follow_up", label: "Follow Up" },
  { value: "document", label: "Document Collection" },
  { value: "other", label: "Other" },
] as const;

export function AddReminderModal({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: AddReminderModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshReminders } = useReminders();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  // Calculate default time: current time + 5 minutes
  const getDefaultTime = (): string => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [time, setTime] = useState(getDefaultTime());
  const [reminderType, setReminderType] =
    useState<Reminder["reminderType"]>("follow_up");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Update time to current time + 5 minutes when modal opens
  useEffect(() => {
    if (isOpen) {
      setTime(getDefaultTime());
    }
  }, [isOpen]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lead) {
      toast({
        title: "Error",
        description: "No lead selected",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reminder title",
        variant: "destructive",
      });
      return;
    }

    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    // Combine date and time
    const [hours, minutes] = time.split(":").map(Number);
    const dateTime = new Date(date);
    dateTime.setHours(hours, minutes, 0, 0);

    if (dateTime <= new Date()) {
      setTimeError("Please select a future time");
      toast({
        title: "Error",
        description: "Please select a future date and time",
        variant: "destructive",
      });
      return;
    }

    // Clear any time error if validation passes
    setTimeError(null);

    setIsSubmitting(true);

    try {
      const response = await addReminderAction({
        leadId: typeof lead.id === "string" ? parseInt(lead.id) : lead.id,
        userId: typeof user.id === "string" ? parseInt(user.id) : user.id,
        title: title.trim(),
        reminderDateTime: dateTime.toISOString(),
        description: description.trim() || "",
        status: "pending",
        // type: reminderType,
      });

      if ((response as any)?.success !== false) {
        toast({
          title: "Success",
          description: "Reminder added successfully",
        });

        // Reset form
        setTitle("");
        setDescription("");
        setDate(undefined);
        setTime("10:00");
        setReminderType("follow_up");

        // Refresh reminders to update the list
        await refreshReminders();

        // Call success callback to refresh data
        onSuccess?.();
        onClose();
      } else {
        throw new Error((response as any)?.message || "Failed to add reminder");
      }
    } catch (error: any) {
      console.error("Error adding reminder:", error);
      toast({
        title: "Error",
        description:
          error?.message || "Failed to add reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Add Reminder
          </DialogTitle>
          <DialogDescription>
            Set a reminder for {lead.fullname || "Lead"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Reminder Type */}
          <div className="space-y-2">
            <Label>Reminder Type</Label>
            <Select
              value={reminderType}
              onValueChange={(v) =>
                setReminderType(v as Reminder["reminderType"])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              <span className="text-destructive">*</span> Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Follow up on visa application"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      // Re-validate time when date changes
                      if (selectedDate && time) {
                        const [hours, minutes] = time.split(":").map(Number);
                        const dateTime = new Date(selectedDate);
                        dateTime.setHours(hours, minutes, 0, 0);

                        if (dateTime <= new Date()) {
                          setTimeError("Please select a future time");
                        } else {
                          setTimeError(null);
                        }
                      } else {
                        setTimeError(null);
                      }
                    }}
                    initialFocus
                    disabled={(date) => {
                      // Allow today and future dates, but disable past dates
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const compareDate = new Date(date);
                      compareDate.setHours(0, 0, 0, 0);
                      return compareDate < today;
                    }}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Time
              </Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => {
                  const newTime = e.target.value;
                  setTime(newTime);

                  // Validate if date is selected
                  if (date) {
                    const [hours, minutes] = newTime.split(":").map(Number);
                    const dateTime = new Date(date);
                    dateTime.setHours(hours, minutes, 0, 0);

                    if (dateTime <= new Date()) {
                      setTimeError("Please select a future time");
                    } else {
                      setTimeError(null);
                    }
                  } else {
                    setTimeError(null);
                  }
                }}
                className={timeError ? "border-destructive" : ""}
              />
              {timeError && (
                <p className="text-xs text-destructive">{timeError}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              placeholder="Add any additional notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              <Bell className="w-4 h-4" />
              {isSubmitting ? "Adding..." : "Add Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
