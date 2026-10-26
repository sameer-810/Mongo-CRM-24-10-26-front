import {
  Flame,
  Snowflake,
  XCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  CalendarClock,
  Crown,
  ShieldCheck,
  Briefcase,
  UserCheck,
  Users,
  Calendar,
  MessageSquare,
  Mail,
  FileText,
  DollarSign,
  Target,
} from "lucide-react";

import { LeadStatus } from "./enum";

export const leadStatusConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: any;
}> = {
  [LeadStatus.NEW]: {
    label: "New",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    borderColor: "border-blue-200 dark:border-blue-500/20",
    icon: Users,
  },
  [LeadStatus.NOT_ANSWERED]: {
    label: "Not Answered",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-500/10",
    borderColor: "border-slate-200 dark:border-slate-500/20",
    icon: XCircle,
  },
  [LeadStatus.BUSY]: {
    label: "Busy",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-50 dark:bg-yellow-500/10",
    borderColor: "border-yellow-200 dark:border-yellow-500/20",
    icon: Clock,
  },
  [LeadStatus.ANSWERED]: {
    label: "Answered",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-500/10",
    borderColor: "border-green-200 dark:border-green-500/20",
    icon: CheckCircle2,
  },
  [LeadStatus.FOLLOW_UP]: {
    label: "Follow Up",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    borderColor: "border-indigo-200 dark:border-indigo-500/20",
    icon: CalendarClock,
  },
  [LeadStatus.MEETING_SCHEDULED]: {
    label: "Meeting Scheduled",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-500/10",
    borderColor: "border-violet-200 dark:border-violet-500/20",
    icon: Calendar,
  },
  [LeadStatus.MEETING_DONE]: {
    label: "Meeting Done",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    borderColor: "border-purple-200 dark:border-purple-500/20",
    icon: Target,
  },
  [LeadStatus.AGREEMENT_PENDING]: {
    label: "Agreement Pending",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-500/10",
    borderColor: "border-orange-200 dark:border-orange-500/20",
    icon: Clock,
  },
  [LeadStatus.AGREEMENT_DONE]: {
    label: "Agreement Done",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    borderColor: "border-emerald-200 dark:border-emerald-500/20",
    icon: ShieldCheck,
  },
  [LeadStatus.PAYMENT_PENDING]: {
    label: "Payment Pending",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-500/10",
    borderColor: "border-rose-200 dark:border-rose-500/20",
    icon: DollarSign,
  },
  [LeadStatus.PAYMENT_DONE]: {
    label: "Payment Done",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-500/10",
    borderColor: "border-teal-200 dark:border-teal-500/20",
    icon: CheckCircle2,
  },
  [LeadStatus.COMPLETED]: {
    label: "Completed",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-500/20",
    borderColor: "border-green-200 dark:border-green-500/30",
    icon: Target,
  },
  [LeadStatus.DOCUMENTATION]: {
    label: "Documentation",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-500/10",
    borderColor: "border-cyan-200 dark:border-cyan-500/20",
    icon: FileText,
  },
  [LeadStatus.NOT_INTERESTED]: {
    label: "Not Interested",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-500/10",
    borderColor: "border-red-200 dark:border-red-500/20",
    icon: XCircle,
  },
  [LeadStatus.NOT_ELIGIBLE]: {
    label: "Not Eligible",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-500/10",
    borderColor: "border-gray-200 dark:border-gray-500/20",
    icon: XCircle,
  },
  [LeadStatus.NO_SHOW]: {
    label: "No Show",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-500/10",
    borderColor: "border-orange-200 dark:border-orange-500/20",
    icon: AlertCircle,
  },
  [LeadStatus.WRONG_NUMBER]: {
    label: "Wrong Number",
    color: "text-red-700 dark:text-red-300",
    bgColor: "bg-red-100 dark:bg-red-600/10",
    borderColor: "border-red-300 dark:border-red-600/20",
    icon: XCircle,
  },
  [LeadStatus.APPOINTMENT_BOOKED]: {
    label: "Appointment Booked",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    borderColor: "border-purple-200 dark:border-purple-500/20",
    icon: Calendar,
  },
  [LeadStatus.VISA_GRANTED]: {
    label: "Visa Granted",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    borderColor: "border-emerald-200 dark:border-emerald-500/20",
    icon: CheckCircle2,
  },
  [LeadStatus.NIF_DONE]: {
    label: "NIF Done",
    color: "text-sky-700 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-500/10",
    borderColor: "border-sky-200 dark:border-sky-500/20",
    icon: UserCheck,
  },
  [LeadStatus.INCORPORATION_DONE]: {
    label: "Incorporation Done",
    color: "text-indigo-700 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    borderColor: "border-indigo-200 dark:border-indigo-500/20",
    icon: Briefcase,
  },
  [LeadStatus.DECISION_PENDING]: {
    label: "Decision Pending",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    borderColor: "border-amber-200 dark:border-amber-500/20",
    icon: Clock,
  },
  [LeadStatus.ENDORSEMENT_GRANTED]: {
    label: "Endorsement Granted",
    color: "text-lime-700 dark:text-lime-400",
    bgColor: "bg-lime-50 dark:bg-lime-500/10",
    borderColor: "border-lime-200 dark:border-lime-500/20",
    icon: UserCheck,
  },
  [LeadStatus.VISA_REJECTED]: {
    label: "Visa Rejected",
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-500/10",
    borderColor: "border-rose-200 dark:border-rose-500/20",
    icon: XCircle,
  },
  [LeadStatus.REFUNDED]: {
    label: "Refunded",
    color: "text-zinc-700 dark:text-zinc-400",
    bgColor: "bg-zinc-50 dark:bg-zinc-500/10",
    borderColor: "border-zinc-200 dark:border-zinc-500/20",
    icon: XCircle,
  },
  // Keep old ones for compatibility if needed, but map to new types if possible
  hot: {
    label: "Hot",
    color: "text-error",
    bgColor: "bg-error/10",
    borderColor: "border-error/20",
    icon: Flame,
  },
  cold: {
    label: "Cold",
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/20",
    icon: Snowflake,
  },
  dead: {
    label: "Dead",
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    borderColor: "border-muted",
    icon: XCircle,
  },
};



export const leadStageConfig = {
  new: {
    label: "New",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    borderColor: "border-chart-1/30",
    icon: Users,
    description: "Fresh leads awaiting initial contact",
    nextStage: "set" as const,
  },
  set: {
    label: "Set",
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/30",
    icon: Calendar,
    description: "Appointment booked, ready for advisor",
    nextStage: "advisor" as const,
  },
  advisor: {
    label: "Advisor",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    borderColor: "border-chart-2/30",
    icon: MessageSquare,
    description: "Meeting with advisor scheduled",
    nextStage: "meeting-done" as const,
  },
  "meeting-done": {
    label: "Meeting Done",
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    borderColor: "border-chart-3/30",
    icon: CheckCircle2,
    description: "Initial meeting completed",
    nextStage: "follow-up" as const,
  },
  "follow-up": {
    label: "Follow-up",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    icon: Clock,
    description: "Post-meeting follow-up in progress",
    nextStage: "agreement-signed" as const,
  },
  "agreement-signed": {
    label: "Agreement Signed",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
    icon: FileText,
    description: "Contract signed, awaiting payment",
    nextStage: "payment-received" as const,
  },
  "payment-received": {
    label: "Payment Received",
    color: "text-success",
    bgColor: "bg-success/20",
    borderColor: "border-success/40",
    icon: DollarSign,
    description: "Payment completed",
    nextStage: "closed" as const,
  },
  closed: {
    label: "Closed",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    icon: Target,
    description: "Deal successfully closed",
  },
} as const;

export const userRoleConfig = {
  admin: {
    label: "Admin",
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    borderColor: "border-chart-5/20",
    icon: Crown,
    description: "Full system access",
  },
  manager: {
    label: "Manager",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    icon: ShieldCheck,
    description: "Team management access",
  },
  sales: {
    label: "Sales",
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    borderColor: "border-chart-2/20",
    icon: Briefcase,
    description: "Sales operations access",
  },
  advisor: {
    label: "Advisor",
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    borderColor: "border-chart-4/20",
    icon: UserCheck,
    description: "Advisory access",
  },
  telecaller: {
    label: "Telecaller",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    icon: Briefcase,
    description: "Telecalling operations",
  },
  processing: {
    label: "Processing",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    icon: UserCheck,
    description: "Processing operations",
  },
  viewer: {
    label: "Viewer",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    icon: Briefcase,
    description: "Read-only access",
  },
} as const;

export const meetingTypeConfig = {
  initial: {
    label: "Initial Consultation",
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/20",
    icon: CalendarClock,
  },
  "follow-up": {
    label: "Follow-up",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    icon: Clock,
  },
  closing: {
    label: "Closing Meeting",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    icon: CheckCircle2,
  },
} as const;

export const meetingStatusConfig = {
  scheduled: {
    label: "Scheduled",
    color: "text-info",
    bgColor: "bg-info/10",
    borderColor: "border-info/20",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-error",
    bgColor: "bg-error/10",
    borderColor: "border-error/20",
    icon: XCircle,
  },
  rescheduled: {
    label: "Rescheduled",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    icon: AlertCircle,
  },
} as const;

export const callOutcomeConfig = {
  answered: {
    label: "Answered",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    icon: CheckCircle2,
  },
  "not-answered": {
    label: "Not Answered",
    color: "text-error",
    bgColor: "bg-error/10",
    borderColor: "border-error/20",
    icon: XCircle,
  },
} as const;

// export type LeadStatus = keyof typeof leadStatusConfig;
export type LeadStage = keyof typeof leadStageConfig;
export type MeetingType = keyof typeof meetingTypeConfig;
export type MeetingStatus = keyof typeof meetingStatusConfig;
export type CallOutcome = keyof typeof callOutcomeConfig;
