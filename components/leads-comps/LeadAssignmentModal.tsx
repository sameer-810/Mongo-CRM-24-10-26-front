import { useMemo, useState } from "react";
import { Lead, User, UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/mock-data";
import { userRoleConfig } from "@/lib/badge-configs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  History,
  Phone,
  MessageCircle,
  FileText,
  Bell,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface LeadAssignmentModalProps {
  // Backward compatible: existing callers pass `lead`
  lead?: Lead | null;
  // New: bulk assignment support
  leads?: Lead[];
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUserId?: string;
  onAssign: (
    leadId: string,
    assignToUserId: string,
    shareActivityLogs: boolean,
    notes?: string
  ) => void;
  onAssignBulk?: (
    items: Array<{ id?: number; leadId: number }>,
    assignToUserId: string,
    shareActivityLogs: boolean,
    notes?: string
  ) => void | Promise<void>;
}

export function LeadAssignmentModal({
  lead,
  leads,
  isOpen,
  onClose,
  users,
  currentUserId,
  onAssign,
  onAssignBulk,
}: LeadAssignmentModalProps) {
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState("");
  const [shareActivityLogs, setShareActivityLogs] = useState(true);
  const [notes, setNotes] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const selectedLeads: Lead[] = useMemo(() => {
    if (Array.isArray(leads) && leads.length > 0) return leads;
    if (lead) return [lead];
    return [];
  }, [leads, lead]);

  const isBulk = selectedLeads.length > 1;
  const primaryLead = selectedLeads[0];

  if (!primaryLead) return null;

  // Filter users that can be assigned (telecaller, advisor, manager - excluding current owner)
  const assignableRoles: string[] = ["telecaller", "advisor", "manager", "processing"];
  const currentOwnerId = primaryLead.assignedTo || primaryLead.leadOwner || primaryLead.createdBy;
  const assignableUsers = users.filter((u) => {
    const userRole = (u.role as string).toLowerCase();
    const userIsActive = (u as any).isActive !== false;
    return (
      userIsActive &&
      assignableRoles.includes(userRole) &&
      (isBulk ? true : u.id !== currentOwnerId)
    );
  });

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const activityCounts = {
    calls: primaryLead.callLogs?.length || 0,
    whatsapp: 0, // WhatsApp logs not in Lead type - would need to be fetched separately
    notes: Array.isArray(primaryLead.notes) ? primaryLead.notes.length : 0,
    reminders: primaryLead.reminders?.length || 0,
  };

  const hasActivityLogs =
    activityCounts.calls > 0 ||
    activityCounts.whatsapp > 0 ||
    activityCounts.notes > 0 ||
    activityCounts.reminders > 0;

  const handleAssignClick = () => {
    if (!selectedUserId) {
      toast({
        title: "Select User",
        description: "Please select a user to assign the lead to.",
        variant: "destructive",
      });
      return;
    }

    // For bulk assign: do NOT show activity counts or confirmation alert.
    // We show the "share logs" checkbox inline and proceed directly.
    if (isBulk) {
      handleConfirmAssignment();
      return;
    }

    if (hasActivityLogs) {
      setShowConfirmation(true);
    } else {
      handleConfirmAssignment();
    }
  };

  const handleConfirmAssignment = async () => {
    if (isBulk) {
      if (!onAssignBulk) {
        toast({
          title: "Bulk Assign Not Configured",
          description: "Bulk assignment handler is not configured.",
          variant: "destructive",
        });
        return;
      }

      const items = selectedLeads.map((l: any) => ({
        id: l?.assignmentHistory?.[0]?.id ?? undefined,
        leadId: Number(l.id),
      }));

      await onAssignBulk(
        items,
        String(selectedUserId),
        shareActivityLogs,
        notes || undefined
      );

      toast({
        title: "Leads Assigned",
        description: `${selectedLeads.length} lead${selectedLeads.length > 1 ? "s" : ""} assigned to ${
          selectedUser?.name || "user"
        }.`,
      });
      handleClose();
      return;
    }

    onAssign(
      String(primaryLead.id),
      String(selectedUserId),
      shareActivityLogs,
      notes || undefined
    );
    toast({
      title: "Lead Assigned",
      description: `Lead "${primaryLead.fullname}" has been assigned to ${
        selectedUser?.name || "user"
      }${shareActivityLogs ? " with activity logs" : ""}.`,
    });
    handleClose();
  };

  const handleClose = () => {
    setSelectedUserId("");
    setShareActivityLogs(true);
    setNotes("");
    setShowConfirmation(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showConfirmation} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="pb-4 border-b px-6 pt-6 shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl font-semibold mb-1">
                  {isBulk ? "Assign Leads" : "Assign Lead"}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {isBulk ? (
                    <>
                      Assign{" "}
                      <span className="font-medium text-foreground">
                        {selectedLeads.length} selected leads
                      </span>{" "}
                      to another team member
                    </>
                  ) : (
                    <>
                      Assign{" "}
                      <span className="font-medium text-foreground">
                        "{primaryLead.fullname}"
                      </span>{" "}
                      to another team member
                    </>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-6 px-6 overflow-y-auto flex-1">
            {/* Current Assignment Info */}
            {!isBulk && (primaryLead.leadOwner || primaryLead.assignedTo) && (
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 rounded-xl p-4 border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Current Owner
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary/20">
                    {(primaryLead.leadOwner || primaryLead.assignedTo || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-base">
                      {primaryLead.leadOwner || primaryLead.assignedTo || "Unassigned"}
                    </p>
                    {primaryLead.assignedBy && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Assigned by {primaryLead.assignedBy}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Select New Owner */}
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">Assign To</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select team member..." />
                </SelectTrigger>
                <SelectContent>
                  {assignableUsers.map((user) => {
                    const roleKey =
                      user.role.toLowerCase() as keyof typeof userRoleConfig;
                    const roleConfig =
                      userRoleConfig[roleKey] || userRoleConfig.viewer;
                    return (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        className="focus:bg-muted/60 dark:focus:bg-muted/40 focus:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-background border-2 flex items-center justify-center text-xs font-bold"
                            style={{
                              borderColor: `var(--${roleKey === 'admin' ? 'chart-5' :
                                roleKey === 'manager' ? 'primary' :
                                  roleKey === 'advisor' ? 'chart-4' :
                                    roleKey === 'telecaller' ? 'warning' :
                                      roleKey === 'processing' ? 'success' : 'muted'})`,
                            }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${roleConfig.color} ${roleConfig.bgColor} ${roleConfig.borderColor}`}
                            >
                              {roleConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Activity Logs Summary */}
            {!isBulk && hasActivityLogs && (
              <div className="space-y-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-4">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Activity Logs to Share
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                  {activityCounts.calls > 0 && (
                    <div className="flex items-center gap-2.5 text-sm bg-background/80 backdrop-blur rounded-lg px-3 py-2.5 border border-border/50">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{activityCounts.calls} Call{activityCounts.calls > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {activityCounts.whatsapp > 0 && (
                    <div className="flex items-center gap-2.5 text-sm bg-background/80 backdrop-blur rounded-lg px-3 py-2.5 border border-border/50">
                      <MessageCircle className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{activityCounts.whatsapp} Message{activityCounts.whatsapp > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {activityCounts.notes > 0 && (
                    <div className="flex items-center gap-2.5 text-sm bg-background/80 backdrop-blur rounded-lg px-3 py-2.5 border border-border/50">
                      <FileText className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">{activityCounts.notes} Note{activityCounts.notes > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {activityCounts.reminders > 0 && (
                    <div className="flex items-center gap-2.5 text-sm bg-background/80 backdrop-blur rounded-lg px-3 py-2.5 border border-border/50">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{activityCounts.reminders} Reminder{activityCounts.reminders > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bulk assign: show share logs checkbox inline, no counts, no alert */}
            {isBulk && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border-2 border-amber-200 dark:border-amber-800/50">
                <Checkbox
                  id="shareLogsInline"
                  checked={shareActivityLogs}
                  onCheckedChange={(checked) =>
                    setShareActivityLogs(checked as boolean)
                  }
                  className="mt-0.5"
                />
                <div className="space-y-1.5">
                  <Label
                    htmlFor="shareLogsInline"
                    className="font-semibold cursor-pointer text-sm"
                  >
                    Share my activity logs with the new assignee
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sharing logs helps maintain continuity and provides context for the lead conversation history.
                  </p>
                </div>
              </div>
            )}


            {/* Assignment History */}
            {!isBulk && primaryLead.assignmentHistory && primaryLead.assignmentHistory.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Assignment History
                </Label>
                <div className="max-h-[200px] overflow-y-auto pr-2 space-y-3">
                  {primaryLead.assignmentHistory.slice(0, 3).map(
                    (assignment: any, index: number) => {
                      const assignedByName =
                        assignment.assignedByName ||
                        assignment.assignedByUser?.fullname ||
                        assignment.assignedByUser?.name ||
                        "Unknown";
                      const assignedToName =
                        assignment.assignedToName ||
                        assignment.assignedToUser?.fullname ||
                        assignment.assignedToUser?.name ||
                        "Unknown";
                      const assignedAt =
                        assignment.assignedAt || assignment.createdAt;
                      const sharedActivityLogs =
                        assignment.sharedActivityLogs ||
                        assignment.remarks?.includes("shared") ||
                        false;
                      const notes = assignment.notes || assignment.remarks;

                      return (
                        <div
                          key={assignment.id || `assignment-${index}`}
                          className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3 border border-border/50"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{assignedByName}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                              <span className="font-semibold text-primary">{assignedToName}</span>
                            </div>
                            <time className="text-xs text-muted-foreground whitespace-nowrap">
                              {assignedAt
                                ? format(new Date(assignedAt), "MMM d, h:mm a")
                                : "Unknown"}
                            </time>
                          </div>
                          {notes && (
                            <p className="text-xs text-muted-foreground italic mt-1.5">"{notes}"</p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-4 pb-6 px-6 border-t shrink-0">
            <Button variant="outline" onClick={handleClose} className="h-10">
              Cancel
            </Button>
            <Button onClick={handleAssignClick} disabled={!selectedUserId} className="h-10 min-w-[130px]">
              <UserPlus className="w-4 h-4 mr-2" />
              {isBulk ? "Assign Leads" : "Assign Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Activity Logs */}
      {!isBulk && (
        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0">
          <AlertDialogHeader className="pb-4 border-b px-6 pt-6 shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-xl font-semibold mb-1">
                  Share Activity Logs?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  You have activity logs for this lead. Choose whether to share them with {" "}
                  <span className="font-medium text-foreground">{selectedUser?.name}</span>
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-5 pt-4 px-6 overflow-y-auto flex-1">
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 rounded-xl p-4 border border-border/50">
              <p className="font-semibold text-sm mb-3">
                Activity logs that will be shared:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {activityCounts.calls > 0 && (
                  <div className="flex items-center gap-2.5 text-sm bg-background/80 backdrop-blur rounded-lg px-3 py-2.5 border border-border/50">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{activityCounts.calls} Call{activityCounts.calls > 1 ? 's' : ''}</span>
                  </div>
                )}
                {activityCounts.whatsapp > 0 && (
                  <div className="flex items-center gap-2.5 text-sm bg-background/80 backdrop-blur rounded-lg px-3 py-2.5 border border-border/50">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{activityCounts.whatsapp} Message{activityCounts.whatsapp > 1 ? 's' : ''}</span>
                  </div>
                )}
                {activityCounts.notes > 0 && (
                  <div className="flex items-center gap-2.5 text-sm bg-background/80 backdrop-blur rounded-lg px-3 py-2.5 border border-border/50">
                    <FileText className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">{activityCounts.notes} Note{activityCounts.notes > 1 ? 's' : ''}</span>
                  </div>
                )}
                {activityCounts.reminders > 0 && (
                  <div className="flex items-center gap-2.5 text-sm bg-background/80 backdrop-blur rounded-lg px-3 py-2.5 border border-border/50">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">{activityCounts.reminders} Reminder{activityCounts.reminders > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border-2 border-amber-200 dark:border-amber-800/50">
              <Checkbox
                id="shareLogsConfirm"
                checked={shareActivityLogs}
                onCheckedChange={(checked) =>
                  setShareActivityLogs(checked as boolean)
                }
                className="mt-0.5"
              />
              <div className="space-y-1.5">
                <Label
                  htmlFor="shareLogsConfirm"
                  className="font-semibold cursor-pointer text-sm"
                >
                  Share my activity logs with the new assignee
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sharing logs helps maintain continuity and provides context for the lead conversation history.
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="pt-6 pb-6 px-6 border-t shrink-0">
            <AlertDialogCancel onClick={() => setShowConfirmation(false)} className="h-10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAssignment} className="h-10 min-w-[160px]">
              {shareActivityLogs ? "Assign with Logs" : "Assign without Logs"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
