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
import { WHATSAPP_TEMPLATES, WhatsAppStatus } from "@/lib/mock-data";
import { FollowType, Lead } from "@/lib/types";
import { MessageCircle, Send, Check, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCallAction } from "@/app/leads/actions";

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess?: () => void; // Callback to refresh data after successful send
}

export function WhatsAppModal({
  isOpen,
  onClose,
  lead,
  onSuccess,
}: WhatsAppModalProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSelectTemplate = (templateId: string) => {
    const template = WHATSAPP_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCustomMessage(template.message);
    }
  };

  const handleSendMessage = async () => {
    if (!customMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (!lead?.whatsapp && !lead?.phone) {
      toast({
        title: "Error",
        description: "No WhatsApp number available for this lead",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Log the WhatsApp interaction via API (followTypeId: 2 for WhatsApp)
      const response = await createCallAction({
        leadId: String(lead.id),
        followType: "WhatsApp" as FollowType,
        remarks: customMessage,
        outcome: "sent",
        callTime: new Date().toISOString(),
      });

      if ((response as any)?.success !== false) {
        // Clean phone number (remove spaces, dashes, etc.)
        const phoneNumber = (lead.whatsapp || lead.phone)
          .replace(/[^0-9+]/g, "")
          .replace("+", "");

        // Encode message for URL
        const encodedMessage = encodeURIComponent(customMessage);

        // Open WhatsApp Web or App with the message
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, "_blank");

        if (response.success) {
          toast({
            title: "Success",
            description: "WhatsApp message logged and opened",
          });
        } else {
          toast({
            title: "Error",
            description: response.message,
            variant: "destructive",
          });
        }

        // Call success callback to refresh data
        onSuccess?.();

        // Reset and close
        setSelectedTemplate("");
        setCustomMessage("");
        onClose();
      } else {
        throw new Error(
          (response as any)?.message || "Failed to log WhatsApp message"
        );
      }
    } catch (error: any) {
      console.error("Error sending WhatsApp message:", error);
      toast({
        title: "Error",
        description:
          error?.message || "Failed to log WhatsApp message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!lead) return null;

  const whatsappNumber = lead.whatsapp || lead.phone;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="pb-4 border-b px-6 pt-6 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold mb-1">
                Send WhatsApp Message
              </DialogTitle>
              <DialogDescription className="text-sm">
                Send message to <span className="font-medium text-foreground">{lead.fullname || "Lead"}</span>
                <span className="block text-xs mt-0.5 text-muted-foreground">{whatsappNumber}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 px-6 py-6 overflow-y-auto flex-1">
          {/* Template Selection */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Quick Templates
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {WHATSAPP_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  type="button"
                  variant={
                    selectedTemplate === template.id ? "default" : "outline"
                  }
                  size="sm"
                  className="justify-start text-xs h-9 px-3"
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  {selectedTemplate === template.id && (
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Message</Label>
            <Textarea
              placeholder="Type your WhatsApp message here..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              This will open WhatsApp with the message pre-filled
            </p>
          </div>

        </div>
        
        <DialogFooter className="gap-2 pt-4 pb-6 px-6 border-t shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="h-10">
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            className="gap-2 h-10 min-w-[150px] bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
            disabled={!customMessage.trim() || isSending}
          >
            <Send className="w-4 h-4" />
            {isSending ? "Sending..." : "Open WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
