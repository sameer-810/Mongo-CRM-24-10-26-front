import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { CallStatus, CALL_STATUS_LABELS } from "@/lib/mock-data";
import { Phone, Clock, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCallAction } from "@/app/leads/actions";
import { FollowType, Lead } from "@/lib/types";

interface AddCallLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  onSuccess?: () => void;
}

export function AddCallLogModal({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: AddCallLogModalProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<CallStatus | "">("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!status) {
      toast({
        title: "Error",
        description: "Please select a call status",
        variant: "destructive",
      });
      return;
    }

    // Prevent multiple submissions
    if (isLoading) return;

    setIsLoading(true);

    try {
      const duration =
        parseInt(durationMinutes || "0") * 60 + parseInt(durationSeconds || "0");

      const response = await createCallAction({
        leadId: String(lead.id),
        followType: "Call" as FollowType,
        remarks: remarks,
        duration: duration,
        outcome: status,
        callTime: new Date().toISOString(),
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "Call log added successfully",
        });

        // Notify parent so lead details (e.g. call logs list) can refresh
        onSuccess?.();

        // Reset form
        setStatus("");
        setDurationMinutes("");
        setDurationSeconds("");
        setRemarks("");
        onClose();
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save call log",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="pb-4 border-b px-6 pt-6 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-1">
                Log Call
              </DialogTitle>
              <DialogDescription className="text-sm">
                Log call details for <span className="font-medium text-foreground">{lead.fullname}</span> ({lead.phone})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-5 px-6 py-6 overflow-y-auto flex-1">
          {/* Quick Call Button */}
          {/* <Button
            type="button"
            variant="outline"
            className="w-full gap-2 text-primary hover:text-primary"
            onClick={handleInitiateCall}
          >
            <Phone className="w-4 h-4" />
            Call {lead.phone}
          </Button> */}

          {/* Call Status */}
          <div className="space-y-2.5">
            <Label htmlFor="status" className="text-sm font-medium flex items-center gap-1.5">
              <span className="text-destructive text-base">*</span>
              Call Status
            </Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as CallStatus)}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select call outcome..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CALL_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full ${value === "connected" || value === "interested"
                          ? "bg-green-500"
                          : value === "callback"
                            ? "bg-yellow-500"
                            : value === "busy"
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                      />
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration (only show if connected) */}
          {(status === "connected" || status === "interested") && (
            <div className="space-y-2.5">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Call Duration
              </Label>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    placeholder="Minutes"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="h-11"
                  />
                  <span className="text-xs text-muted-foreground mt-1.5 block">Minutes</span>
                </div>
                <span className="text-2xl text-muted-foreground font-light pb-5">
                  :
                </span>
                <div className="flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="Seconds"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(e.target.value)}
                    className="h-11"
                  />
                  <span className="text-xs text-muted-foreground mt-1.5 block">Seconds</span>
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Remarks / Notes
            </Label>
            <Textarea
              placeholder="Add any notes about the call..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          </div>
          
          <DialogFooter className="gap-2 pt-4 pb-6 px-6 border-t shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="h-10">
              Cancel
            </Button>
            <Button type="submit" className="gap-2 h-10 min-w-[140px]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Save Call Log
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
