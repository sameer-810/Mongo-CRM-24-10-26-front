"use client";

import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Phone,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Briefcase,
  Target,
  DollarSign,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
// import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { getAdminAndManagerDashboardData } from "@/lib/server-actions";
import { GetAdminAndManagerDashboardStatsResponseType } from "@/lib/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// Types for chart data
interface LeadsDataPoint {
  month: string;
  leads: number;
  converted: number;
}

interface StatusDataPoint {
  status?: string;
  label?: string;
  count: number;
  color: string;
  textColor?: string;
}

interface Activity {
  action: string;
  user: string;
  time: string;
  status: "hot" | "meeting" | "closed";
  description: string;
}

interface TooltipPayload {
  value?: number;
  dataKey?: string;
  stroke?: string;
  payload?: StatusDataPoint & { status: string };
}

interface AreaTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface BarTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}



/* const recentActivities: Activity[] = [
  {
    action: "New enterprise client captured",
    user: "Sarah Mitchell",
    time: "2 minutes ago",
    status: "hot",
    description: "Fortune 500 company inquiry",
  },
  {
    action: "Strategic partnership meeting scheduled",
    user: "John Anderson",
    time: "15 minutes ago",
    status: "meeting",
    description: "Q4 planning discussion",
  },
  {
    action: "Major contract closed",
    user: "David Chen",
    time: "1 hour ago",
    status: "closed",
    description: "Annual contract signed",
  },
  {
    action: "Follow-up required on proposal",
    user: "Emily Roberts",
    time: "2 hours ago",
    status: "warm",
    description: "Awaiting board approval",
  },
]; */

/* const activityStatusConfig = {
  hot: { color: "bg-error", label: "Hot", textColor: "text-error" },
  meeting: { color: "bg-primary", label: "Meeting", textColor: "text-primary" },
  closed: { color: "bg-success", label: "Closed", textColor: "text-success" },
  warm: { color: "bg-warning", label: "Warm", textColor: "text-warning" },
} as const; */

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<GetAdminAndManagerDashboardStatsResponseType["data"] | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await getAdminAndManagerDashboardData();
        if (response.success && response.data) {
          setDashboardData(response.data);
        } else {
          toast.error(response.message || "Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const CustomBarTooltip = ({ active, payload }: BarTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0];
      const payloadData = data.payload as StatusDataPoint;
      return (
        <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-4 shadow-xl">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">
              {payloadData?.label || payloadData?.status || "Unknown"}
            </p>
            <div className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: payloadData?.color }}
              />
              <p className="text-sm text-muted-foreground">
                Count:{" "}
                <span className="font-semibold text-foreground">
                  {data.value}
                </span>
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload, label }: AreaTooltipProps) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-4 shadow-xl">
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
              {label}
            </p>
            {payload.map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-6"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: entry.stroke }}
                  />
                  <p className="text-sm text-muted-foreground">
                    {entry.dataKey === "leads" ? "Total Leads" : "Converted"}
                  </p>
                </div>
                <span className="font-semibold text-foreground">
                  {entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Transform API data for charts
  const leadsData: LeadsDataPoint[] = dashboardData?.performanceChart?.map(item => ({
    month: item.month,
    leads: item.total,
    converted: item.converted,
  })) || [];

  // Map labels to text colors
  const getTextColorForLabel = (label: string): string => {
    const labelLower = label.toLowerCase();
    const colorMap: Record<string, string> = {
      cold: "var(--chart-4)",
      hot: "var(--error)",
      dead: "var(--success)",
    };
    return colorMap[labelLower] || "var(--muted-foreground)";
  };

  // Transform API data for charts with text color mapping
  const statusData: StatusDataPoint[] = dashboardData?.pipelineChart?.map(item => ({
    label: item.label,
    count: item.count,
    color: getTextColorForLabel(item.label),
  })) || [];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in p-6 md:p-8 max-w-[1600px] mx-auto">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <PageHeader
        title="Welcome back to Bakers CRM,"
        highlightedText={user?.name || "User"}
        description="Here's what's happening with your projects today."
      /* action={
        <div className="hidden md:flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2.5 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">
            Live Updates
          </span>
        </div>
      } */
      />

      {/* Metrics Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Clients"
          value={dashboardData?.summary?.totalClients?.value?.toString() || "0"}
          description={dashboardData?.summary?.totalClients?.label || "Active client accounts"}
          icon={Users}
          colorClass="primary"
        />

        <StatsCard
          title="Activity"
          value={dashboardData?.summary?.activity?.value?.toString() || "0"}
          description={dashboardData?.summary?.activity?.label || "Interactions this week"}
          icon={Activity}
          colorClass="success"
        />

        <StatsCard
          title="Meetings"
          value={dashboardData?.summary?.meetings?.value?.toString() || "0"}
          description={dashboardData?.summary?.meetings?.label || "Scheduled this week"}
          icon={Calendar}
          colorClass="warning"
        />

        <StatsCard
          title="Conversion"
          value={dashboardData?.summary?.conversion?.value || "0%"}
          description={dashboardData?.summary?.conversion?.label || "Lead to client rate"}
          icon={Target}
          colorClass="info"
        />
      </div>
      {/* ============= */}

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lead Conversion Chart */}
        <SectionCard
          title="Lead Performance"
          description="Monthly acquisition and conversion metrics"
          icon={TrendingUp}
          iconColor="primary"
        >
          <div className="flex items-center gap-6 mb-5 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                Total Leads
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-xs font-medium text-muted-foreground">
                Converted
              </span>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={leadsData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="leadsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                  <linearGradient
                    id="convertedGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--success)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--success)"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomAreaTooltip />}
                  cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fill="url(#leadsGradient)"
                  dot={{
                    fill: "var(--primary)",
                    strokeWidth: 2,
                    r: 5,
                    stroke: "var(--card)",
                  }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="converted"
                  stroke="var(--success)"
                  strokeWidth={3}
                  fill="url(#convertedGradient)"
                  dot={{
                    fill: "var(--success)",
                    strokeWidth: 2,
                    r: 5,
                    stroke: "var(--card)",
                  }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* <div className="mt-5 pt-5 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground font-light">
                Performance up by{" "}
                <span className="font-semibold text-foreground">5.2%</span> this
                quarter
              </span>
            </div>
          </div> */}
        </SectionCard>

        {/* Status Distribution Chart */}
        <SectionCard
          title="Client Pipeline"
          description="Current status distribution across all clients"
          icon={Activity}
          iconColor="info"
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/50"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={70}>
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 pt-5 border-t border-border/50">
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${statusData.length}, 1fr)` }}>
              {statusData.map((status, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div
                    className="h-2 w-full rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {status.label || status.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Recent Activity */}
      {/* <SectionCard
        title="Recent Activity"
        description="Latest updates from your team"
        icon={Briefcase}
        iconColor="success"
        action={
          <Badge
            variant="secondary"
            className="text-xs px-3 py-1.5 font-medium bg-primary/10 text-primary border-primary/20"
          >
            Live
          </Badge>
        }
      >
        <div className="space-y-3">
          {recentActivities.map((activity, i) => {
            const config = activityStatusConfig[activity.status];

            return (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card/50 hover:bg-muted/30 hover:border-primary/20 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`h-10 w-10 rounded-full ${config.color}/10 flex items-center justify-center border ${config.color}/20 shrink-0`}
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${config.color} animate-pulse`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 font-light">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        {activity.user}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`capitalize text-xs font-semibold shrink-0 ${config.textColor} border-current/20 bg-current/5`}
                >
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </SectionCard> */}
    </div>
  );
}
