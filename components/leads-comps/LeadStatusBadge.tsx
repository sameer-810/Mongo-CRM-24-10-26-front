import { cn } from "@/lib/utils";
import { LeadStatus, LeadStage } from "@/lib/types";
import { STATUS_LABELS, STAGE_LABELS } from "@/lib/mock-data";
import { TrendingUp, Thermometer, Skull } from "lucide-react";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusStyles: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 dark:border-blue-500/40 shadow-sm",
  [LeadStatus.NOT_ANSWERED]: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30 dark:border-slate-500/40 shadow-sm",
  [LeadStatus.BUSY]: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 dark:border-amber-500/40 shadow-sm",
  [LeadStatus.ANSWERED]: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/40 shadow-sm",
  [LeadStatus.FOLLOW_UP]: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30 dark:border-violet-500/40 shadow-sm",
  [LeadStatus.MEETING_SCHEDULED]: "bg-violet-600/15 text-violet-800 dark:text-violet-300 border-violet-600/30 dark:border-violet-600/40 shadow-sm",
  [LeadStatus.MEETING_DONE]: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 dark:border-emerald-500/40 shadow-sm",
  [LeadStatus.AGREEMENT_PENDING]: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 dark:border-orange-500/40 shadow-sm",
  [LeadStatus.AGREEMENT_DONE]: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30 dark:border-green-500/40 shadow-sm",
  [LeadStatus.PAYMENT_PENDING]: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30 dark:border-yellow-500/40 shadow-sm",
  [LeadStatus.PAYMENT_DONE]: "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30 dark:border-teal-500/40 shadow-sm",
  [LeadStatus.DOCUMENTATION]: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30 dark:border-cyan-500/40 shadow-sm",
  [LeadStatus.COMPLETED]: "bg-green-600/15 text-green-700 dark:text-green-400 border-green-600/30 dark:border-green-600/40 shadow-sm",
  [LeadStatus.NOT_INTERESTED]: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 dark:border-red-500/40 shadow-sm",
  [LeadStatus.NOT_ELIGIBLE]: "bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/30 dark:border-gray-500/40 shadow-sm",
  [LeadStatus.NO_SHOW]: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30 dark:border-orange-500/40 shadow-sm",
  [LeadStatus.WRONG_NUMBER]: "bg-red-600/15 text-red-800 dark:text-red-300 border-red-600/30 dark:border-red-600/40 shadow-sm",
  [LeadStatus.APPOINTMENT_BOOKED]: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 dark:border-purple-500/40 shadow-sm",
  [LeadStatus.VISA_GRANTED]: "bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-600/30 dark:border-emerald-600/40 shadow-sm",
  [LeadStatus.NIF_DONE]: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30 dark:border-sky-500/40 shadow-sm",
  [LeadStatus.INCORPORATION_DONE]: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 dark:border-indigo-500/40 shadow-sm",
  [LeadStatus.DECISION_PENDING]: "bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-600/30 dark:border-amber-600/40 shadow-sm",
  [LeadStatus.ENDORSEMENT_GRANTED]: "bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-500/30 dark:border-lime-500/40 shadow-sm",
  [LeadStatus.VISA_REJECTED]: "bg-rose-600/15 text-rose-700 dark:text-rose-400 border-rose-600/30 dark:border-rose-600/40 shadow-sm",
  [LeadStatus.REFUNDED]: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border-zinc-500/30 dark:border-zinc-500/40 shadow-sm",
};

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:scale-105",
        statusStyles[status],
        className
      )}
    >
      <span className="w-2 h-2 rounded-full mr-2 bg-current animate-pulse" />
      {STATUS_LABELS[status]}
    </span>
  );
}

interface LeadStageBadgeProps {
  stage: LeadStage;
  className?: string;
}

const stageConfig: Record<LeadStage, {
  containerStyle: string;
  iconStyle: string;
  textStyle: string;
  icon: React.ElementType;
  ringStyle: string;
}> = {
  hot: {
    containerStyle: "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/40 border-red-200/60 dark:border-red-800/50 hover:shadow-md hover:shadow-red-100/50 dark:hover:shadow-red-900/20",
    iconStyle: "bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-sm",
    textStyle: "text-red-700 dark:text-red-300 font-bold",
    ringStyle: "ring-1 ring-red-200/50 dark:ring-red-800/30",
    icon: TrendingUp,
  },
  cold: {
    containerStyle: "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-blue-200/60 dark:border-blue-800/50 hover:shadow-md hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20",
    iconStyle: "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm",
    textStyle: "text-blue-700 dark:text-blue-300 font-bold",
    ringStyle: "ring-1 ring-blue-200/50 dark:ring-blue-800/30",
    icon: Thermometer,
  },
  dead: {
    containerStyle: "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/40 dark:to-slate-950/40 border-gray-300/60 dark:border-gray-700/50 hover:shadow-md hover:shadow-gray-100/50 dark:hover:shadow-gray-900/20",
    iconStyle: "bg-gradient-to-br from-gray-600 to-slate-600 text-white shadow-sm",
    textStyle: "text-gray-700 dark:text-gray-300 font-bold",
    ringStyle: "ring-1 ring-gray-200/50 dark:ring-gray-700/30",
    icon: Skull,
  },
};

export function LeadStageBadge({ stage, className }: LeadStageBadgeProps) {
  const config = stageConfig[stage];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all duration-200",
        config.containerStyle,
        config.ringStyle,
        className
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center w-4 h-4 rounded-sm",
          config.iconStyle
        )}
      >
        <Icon className="w-2.5 h-2.5 stroke-[2.5]" strokeWidth={2.5} />
      </span>
      <span className={cn("text-[10px] leading-none tracking-wide uppercase", config.textStyle)}>
        {STAGE_LABELS[stage]}
      </span>
    </span>
  );
}
