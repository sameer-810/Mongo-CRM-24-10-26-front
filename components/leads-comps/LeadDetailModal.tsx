import { useState, useEffect, useCallback } from "react";
import {
  STATUS_LABELS,
  VISA_CATEGORY_LABELS,
  STANDARD_LEAD_FIELDS,
  SYSTEM_FIELDS,
} from "@/lib/mock-data";
import { CALL_STATUS_LABELS } from "@/lib/enum";
import {
  Lead,
  LeadDetailData,
  LeadStage,
  LeadStatus,
  AssignmentHistoryItem,
  User as UserType,
  AgreementPlaceholder,
} from "@/lib/types";
import { cn, isStandardKey } from "@/lib/utils";
import {
  getRestDetailsByLeadIdAction,
  createNoteAction,
  getAssignableUsersAction,
  updateLeadAction,
  assignLeadAction,
  getAgreementTemplatesAction,
  getAgreementPlaceholdersAction,
  generateAgreementDocumentAction,
} from "@/app/leads/actions";
import { LeadStatusBadge, LeadStageBadge } from "./LeadStatusBadge";
import { WhatsAppModal } from "./WhatsAppModal";
import { LeadAssignmentModal } from "./LeadAssignmentModal";
import { useAuth } from "@/contexts/auth-context";
import { EmailModal } from "./EmailModal";
import { AddDocumentModal } from "@/components/documents/add-document-modal";
import {
  getDocumentsByLeadIdAction,
} from "@/app/documents/actions";
import { DocumentChecklistView } from "@/components/doc-checklist/document-checklist-view";
import { PORTUGAL_D2_CHECKLIST } from "@/components/doc-checklist/portugal-d2-documents";
import { PORTUGAL_D7_CHECKLIST } from "@/components/doc-checklist/portugal-d7-documents";
import { PORTUGAL_D8_CHECKLIST } from "@/components/doc-checklist/portugal-d8-documents";
import { SPAIN_DNV_CHECKLIST } from "@/components/doc-checklist/spain-dnv-documents";
import { SPAIN_NLV_CHECKLIST } from "@/components/doc-checklist/spain-nlv-documents";
import { UK_INNOVATOR_CHECKLIST } from "@/components/doc-checklist/uk-innovator-documents";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  User,
  Briefcase,
  Clock,
  FileText,
  Plus,
  Send,
  Globe,
  MapPin,
  CheckCircle,
  AlertCircle,
  UserPlus,
  ArrowRight,
  Loader2,
  Edit,
  Trash2,
  FileCheck,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  onLogCall?: () => void;
  onAddReminder?: () => void;
  onUploadDocument?: () => void;
  onAssignLead?: () => void;
  onAssignSuccess?: () => void;
  canAssign?: boolean;
  /** When this value changes, lead details (e.g. call logs) are refetched so the UI updates without a full refresh. */
  refreshCallLogsTrigger?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ROLE_STATUS_MAP: Record<string, LeadStatus[]> = {
  telecaller: [
    LeadStatus.NEW,
    LeadStatus.NOT_ANSWERED,
    LeadStatus.BUSY,
    LeadStatus.ANSWERED,
    LeadStatus.FOLLOW_UP,
    LeadStatus.MEETING_SCHEDULED,
    LeadStatus.MEETING_DONE,
    LeadStatus.AGREEMENT_PENDING,
    LeadStatus.AGREEMENT_DONE,
    LeadStatus.PAYMENT_PENDING,
    LeadStatus.PAYMENT_DONE,
    LeadStatus.NOT_INTERESTED,
    LeadStatus.NOT_ELIGIBLE,
    LeadStatus.NO_SHOW,
    LeadStatus.WRONG_NUMBER,
    LeadStatus.APPOINTMENT_BOOKED,
  ],
  advisor: [
    LeadStatus.NEW,
    LeadStatus.NOT_ANSWERED,
    LeadStatus.BUSY,
    LeadStatus.ANSWERED,
    LeadStatus.FOLLOW_UP,
    LeadStatus.MEETING_SCHEDULED,
    LeadStatus.MEETING_DONE,
    LeadStatus.AGREEMENT_PENDING,
    LeadStatus.AGREEMENT_DONE,
    LeadStatus.PAYMENT_PENDING,
    LeadStatus.PAYMENT_DONE,
    LeadStatus.NOT_INTERESTED,
    LeadStatus.NOT_ELIGIBLE,
    LeadStatus.NO_SHOW,
    LeadStatus.WRONG_NUMBER,
    LeadStatus.APPOINTMENT_BOOKED,
  ],
  processing: [
    LeadStatus.DOCUMENTATION,
    LeadStatus.COMPLETED,
    LeadStatus.VISA_GRANTED,
    LeadStatus.NIF_DONE,
    LeadStatus.INCORPORATION_DONE,
    LeadStatus.DECISION_PENDING,
    LeadStatus.ENDORSEMENT_GRANTED,
    LeadStatus.VISA_REJECTED,
    LeadStatus.REFUNDED,
  ],
};

export function LeadDetailModal({
  lead,
  isOpen,
  onClose,
  onStatusChange,
  onLogCall,
  onAddReminder,
  onAssignLead,
  onAssignSuccess,
  canAssign = false,
  refreshCallLogsTrigger,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}: LeadDetailModalProps) {
  const [newNote, setNewNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "">("");
  const [displayLead, setDisplayLead] = useState<LeadDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignableUsers, setAssignableUsers] = useState<UserType[]>([]);
  const [agreementTemplates, setAgreementTemplates] = useState<{ key: string; name: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [agreementPlaceholders, setAgreementPlaceholders] = useState<AgreementPlaceholder[]>([]);
  const [agreementValues, setAgreementValues] = useState<Record<string, string>>({});
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingPlaceholders, setIsLoadingPlaceholders] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLeadDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await getRestDetailsByLeadIdAction(String(id));
      if (response.success && response.data) {
        // Map the response data to handle email field conflict
        // getRestDetailsByLeadIdAction returns email as array (email attempts) per LeadDetailData type
        // We need email as string for display, and emailLogs for the email tab
        const mappedData = {
          ...response.data,
          // Use emailString if available, otherwise fallback to lead.email or first email attempt
          email:
            response.data.emailString ||
            lead?.email ||
            response.data.email?.[0]?.remarks ||
            response.data.emailLogs?.[0]?.remarks ||
            "",
          // emailLogs is already set by the action, fallback to email array
          emailLogs: response.data.emailLogs || response.data.email || [],
        };
        setDisplayLead(mappedData);
        setSelectedStatus(mappedData.status);
      }
    } catch (err: any) {
      console.error("Error fetching lead details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset fullLead when lead changes or modal closes
  const fetchAssignableUsers = async () => {
    try {
      const users = await getAssignableUsersAction();
      setAssignableUsers(users);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Error fetching assignable users",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (lead?.id) {
        fetchLeadDetails(String(lead.id));
        fetchAssignableUsers();
      }
    } else {
      setDisplayLead(null);
    }
  }, [isOpen, lead?.id]);

  // Fetch documents
  const fetchDocuments = async (leadId: string) => {
    try {
      const response = await getDocumentsByLeadIdAction(leadId);
      if (response && (response as any).success) {
        setDocuments((response as any).data || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  // Fetch full details when modal opens
  useEffect(() => {
    if (isOpen && lead?.id) {
      fetchLeadDetails(String(lead.id));
      fetchDocuments(String(lead.id));
    }
  }, [isOpen, lead?.id, lead?.email]);

  // Refetch lead details when call logs (or other activity) are updated from outside (e.g. AddCallLogModal onSuccess)
  useEffect(() => {
    if (
      isOpen &&
      lead?.id &&
      refreshCallLogsTrigger != null &&
      refreshCallLogsTrigger > 0
    ) {
      fetchLeadDetails(String(lead.id));
    }
  }, [refreshCallLogsTrigger]);

  // ===== Agreement =====
  const fetchAgreementTemplates = useCallback(async () => {
    if (agreementTemplates.length > 0) return; // already loaded
    setIsLoadingTemplates(true);
    try {
      const res = await getAgreementTemplatesAction();
      if (res?.success && res.data) {
        setAgreementTemplates(res.data);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load agreement templates",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [agreementTemplates.length]);

  const fetchAgreementPlaceholders = useCallback(async (templateName: string) => {
    if (!templateName) return;
    setIsLoadingPlaceholders(true);
    setAgreementPlaceholders([]);
    setAgreementValues({});
    try {
      const res = await getAgreementPlaceholdersAction(templateName);
      if (res?.success && res.data?.placeholders) {
        setAgreementPlaceholders(res.data.placeholders);
        // Pre-fill known lead fields automatically
        const prefill: Record<string, string> = {};
        const leadFields: Record<string, string | undefined> = {
          full_name: displayLead?.fullname,
          fullname: displayLead?.fullname,
          name: displayLead?.fullname,
          email: typeof displayLead?.email === "string" ? displayLead.email : "",
          phone: displayLead?.phone,
          whatsapp: displayLead?.whatsapp,
          country: displayLead?.country,
          target_country: displayLead?.targetCountry,
          visa_category: displayLead?.visaCategory,
          job_title: displayLead?.jobTitle,
        };
        for (const p of res.data.placeholders) {
          const key = p.name.toLowerCase();
          if (leadFields[key]) {
            prefill[p.name] = leadFields[key]!;
          }
        }
        setAgreementValues((prev) => ({ ...prefill, ...prev }));
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to load template placeholders",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPlaceholders(false);
    }
  }, [displayLead]);

  // Fetch templates when agreement tab is first shown
  useEffect(() => {
    if (isOpen && user?.role === "advisor") {
      fetchAgreementTemplates();
    }
  }, [isOpen, user?.role]);

  // Fetch placeholders when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      fetchAgreementPlaceholders(selectedTemplate);
    }
  }, [selectedTemplate]);

  const handleGenerateAgreement = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template first",
        variant: "destructive",
      });
      return;
    }
    setIsGeneratingDoc(true);
    try {
      const bytesArray = await generateAgreementDocumentAction(agreementValues, selectedTemplate);
      const uint8 = new Uint8Array(bytesArray);
      const blob = new Blob([uint8], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agreement_${displayLead?.fullname?.replace(/\s+/g, "_") || "document"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Agreement document downloaded successfully",
      });
    } catch (err: any) {
      console.error("Error generating agreement:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to generate agreement document",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  if (!displayLead || !lead) return null;

  const handleAddNote = async () => {
    if (!newNote.trim() || !displayLead) return;

    setIsAddingNote(true);
    try {
      const response = await createNoteAction(displayLead.id, newNote.trim());

      if ((response as any)?.success !== false) {
        toast({
          title: "Success",
          description: "Note added successfully",
        });
        // Refresh the lead data to show the new note
        await fetchLeadDetails(String(displayLead?.id));
        setNewNote("");
      } else {
        throw new Error((response as any)?.message || "Failed to add note");
      }
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleStatusChange = async (status: LeadStatus) => {
    if (!displayLead) return;

    setIsUpdatingStatus(true);
    try {
      const response = await updateLeadAction(String(displayLead.id), {
        status,
      });

      if (response && (response as any).success !== false) {
        toast({
          title: "Status Updated",
          description: `Lead status changed to ${STATUS_LABELS[status]}`,
        });
        setSelectedStatus(status);
        // Refresh the lead data to ensure everything is in sync
        await fetchLeadDetails(String(displayLead.id));

        if (onStatusChange) {
          onStatusChange(String(displayLead.id), status);
        }
      } else {
        throw new Error(
          (response as any)?.message || "Failed to update status",
        );
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description:
          error.message || "An error occurred while updating the status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignSubmit = async (
    leadId: string,
    assignToUserId: string,
    shareActivityLogs: boolean,
    notes?: string,
  ) => {
    // Using upsert endpoint - no need to fetch assignment ID
    // The backend will automatically update existing assignment or create new one based on leadId
    try {
      const response = await assignLeadAction({
        leadId: parseInt(leadId),
        assignedTo: parseInt(assignToUserId),
        assignedBy: parseInt(user?.id || "0"),
        remarks: notes || "",
        canAccessPreviousLogs: shareActivityLogs,
      });

      if (response && (response as any).success !== false) {
        toast({
          title: "Lead Assigned",
          description: "The lead has been reassigned successfully.",
        });
        if (onAssignSuccess) {
          onAssignSuccess();
        }
        setIsAssignModalOpen(false);
        if (onAssignLead) {
          onAssignLead();
        } else if (onClose) {
          onClose();
        }
      }
    } catch (error: any) {
      console.error("Error assigning lead:", error);
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign lead",
        variant: "destructive",
      });
    }
  };

  const notes = displayLead.notes ? [...displayLead.notes].reverse() : [];

  // Use direct arrays from API if available, otherwise filter from attempts
  const callLogs = displayLead.calls ? [...displayLead.calls].reverse() : [];

  // Note: API uses 'whatsApp' with capital A
  const whatsappLogs = displayLead.whatsApp
    ? [...displayLead.whatsApp].reverse()
    : [];

  // Note: API returns email attempts as 'email' array, but we map it to emailLogs to avoid conflict with email string
  const emailLogs = displayLead.emails ? [...displayLead.emails].reverse() : [];

  const reminders = displayLead.reminders
    ? [...displayLead.reminders].reverse()
    : [];
  // Use fetched documents or fallback to displayLead.documents
  const displayDocuments =
    documents.length > 0
      ? [...documents].reverse()
      : displayLead.documents
        ? [...displayLead.documents].reverse()
        : [];

  // Assignments logic
  const assignments = displayLead.assignmentHistory
    ? [...displayLead.assignmentHistory].reverse()
    : [];

  const updateSelectedDocumentCheckList = async (value: string) => {
    const response = await updateLeadAction(String(displayLead?.id), {
      selectedDocumentCheckList: value,
    });
    if (response && (response as any).success !== false) {
      toast({
        title: "Success",
        description: "Selected document checklist updated successfully",
      });
      fetchLeadDetails(String(displayLead?.id));
    } else {
      throw new Error((response as any)?.message || "Failed to update selected document checklist");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl! w-[90vw] max-h-[90vh] overflow-y-auto">
        {/* Enhanced Header with Actions */}
        <DialogHeader className="space-y-0 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Lead Info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-xl shadow-sm border border-primary/10">
                {displayLead.fullname?.charAt(0).toUpperCase() || "-"}
              </div>
              <div className="flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold mb-1 flex items-center gap-3">
                  {displayLead.fullname || "-"}
                  {isLoading && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </DialogTitle>
                {displayLead.jobTitle && (
                  <p className="text-sm text-muted-foreground font-medium mb-2">
                    {displayLead.jobTitle}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <LeadStatusBadge status={displayLead.status as LeadStatus} />
                  <LeadStageBadge
                    stage={
                      (displayLead.stage?.name.toLocaleLowerCase() as LeadStage) ||
                      "cold"
                    }
                  />
                  {displayLead.leadDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(displayLead.leadDate), "MMM dd, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Primary Actions */}
            <div className="flex items-start gap-2 shrink-0 me-4">
              {canAssign && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-9"
                  onClick={() => setIsAssignModalOpen(true)}
                >
                  <UserPlus className="w-4 h-4" />
                  Assign Lead
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-9"
                  onClick={onEdit}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2 h-9"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              )}
              <Select
                value={selectedStatus}
                onValueChange={(v) => handleStatusChange(v as LeadStatus)}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-[180px] h-9">
                  {isUpdatingStatus ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Update Status" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS)
                    .filter(([value]) => {
                      if (
                        !user?.role ||
                        user.role === "admin" ||
                        user.role === "manager"
                      ) {
                        return true;
                      }
                      const allowedStatuses =
                        ROLE_STATUS_MAP[user.role.toLowerCase()];
                      return allowedStatuses?.includes(value as LeadStatus);
                    })
                    .map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-6 mt-6">
          {/* Left Sidebar - Contact & Lead Info */}
          <div className="space-y-4">
            {/* Contact Info Card */}
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 rounded-xl p-5 border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wide">
                  Contact Info
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 group">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Phone
                    </p>
                    <p className="text-sm font-medium break-all">
                      {displayLead.phone || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 group">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Email
                    </p>
                    <p className="text-sm font-medium break-all">
                      {displayLead.email || "-"}
                    </p>
                  </div>
                </div>
                {displayLead.whatsapp && (
                  <div className="flex items-start gap-3 group">
                    <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        WhatsApp
                      </p>
                      <p className="text-sm font-medium break-all">
                        {displayLead.whatsapp}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Info Card */}
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 rounded-xl p-5 border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm uppercase tracking-wide">
                  Lead Info
                </h3>
              </div>
              <div className="space-y-3">
                {lead?.leadOwner && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Lead Owner
                      </p>
                      <p className="text-sm font-medium">{lead.leadOwner}</p>
                    </div>
                  </div>
                )}
                {lead?.leadSource && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Source
                      </p>
                      <p className="text-sm font-medium">{lead.leadSource}</p>
                      {lead.leadSource === "Meta" && (lead.metaForm?.name || lead.leadSubsource) && (
                        <span className="text-[11px] text-muted-foreground/70 truncate max-w-[220px] mt-1" title={lead.metaForm?.name || lead.leadSubsource}>
                          {lead.metaForm?.name || lead.leadSubsource}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {displayLead?.jobTitle && displayLead.jobTitle !== "-" && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Job Title
                      </p>
                      <p className="text-sm font-medium">{displayLead.jobTitle}</p>
                    </div>
                  </div>
                )}
                {displayLead.monthlyIncome &&
                  typeof displayLead.monthlyIncome === "number" && (
                    <div className="flex items-start gap-3">
                      <div className="w-4 h-4 flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                        <span className="text-xs font-bold">$</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Monthly Income
                        </p>
                        <p className="text-sm font-medium">
                          AED {displayLead.monthlyIncome.toLocaleString()}/month
                        </p>
                      </div>
                    </div>
                  )}

                {/* Display Dynamic FormData */}
                {displayLead.formData &&
                  Object.entries(displayLead.formData).length > 0 && (
                    <>
                      {Object.entries(displayLead.formData)
                        .filter(([key]) => {
                          if (SYSTEM_FIELDS.includes(key.toLowerCase())) return false;
                          return !isStandardKey(key, STANDARD_LEAD_FIELDS);
                        })
                        .map(([key, value], index, array) => {
                          // Render separator only if there are items and it's the first item
                          if (array.length > 0 && index === 0) {
                            return (
                              <div key="separator" className="w-full">
                                <div className="h-px bg-border/50 my-3" />
                                <div className="flex items-start gap-3">
                                  <div className="w-4 h-4 flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground mb-0.5">
                                      {key
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase(),
                                        )}
                                    </p>
                                    <p className="text-sm font-medium break-words">
                                      {typeof value === "boolean"
                                        ? value
                                          ? "Yes"
                                          : "No"
                                        : String(value)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          if (!value) return null;

                          return (
                            <div key={key} className="flex items-start gap-3">
                              <div className="w-4 h-4 flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-0.5">
                                  {key
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </p>
                                <p className="text-sm font-medium break-words">
                                  {typeof value === "boolean"
                                    ? value
                                      ? "Yes"
                                      : "No"
                                    : String(value)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </>
                  )}
              </div>
            </div>

            {/* Visa Details Card */}
            {(displayLead.visaCategory ||
              displayLead.country ||
              displayLead.targetCountry) && (
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 rounded-xl p-5 border border-border/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm uppercase tracking-wide">
                      Visa Details
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {displayLead.visaCategory &&
                      displayLead.visaCategory !== "-" && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">
                              Visa Category
                            </p>
                            <Badge variant="secondary" className="text-xs block w-full whitespace-normal break-words">
                              {String(displayLead.visaCategory).replace(
                                /_/g,
                                " ",
                              )}
                            </Badge>
                          </div>
                        </div>
                      )}
                    {displayLead.country && displayLead.country !== "-" && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">
                            From
                          </p>
                          <p className="text-sm font-medium">
                            {displayLead.country}
                          </p>
                        </div>
                      </div>
                    )}
                    {displayLead.targetCountry &&
                      displayLead.targetCountry !== "-" && (
                        <div className="flex items-start gap-3">
                          <Globe className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              To
                            </p>
                            <p className="text-sm font-medium text-primary">
                              {displayLead.targetCountry}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
          </div>

          {/* Right Section - Activity Tabs */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="notes" className="w-full">
              <TabsList className="w-full inline-flex h-9 items-center justify-start gap-0.5 rounded-lg bg-muted/50 p-1">
                <TabsTrigger
                  value="notes"
                  className="inline-flex items-center gap-1 rounded-md px-2 h-7 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Notes</span>
                  <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold data-[state=active]:bg-primary/10">
                    {notes.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="calls"
                  className="inline-flex items-center gap-1 rounded-md px-2 h-7 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Calls</span>
                  <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                    {callLogs.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="whatsapp"
                  className="inline-flex items-center gap-1 rounded-md px-2 h-7 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                  <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                    {whatsappLogs.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="emails"
                  className="inline-flex items-center gap-1 rounded-md px-2 h-7 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Emails</span>
                  <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                    {emailLogs.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="reminders"
                  className="inline-flex items-center gap-1 rounded-md px-2 h-7 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Reminders</span>
                  <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                    {reminders.length}
                  </span>
                </TabsTrigger>
                {user?.role === "advisor" && (
                  <TabsTrigger
                    value="agreement"
                    className="inline-flex items-center gap-1 rounded-md px-2 h-7 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Agreement</span>
                  </TabsTrigger>
                )}
                {(user?.role === "admin" ||
                  user?.role === "manager" ||
                  user?.role === "processing") && (
                    <TabsTrigger
                      value="documents"
                      className="inline-flex items-center gap-1 rounded-md px-2 h-7 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Docs</span>
                      <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                        {displayDocuments.length}
                      </span>
                    </TabsTrigger>
                  )}
                {(user?.role === "admin" || user?.role === "manager") && (
                  <TabsTrigger
                    value="assignments"
                    className="inline-flex items-center gap-1 rounded-md px-2 h-7 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>History</span>
                    <span className="ml-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                      {assignments.length}
                    </span>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="notes" className="mt-6 space-y-4">
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 rounded-xl p-4 border border-border/50 space-y-3">
                  <Textarea
                    placeholder="Write a note about this lead..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[90px] resize-none bg-background border-border/50 focus-visible:ring-primary"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddNote}
                      className="gap-2"
                      disabled={!newNote.trim() || isAddingNote}
                      size="sm"
                    >
                      {isAddingNote ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isAddingNote ? "Adding..." : "Add Note"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        No notes yet
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Add your first note to track this lead
                      </p>
                    </div>
                  ) : (
                    notes.map((note: any, index: number) => {
                      const noteText =
                        typeof note === "string"
                          ? note
                          : note.text || note.content || note;
                      const noteId = typeof note === "object" ? note.id : index;
                      const createdBy =
                        typeof note === "object" ? note.createdBy : null;
                      const createdAt =
                        typeof note === "object" ? note.createdAt : null;

                      return (
                        <div
                          key={noteId}
                          className="bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 rounded-xl p-4 border border-border/50 hover:border-primary/20 transition-colors"
                        >
                          <p className="text-sm text-foreground leading-relaxed mb-3">
                            {noteText}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            {createdBy && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span className="font-medium">{createdBy}</span>
                              </div>
                            )}
                            {createdAt && (
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {format(
                                    new Date(createdAt),
                                    "MMM d, yyyy h:mm a",
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              <TabsContent value="calls" className="mt-6 space-y-4">
                <Button
                  variant="outline"
                  className="w-full gap-2 h-10 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                  onClick={onLogCall}
                >
                  <Plus className="w-4 h-4" />
                  Log New Call
                </Button>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                  {callLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <Phone className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        No call logs yet
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Log your first call to start tracking
                      </p>
                    </div>
                  ) : (
                    callLogs.map((call: any) => (
                      <div
                        key={call.id}
                        className="bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 rounded-xl p-4 border border-border/50 hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "flex items-center gap-1.5 font-medium",
                              call.outcome === "connected" ||
                                call.outcome === "interested"
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                                : call.outcome === "callback"
                                  ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
                                  : call.outcome === "busy"
                                    ? "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                call.outcome === "connected" ||
                                  call.outcome === "interested"
                                  ? "bg-green-500"
                                  : call.outcome === "callback"
                                    ? "bg-yellow-500"
                                    : call.outcome === "busy"
                                      ? "bg-orange-500"
                                      : "bg-red-500",
                              )}
                            />
                            {CALL_STATUS_LABELS[
                              call.outcome as keyof typeof CALL_STATUS_LABELS
                            ] ||
                              call.outcome ||
                              call.status ||
                              "Unknown"}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(call.callTime), "MMM d, h:mm a")}
                            </span>
                          </div>
                        </div>
                        {call.duration > 0 && (
                          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>
                              Duration: {Math.floor(call.duration / 60)}m{" "}
                              {call.duration % 60}s
                            </span>
                          </div>
                        )}
                        {call.remarks && (
                          <p className="text-sm text-foreground leading-relaxed mb-3 pl-5">
                            {call.remarks}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <User className="w-3 h-3" />
                          <span className="font-medium">
                            {call.createdBy || "Unknown"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="whatsapp" className="mt-6 space-y-4">
                <Button
                  variant="outline"
                  className="w-full gap-2 h-10 border-dashed border-2 hover:border-green-600 hover:bg-green-600/5 text-green-600 dark:text-green-500"
                  onClick={() => setIsWhatsAppOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Send WhatsApp
                </Button>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                  {whatsappLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                        <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        No WhatsApp messages yet
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Send your first message to start conversation
                      </p>
                    </div>
                  ) : (
                    whatsappLogs.map((wa: any) => (
                      <div
                        key={wa.id}
                        className="bg-gradient-to-br from-green-500/5 to-muted/30 dark:from-green-500/5 dark:to-muted/20 rounded-xl p-4 border border-green-500/20 hover:border-green-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge
                            variant="secondary"
                            className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                          >
                            {wa.outcome || wa.status || "Sent"}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(wa.createdAt), "MMM d, h:mm a")}
                            </span>
                          </div>
                        </div>
                        {wa.remarks && (
                          <p className="text-sm text-foreground leading-relaxed mb-3">
                            {wa.remarks}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <User className="w-3 h-3" />
                          <span className="font-medium">
                            {wa.createdBy || wa.userName || "Unknown"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="emails" className="mt-6 space-y-4">
                <Button
                  variant="outline"
                  className="w-full gap-2 h-10 border-dashed border-2 hover:border-blue-600 hover:bg-blue-600/5 text-blue-600 dark:text-blue-500"
                  onClick={() => setIsEmailOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Send Email
                </Button>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                  {emailLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        No emails yet
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Send your first email to this lead
                      </p>
                    </div>
                  ) : (
                    emailLogs.map((em: any) => (
                      <div
                        key={em.id}
                        className="bg-gradient-to-br from-blue-500/5 to-muted/30 dark:from-blue-500/5 dark:to-muted/20 rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/30 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge
                            variant="secondary"
                            className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                          >
                            {em.outcome || em.status || "Sent"}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(em.createdAt), "MMM d, h:mm a")}
                            </span>
                          </div>
                        </div>
                        {em.remarks && (
                          <p className="text-sm text-foreground leading-relaxed mb-3">
                            {em.remarks}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <User className="w-3 h-3" />
                          <span className="font-medium">
                            {em.createdBy || em.userName || "Unknown"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reminders" className="mt-6 space-y-4">
                <Button
                  variant="outline"
                  className="w-full gap-2 h-10 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                  onClick={onAddReminder}
                >
                  <Plus className="w-4 h-4" />
                  Add Reminder
                </Button>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                  {reminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        No reminders set
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Set a reminder to follow up with this lead
                      </p>
                    </div>
                  ) : (
                    reminders.map((reminder: any) => {
                      const isCompleted = reminder.status === "completed";
                      const reminderDate = reminder.reminderDateTime
                        ? new Date(reminder.reminderDateTime)
                        : null;
                      const isOverdue =
                        reminderDate &&
                        reminderDate < new Date() &&
                        !isCompleted;

                      return (
                        <div
                          key={reminder.id}
                          className={cn(
                            "bg-gradient-to-br rounded-xl p-4 border transition-all",
                            isCompleted
                              ? "from-green-500/5 to-muted/30 dark:from-green-500/5 dark:to-muted/20 border-green-500/20 hover:border-green-500/30"
                              : isOverdue
                                ? "from-red-500/5 to-muted/30 dark:from-red-500/5 dark:to-muted/20 border-red-500/20 hover:border-red-500/30"
                                : "from-orange-500/5 to-muted/30 dark:from-orange-500/5 dark:to-muted/20 border-orange-500/20 hover:border-orange-500/30",
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-sm flex-1 pr-2">
                              {reminder.title || reminder.description}
                            </h4>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "shrink-0",
                                isCompleted
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                                  : isOverdue
                                    ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
                                    : "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
                              )}
                            >
                              {isCompleted ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              )}
                              {isCompleted
                                ? "Completed"
                                : isOverdue
                                  ? "Overdue"
                                  : reminder.status || "Pending"}
                            </Badge>
                          </div>
                          {reminder.description && reminder.title && (
                            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                              {reminder.description}
                            </p>
                          )}
                          {reminderDate && (
                            <div className="flex items-center gap-1.5 text-sm font-medium mb-2">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>
                                {format(reminderDate, "MMM d, yyyy h:mm a")}
                              </span>
                            </div>
                          )}
                          {reminder.createdBy && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                              <User className="w-3 h-3" />
                              <span className="font-medium">
                                {reminder.createdBy}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              {user?.role === "advisor" && (
                <TabsContent value="agreement" className="mt-6 space-y-4">
                  {/* Template Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Agreement Template</Label>
                    {isLoadingTemplates ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading templates...
                      </div>
                    ) : agreementTemplates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No templates available</p>
                    ) : (
                      <select
                        className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                      >
                        <option value="">-- Select a template --</option>
                        {agreementTemplates.map((t) => (
                          <option key={t.key} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Placeholder Inputs */}
                  {selectedTemplate && (
                    <>
                      {isLoadingPlaceholders ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground">Loading template fields...</p>
                        </div>
                      ) : agreementPlaceholders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                            <FileCheck className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">No template fields found</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">This template has no placeholders</p>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                            {/** group placeholders by section for display **/}
                            {Object.entries(
                              agreementPlaceholders.reduce<Record<string, AgreementPlaceholder[]>>((acc, p) => {
                                const sec = p.section || "";
                                (acc[sec] ??= []).push(p);
                                return acc;
                              }, {})
                            ).map(([section, list]) => (
                              <div key={section} className="space-y-2">
                                {section && (
                                  <h4 className="text-sm font-semibold">
                                    {section}
                                  </h4>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {list.map(({ name }) => {
                                    const label = name
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (c) => c.toUpperCase());
                                    return (
                                      <div key={name} className="space-y-1.5">
                                        <Label htmlFor={`agreement-${name}`} className="text-xs font-medium">
                                          {label}
                                        </Label>
                                        <Input
                                          id={`agreement-${name}`}
                                          placeholder={`Enter ${label.toLowerCase()}`}
                                          value={agreementValues[name] || ""}
                                          onChange={(e) =>
                                            setAgreementValues((prev) => ({
                                              ...prev,
                                              [name]: e.target.value,
                                            }))
                                          }
                                          className="h-9 text-sm"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end pt-2 border-t border-border/50">
                            <Button
                              onClick={handleGenerateAgreement}
                              disabled={isGeneratingDoc}
                              className="gap-2"
                              size="sm"
                            >
                              {isGeneratingDoc ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                              {isGeneratingDoc ? "Generating..." : "Generate & Download"}
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </TabsContent>
              )}

              {(user?.role === "admin" ||
                user?.role === "manager" ||
                user?.role === "processing") && (
                  <TabsContent value="documents" className="mt-6 space-y-4">
                    <Tabs defaultValue={displayLead?.selectedDocumentCheckList || ""}>
                      <TabsList className="flex flex-wrap h-auto gap-1">
                        <TabsTrigger value="portugal-d2" onClick={() => updateSelectedDocumentCheckList("portugal-d2")}>
                          Portugal D2
                        </TabsTrigger>
                        <TabsTrigger value="portugal-d7" onClick={() => updateSelectedDocumentCheckList("portugal-d7")}>
                          Portugal D7
                        </TabsTrigger>
                        <TabsTrigger value="portugal-d8" onClick={() => updateSelectedDocumentCheckList("portugal-d8")}>
                          Portugal D8
                        </TabsTrigger>
                        <TabsTrigger value="spain-dnv" onClick={() => updateSelectedDocumentCheckList("spain-dnv")}>Spain DNV</TabsTrigger>
                        <TabsTrigger value="spain-nlv" onClick={() => updateSelectedDocumentCheckList("spain-nlv")}>Spain NLV</TabsTrigger>
                        <TabsTrigger value="uk-innovator" onClick={() => updateSelectedDocumentCheckList("uk-innovator")}>
                          UK Innovator Founder
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="portugal-d2" className="mt-3">
                        <DocumentChecklistView
                          template={PORTUGAL_D2_CHECKLIST}
                          leadId={lead?.id ? String(lead.id) : ""}
                          documents={documents}
                          onRefresh={() =>
                            lead?.id && fetchDocuments(String(lead.id))
                          }
                        />
                      </TabsContent>
                      <TabsContent value="portugal-d7" className="mt-3">
                        <DocumentChecklistView
                          template={PORTUGAL_D7_CHECKLIST}
                          leadId={lead?.id ? String(lead.id) : ""}
                          documents={documents}
                          onRefresh={() =>
                            lead?.id && fetchDocuments(String(lead.id))
                          }
                        />
                      </TabsContent>
                      <TabsContent value="portugal-d8" className="mt-3">
                        <DocumentChecklistView
                          template={PORTUGAL_D8_CHECKLIST}
                          leadId={lead?.id ? String(lead.id) : ""}
                          documents={documents}
                          onRefresh={() =>
                            lead?.id && fetchDocuments(String(lead.id))
                          }
                        />
                      </TabsContent>
                      <TabsContent value="spain-dnv" className="mt-3">
                        <DocumentChecklistView
                          template={SPAIN_DNV_CHECKLIST}
                          leadId={lead?.id ? String(lead.id) : ""}
                          documents={documents}
                          onRefresh={() =>
                            lead?.id && fetchDocuments(String(lead.id))
                          }
                        />
                      </TabsContent>
                      <TabsContent value="spain-nlv" className="mt-3">
                        <DocumentChecklistView
                          template={SPAIN_NLV_CHECKLIST}
                          leadId={lead?.id ? String(lead.id) : ""}
                          documents={documents}
                          onRefresh={() =>
                            lead?.id && fetchDocuments(String(lead.id))
                          }
                        />
                      </TabsContent>
                      <TabsContent value="uk-innovator" className="mt-3">
                        <DocumentChecklistView
                          template={UK_INNOVATOR_CHECKLIST}
                          leadId={lead?.id ? String(lead.id) : ""}
                          documents={documents}
                          onRefresh={() =>
                            lead?.id && fetchDocuments(String(lead.id))
                          }
                        />
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                )}

              {(user?.role === "admin" || user?.role === "manager") && (
                <TabsContent value="assignments" className="mt-6">
                  <div className="max-h-[450px] overflow-y-auto pr-2">
                    {assignments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                          <UserPlus className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          No assignment history
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          This lead has not been reassigned yet
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-border" />

                        <div className="space-y-4">
                          {assignments.map(
                            (
                              assignment: AssignmentHistoryItem,
                              index: number,
                            ) => (
                              <div
                                key={assignment.id}
                                className="relative flex gap-4"
                              >
                                {/* Timeline dot */}
                                <div className="relative z-10 shrink-0">
                                  <div className="w-9 h-9 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary">
                                      #{assignments.length - index}
                                    </span>
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-4">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium">
                                        {assignment.assignedByUser.fullname}
                                      </span>
                                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-semibold text-primary">
                                        {assignment.assignedToUser.fullname}
                                      </span>
                                    </div>
                                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                                      {format(
                                        new Date(assignment.createdAt),
                                        "MMM d, h:mm a",
                                      )}
                                    </time>
                                  </div>

                                  {assignment.remarks && (
                                    <p className="text-sm text-muted-foreground italic mt-2">
                                      "{assignment.remarks}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </DialogContent>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        lead={lead}
        onSuccess={() => {
          if (lead?.id) {
            fetchLeadDetails(String(lead.id));
          }
        }}
      />

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        lead={lead}
        onSuccess={() => {
          if (lead?.id) {
            fetchLeadDetails(String(lead.id));
          }
        }}
      />

      {/* Document Upload Modal */}
      <AddDocumentModal
        open={isDocumentUploadOpen}
        onOpenChange={setIsDocumentUploadOpen}
        leadId={lead?.id ? String(lead.id) : undefined}
        onSuccess={() => {
          if (lead?.id) {
            fetchDocuments(String(lead.id));
          }
        }}
      />

      {/* Lead Assignment Modal */}
      <LeadAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        lead={displayLead as any}
        users={assignableUsers}
        currentUserId={user?.id || ""}
        onAssign={handleAssignSubmit}
      />
    </Dialog>
  );
}
