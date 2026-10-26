"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SectionCard } from "@/components/dashboard/section-card";
import {
  Phone,
  PhoneCall,
  Users,
  Clock,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Target,
  ListFilter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { getLeadsByUserId, getTelecallerDashboard } from "@/lib/server-actions";
import { Lead } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CustomBarTooltip, CustomPieTooltip } from "@/components/dashboard/chart-tooltips";
import { StatsCardSkeleton } from "@/components/skeletons/stats-card-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface TelecallerStats {
  leadsInQueue: number;
  callsMadeToday: number;
  connectedCalls: number;
  followUpsPending: number;
  connectRate: number;
}

interface CallOutcome {
  outcome: string;
  count: number;
  color: string;
  [key: string]: any;
}

export default function TelecallerDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TelecallerStats>({
    leadsInQueue: 0,
    callsMadeToday: 0,
    connectedCalls: 0,
    followUpsPending: 0,
    connectRate: 0,
  });
  const [todaysQueue, setTodaysQueue] = useState<Lead[]>([]);
  const [callOutcomes, setCallOutcomes] = useState<CallOutcome[]>([]);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        const data = await getTelecallerDashboard(user.id);

        if (data) {
          // Stats
          setStats({
            leadsInQueue: data.priorityQueue?.length || 0,
            callsMadeToday: data.callsMadeToday || 0,
            connectedCalls: data.connectedCalls || 0,
            followUpsPending: data.pendingFollowUps || 0,
            connectRate: parseInt(data.connectRate || "0"),
          });

          // Outcomes - Aggregate distinct outcomes to prevent duplicates
          const outcomesList = data.todaysOutcomes || [];

          const outcomeAggregation: Record<string, { count: number; color: string }> = {};

          outcomesList.forEach((o: any) => {
            if (o.label === "Voicemail") return;

            const details = getOutcomeDetails(o.label);

            if (!outcomeAggregation[details.label]) {
              outcomeAggregation[details.label] = { count: 0, color: details.color };
            }
            outcomeAggregation[details.label].count += o.value;
          });

          const formattedOutcomes = Object.entries(outcomeAggregation).map(([label, data]) => ({
            outcome: label,
            count: data.count,
            color: data.color
          }));

          setCallOutcomes(formattedOutcomes);

          // Priority Queue
          // Map backend response to Lead type as much as possible for the UI
          const queue = (data.priorityQueue || []).map((item: any) => ({
            id: item.id,
            fullname: item.name,
            phone: item.phone,
            status: item.status,
            // Add other required Lead fields with defaults if missing
            email: "",
            source: "",
            platform: "",
            project: "",
            budget: 0,
            notes: "",
            assignedTo: parseInt(user.id),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setTodaysQueue(queue);

          // Recent Logs
          const logs = (data.recentLogs || []).map((log: any) => ({
            lead: log.leadName,
            outcome: log.outcome,
            time: log.timeAgo
          }));
          setRecentCalls(logs);

          // Weekly Performance
          // Note: The chart expects { day: string, calls: number }
          // We might need to map the date to day name
          const weekly = (data.weeklyPerformance || []).map((item: any) => {
            const date = new Date(item.date);
            return {
              day: date.toLocaleDateString('en-US', { weekday: 'short' }),
              calls: item.count
            };
          });
          setWeeklyActivityData(weekly);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Helper for colors
  // Helper for outcomes (Color & Label)
  // Helper for outcomes (Color & Label) - Strict Official List
  const getOutcomeDetails = (outcome: string) => {
    const lower = outcome?.toLowerCase() || "";

    // Official Status: Connected (Green)
    if (lower.includes("connected") && !lower.includes("not")) {
      return { label: "Connected", color: "var(--success)" };
    }

    // Official Status: Interested (Green)
    if (lower.includes("interested") && !lower.includes("not")) {
      return { label: "Interested", color: "var(--success)" };
    }

    // Official Status: Not Connected (Red) - includes No Answer, Invalid
    if (lower.includes("not_connected") || lower.includes("not connected") ||
      lower.includes("no_answer") || lower.includes("no answer") ||
      lower.includes("invalid") || lower.includes("failed") ||
      lower.includes("voicemail") || lower.includes("busy") === false && lower.includes("callback") === false && lower.includes("connected") === false && lower.includes("interested") === false) {
      // Note: The logic above acts as a catch-all for negative/unknown, but we must be careful.
      // Let's be more specific and use a fallback at the end instead.
    }

    // Official Status: Not Connected (Red)
    if (lower.includes("not_connected") || lower.includes("not connected") ||
      lower.includes("no_answer") || lower.includes("no answer") ||
      lower.includes("invalid") || lower.includes("failed")) {
      return { label: "Not Connected", color: "var(--destructive)" };
    }

    // Official Status: Not Interested (Red)
    if (lower.includes("not_interested") || lower.includes("not interested")) {
      return { label: "Not Interested", color: "var(--destructive)" };
    }

    // Official Status: Busy (Orange)
    if (lower.includes("busy")) {
      return { label: "Busy", color: "var(--warning)" };
    }

    // Official Status: Callback Requested (Yellow)
    if (lower.includes("callback")) {
      return { label: "Callback Requested", color: "var(--primary)" }; // Gold/Yellow
    }

    // Default Fallback -> Not Connected (Red) or Unknown?
    // User insisted on ONLY official statuses.
    // If we encounter something else, we should probably categorize it as Not Connected or log it.
    // Let's default to "Not Connected" (Red) for safety, as usually unknown outcomes are failures.
    return { label: "Not Connected", color: "var(--destructive)" };
  };

  const [weeklyActivityData, setWeeklyActivityData] = useState<any[]>([]);

  const handleCallLead = (leadId: number) => {
    router.push(`/leads?leadId=${leadId}&action=call`);
  };

  const handleViewLead = (leadId: number) => {
    router.push(`/leads?leadId=${leadId}`);
  };

  // Removed standard loading block for skeleton pattern

  return (
    <div className="space-y-8 animate-fade-in p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <PageHeader
        title="Telecaller Dashboard,"
        highlightedText={user?.name || "User"}
        description="Manage call queues, follow-ups, and daily targets"
      /* action={
        <div className="hidden md:flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2.5 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">
            Online
          </span>
        </div>
      } */
      />

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <StatsCard
              title="Calls Made Today"
              value={stats.callsMadeToday}
              description="Daily outbound calls"
              icon={PhoneCall}
              colorClass="primary"
            />

            <StatsCard
              title="Connected Calls"
              value={stats.connectedCalls}
              description="Successful connections"
              icon={CheckCircle2}
              colorClass="success"
            />

            <StatsCard
              title="Pending Follow-ups"
              value={stats.followUpsPending}
              description="Scheduled for today"
              icon={Clock}
              colorClass="warning"
            />

            <StatsCard
              title="Connect Rate"
              value={`${stats.connectRate}%`}
              description="Answer percentage"
              icon={Target}
              colorClass="info"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Call Outcomes Chart */}
        <SectionCard
          title="Today's Outcomes"
          description="Distribution of call results"
          icon={Target}
          iconColor="primary"
        >
          {isLoading ? (
            <div className="h-[250px] w-full flex items-center justify-center">
              <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </div>
          ) : callOutcomes.length > 0 ? (
            <>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={callOutcomes}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="outcome"
                    >
                      {callOutcomes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {callOutcomes.map((item) => (
                  <div key={item.outcome} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.outcome}</span>
                    <span className="font-medium ml-auto">{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No Outcomes Yet"
              description="Make calls to see today's outcomes distribution."
              icon={Target}
              className="py-12"
            />
          )}
        </SectionCard>

        {/* Recent Logs (Table) */}
        <SectionCard
          title="Recent Logs"
          description="Latest call activity"
          icon={Clock}
          iconColor="info"
        >
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between py-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : recentCalls.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2 h-8">Lead</TableHead>
                  <TableHead className="py-2 h-8 text-center">Outcome</TableHead>
                  <TableHead className="py-2 h-8 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCalls.map((call, i) => {
                  const details = getOutcomeDetails(call.outcome);
                  return (
                    <TableRow key={i}>
                      <TableCell className="py-2 text-xs font-medium">{call.lead}</TableCell>
                      <TableCell className="py-2 text-center">
                        <div className="flex justify-center">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal"
                            style={{
                              borderColor: details.color,
                              color: details.color,
                              backgroundColor: `${details.color}10`
                            }}
                          >
                            {details.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-muted-foreground text-right">
                        {call.time}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No Recent Activity"
              description="Your recent calls will appear here."
              icon={Clock}
              className="py-12"
            />
          )}
        </SectionCard>
      </div>

      {/* Weekly Activity Chart */}
      <SectionCard
        title="Weekly Performance"
        description="Call volume over the last 7 days"
        icon={TrendingUp}
        iconColor="success"
      >
        {isLoading ? (
          <div className="h-[250px] w-full flex items-end justify-between gap-2 px-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className={`w-full rounded-t-lg`} style={{ height: `${Math.random() * 60 + 20}%` }} />
            ))}
          </div>
        ) : weeklyActivityData.length > 0 ? (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                />
                <Bar dataKey="calls" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            title="No Weekly Data"
            description="Start making calls to see your weekly performance."
            icon={TrendingUp}
            className="py-12"
          />
        )}
      </SectionCard>
    </div>
  );
}
