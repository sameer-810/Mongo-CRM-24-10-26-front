import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { FollowType, Lead } from "@/lib/types";
import { Mail, Send, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCallAction } from "@/app/leads/actions";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess?: () => void; // Callback to refresh data after successful send
}

export function EmailModal({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: EmailModalProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (!lead?.email) {
      toast({
        title: "Error",
        description: "No email address available for this lead",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Log the Email interaction via API (followTypeId: 3 for Email)
      const emailContent = subject
        ? `Subject: ${subject}\n\n${message}`
        : message;

      const response = await createCallAction({
        leadId: String(lead.id),
        followType: "Email" as FollowType,
        remarks: emailContent,
        outcome: "sent",
        callTime: new Date().toISOString(),
      });

      if ((response as any)?.success !== false) {
        // Open email client with pre-filled content
        const emailBody = encodeURIComponent(message);
        const emailSubject = encodeURIComponent(subject || "Follow up");
        const mailtoUrl = `mailto:${lead.email}?subject=${emailSubject}&body=${emailBody}`;
        
        // Use window.location.href to properly trigger mailto: in Outlook/default email client
        window.location.href = mailtoUrl;

        toast({
          title: "Success",
          description: "Email logged and email client opened",
        });

        // Call success callback to refresh data
        onSuccess?.();

        // Reset and close
        setSubject("");
        setMessage("");
        onClose();
      } else {
        throw new Error((response as any)?.message || "Failed to log email");
      }
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to log email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="pb-4 border-b px-6 pt-6 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-1">
                Send Email
              </DialogTitle>
              <DialogDescription className="text-sm">
                Send email to <span className="font-medium text-foreground">{lead.fullname || "Lead"}</span> 
                <span className="block text-xs mt-0.5 text-muted-foreground">{lead.email}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6 overflow-y-auto flex-1">
          {/* Subject Input */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Subject
            </Label>
            <input
              type="text"
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Message Input */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Message</Label>
            <Textarea
              placeholder="Type your email message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              This will open your email client with the message pre-filled
            </p>
          </div>

        </div>
        
        <DialogFooter className="gap-2 pt-4 pb-6 px-6 border-t shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="h-10">
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            className="gap-2 h-10 min-w-[160px] bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            disabled={!message.trim() || isSending}
          >
            <Send className="w-4 h-4" />
            {isSending ? "Sending..." : "Open Email Client"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
