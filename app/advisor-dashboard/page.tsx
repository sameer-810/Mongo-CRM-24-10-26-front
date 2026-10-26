"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SectionCard } from "@/components/dashboard/section-card";
import {
  Users,
  Calendar,
  FileText,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Target,
  LayoutList,
  MoreHorizontal,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getAdvisorDashboard } from "@/lib/server-actions";
import { AdvisorDashboardData } from "@/lib/types";
import { CustomBarTooltip, CustomPieTooltip } from "@/components/dashboard/chart-tooltips";

export default function AdvisorDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdvisorDashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      try {
        const data = await getAdvisorDashboard(user.id);
        setDashboardData(data);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const handleViewLead = (leadId: number) => {
    router.push(`/leads?leadId=${leadId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in p-6 md:p-8 max-w-[1600px] mx-auto">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <PageHeader
        title="Advisor Dashboard,"
        highlightedText={user?.name || "User"}
        description="Monitor your pipeline, opportunities, and daily schedule"

      />

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Opportunities"
          value={dashboardData?.activeOpportunities || 0}
          description="Qualified leads in pipeline"
          icon={LayoutList}
          colorClass="primary"
        />

        <StatsCard
          title="New Leads Today"
          value={dashboardData?.totalAssignedLeadsToday || 0}
          description="Leads assigned today"
          icon={Users}
          colorClass="info"
        />

        <StatsCard
          title="Pending Agreements"
          value={dashboardData?.pendingAgreements || 0}
          description="Awaiting client signature"
          icon={FileText}
          colorClass="warning"
        />

        <StatsCard
          title="Close Rate"
          value={dashboardData?.closeRate || "0%"}
          description="Opportunity to Client"
          icon={Target}
          colorClass="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* New Leads Today */}
        <SectionCard
          title="New Leads Today"
          description="Directly assigned to you"
          icon={Users}
          iconColor="primary"
          className="col-span-1"
        >
          <div className="space-y-4">
            {dashboardData?.todayAssignedLeads && dashboardData.todayAssignedLeads.length > 0 ? (
              dashboardData.todayAssignedLeads.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleViewLead(item.id)}
                  className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-card/50 hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{item.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{item.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/50">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">
                      {item.stage}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {new Date(item.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground pl-4">
                <p>No new leads assigned today</p>
              </div>
            )}
          </div>
          <Button variant="outline" className="w-full mt-4 text-xs h-8" onClick={() => router.push('/leads')}>
            View All Leads
          </Button>
        </SectionCard>

        {/* Pipeline Overview */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <SectionCard
            title="Pipeline Stages"
            description="Lead distribution across active stages"
            icon={TrendingUp}
            iconColor="info"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 h-[250px]">
                {/* Color mapping helper for Pipeline Stages */}
                {(() => {
                  const getStageColor = (stageName: string, fallbackColor?: string) => {
                    const name = stageName.toLowerCase();
                    if (name.includes('hot')) return 'var(--primary)';
                    if (name.includes('dead')) return 'var(--error)';
                    if (name.includes('cold')) return 'var(--info)';
                    return fallbackColor || 'var(--muted)';
                  };

                  const chartData = dashboardData?.pipelineStages.map(s => ({
                    ...s,
                    name: s.stageName,
                    status: s.stageName,
                    resolvedColor: getStageColor(s.stageName, s.color)
                  })) || [];

                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/30" />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="stageName"
                          type="category"
                          tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          width={100}
                        />
                        <Tooltip
                          content={<CustomBarTooltip />}
                          cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                        />
                        <Bar
                          dataKey="count"
                          radius={[0, 4, 4, 0]}
                          barSize={32}
                          background={{ fill: "var(--muted)", opacity: 0.1 }}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.resolvedColor} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
              <div className="w-full sm:w-48 flex flex-col justify-center gap-4 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
                {dashboardData?.pipelineStages.map((stage, index) => {
                  const getStageColor = (name: string, fallback?: string) => {
                    const lower = name.toLowerCase();
                    if (lower.includes('hot')) return 'var(--primary)';
                    if (lower.includes('dead')) return 'var(--error)';
                    if (lower.includes('cold')) return 'var(--info)';
                    return fallback || 'var(--muted)';
                  };
                  const color = getStageColor(stage.stageName, stage.color);

                  return (
                    <div key={index} className="flex flex-col">
                      <span className="text-xs text-muted-foreground mb-1">{stage.stageName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">{stage.count}</span>
                        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min((stage.count / 20) * 100, 100)}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SectionCard>

          {/* Daily Interaction Volume */}
          <SectionCard
            title="Daily Interaction Volume"
            description="Interactions made today (Calls, WhatsApp, Emails)"
            icon={Briefcase}
            iconColor="success"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 h-[250px]">
              <div className="flex-1 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Calls", value: dashboardData?.interactionVolume.call || 0, fill: "var(--info)" },
                        { name: "WhatsApp", value: dashboardData?.interactionVolume.whatsapp || 0, fill: "var(--success)" },
                        { name: "Emails", value: dashboardData?.interactionVolume.email || 0, fill: "var(--warning)" },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: "Calls", fill: "var(--info)" },
                        { name: "WhatsApp", fill: "var(--success)" },
                        { name: "Emails", fill: "var(--warning)" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-48 flex flex-col gap-4">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-info" />
                    <span className="text-xs font-medium">Calls</span>
                  </div>
                  <span className="text-sm font-bold">{dashboardData?.interactionVolume.call || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-success" />
                    <span className="text-xs font-medium">WhatsApp</span>
                  </div>
                  <span className="text-sm font-bold">{dashboardData?.interactionVolume.whatsapp || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-warning" />
                    <span className="text-xs font-medium">Emails</span>
                  </div>
                  <span className="text-sm font-bold">{dashboardData?.interactionVolume.email || 0}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Recent Workflow Activity */}
      <SectionCard
        title="Recent Workflow Activity"
        description="Real-time updates from your assigned clients"
        icon={Clock}
        iconColor="warning"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardData?.recentActivities.map((activity, index) => (
            <div
              key={index}
              className="flex flex-col p-4 rounded-lg border border-border bg-card/50 hover:bg-muted/30 transition-all hover:scale-[1.01] cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center border",
                    activity.type === "reminder" && "bg-success/10 border-success/20 text-success",
                    activity.type === "call" && "bg-info/10 border-info/20 text-info",
                    activity.type === "whatsapp" && "bg-success/10 border-success/20 text-success",
                    activity.type === "email" && "bg-warning/10 border-warning/20 text-warning"
                  )}
                >
                  {activity.type === "reminder" && <Calendar className="h-4 w-4" />}
                  {activity.type === "call" && <Phone className="h-4 w-4" />}
                  {activity.type === "whatsapp" && <MessageSquare className="h-4 w-4" />}
                  {activity.type === "email" && <Mail className="h-4 w-4" />}
                </div>
                <span className="text-[10px] text-muted-foreground">{activity.timeAgo}</span>
              </div>

              <h4 className="text-sm font-semibold mb-1">{activity.title}</h4>
              <p className="text-xs text-muted-foreground font-medium mb-2">{activity.leadName}</p>
              <p className="text-xs text-muted-foreground/70 mt-auto pt-2 border-t border-border/50">
                {activity.description}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
