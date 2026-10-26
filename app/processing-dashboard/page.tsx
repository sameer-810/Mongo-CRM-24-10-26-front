"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SectionCard } from "@/components/dashboard/section-card";
import {
  FileText,
  AlertCircle,
  Clock,
  FileCheck,
  FolderOpen,
  PieChart as PieChartIcon,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatDate } from "@/lib/format-utils";
import { getProcessingDashboardData } from "@/lib/server-actions";
import { GetProcessingDashboardStatsResponseType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomPieTooltip } from "@/components/dashboard/chart-tooltips";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProcessingDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<GetProcessingDashboardStatsResponseType["data"] | null>(null);
  const [documentStats, setDocumentStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const response = await getProcessingDashboardData(Number(user.id));
        if (response.success && response.data) {
          setDashboardData(response.data);

          // Set up pie chart data from API response
          setDocumentStats([
            /* {
              name: "Total Leads",
              value: response.data.totalLeads,
              color: "hsl(var(--primary))",
            }, */
            {
              name: "Pending Leads",
              value: response.data.pendingLeads,
              color: "var(--warning)",
            },
            {
              name: "Expired Leads",
              value: response.data.expiredLeads,
              color: "var(--destructive)",
            },
            {
              name: "Uploaded Documents",
              value: response.data.uploadedDocuments,
              color: "var(--success)",
            },
          ]);
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
  }, [user?.id]);



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
      {/* Header */}
      <PageHeader
        title="Processing Dashboard,"
        highlightedText={user?.name || "User"}
        description="Global document verification and compliance overview"
      /* action={
        <div className="hidden md:flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2.5 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-muted-foreground">
            System Operational
          </span>
        </div>
      } */
      />

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={dashboardData?.totalLeads || 0}
          description="All leads in processing"
          icon={FolderOpen}
          colorClass="primary"
        />
        <StatsCard
          title="Pending Leads"
          value={dashboardData?.pendingLeads || 0}
          description="Awaiting verification"
          icon={Clock}
          colorClass="warning"
        />
        <StatsCard
          title="Expired Leads"
          value={dashboardData?.expiredLeads || 0}
          description="Leads with expired documents"
          icon={ShieldAlert}
          colorClass="error"
        />
        <StatsCard
          title="Uploaded Documents"
          value={dashboardData?.uploadedDocuments || 0}
          description="Total documents uploaded"
          icon={FileCheck}
          colorClass="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Verification Status Pie Chart (Detailed) */}
        <SectionCard
          title="Verification Distribution"
          description="Overall status of document pipeline"
          icon={PieChartIcon}
          iconColor="primary"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-[220px] w-[220px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={documentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {documentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="flex-1 w-full grid grid-cols-1 gap-3">
              {documentStats.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm p-2 rounded bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Critical Alerts List */}
        <SectionCard
          title="Expiry Alerts"
          description="Documents needing immediate action"
          icon={AlertCircle}
          iconColor="error"
        >
          <div className="space-y-3">
            {dashboardData?.expiryAlerts && dashboardData.expiryAlerts.length > 0 ? (
              dashboardData.expiryAlerts.map((alert, index) => {
                const isExpired = alert.daysLeft < 0;
                const isCritical = alert.daysLeft >= 0 && alert.daysLeft <= 7;
                // const status = isExpired ? "expired" : isCritical ? "critical" : "warning";

                return (
                  <div
                    key={index}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-lg border transition-all",
                      isExpired ? "bg-destructive/10 border-destructive/30" :
                        isCritical ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-sm truncate text-foreground">{alert.leadName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <FileText className={cn("h-3 w-3", isExpired ? "text-destructive" : "text-muted-foreground")} />
                        <span className="text-xs text-muted-foreground truncate">{alert.documentType}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant={isExpired ? "destructive" : isCritical ? "destructive" : "secondary"}
                        className="text-[10px] h-5"
                      >
                        {isExpired ? "Expired" : `${alert.daysLeft} days left`}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{formatDate(alert.expiryDate)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No expiry alerts</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Processing Throughput Bar Chart */}
        {/* <SectionCard
          title="Weekly Throughput"
          description="Files processed vs rejected"
          icon={TrendingUp}
          iconColor="success"
        >
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={throughputData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar
                  dataKey="processed"
                  fill="var(--success)"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                  barSize={24}
                />
                <Bar
                  dataKey="failed"
                  fill="var(--destructive)"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                  barSize={24}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  formatter={(value) => <span className="text-muted-foreground capitalize">{value === "processed" ? "Approved" : "Rejected"}</span>}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard> */}
      </div>

      {/* Recent Files Table (Full WIdth) */}
      {/* <SectionCard
        title="Recent Files in Queue"
        description="Latest leads entering documentation stage"
        icon={FolderOpen}
        iconColor="primary"
        action={
          <Button variant="ghost" size="sm" onClick={() => router.push("/leads?status=Documentation")} className="text-xs">
            View All Files <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        }
      >
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px]">Lead Name</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProcessing.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium text-sm">{file.leadName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{file.stage}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{file.time}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-normal",
                      file.status === "Flagged" && "text-destructive border-destructive/30 bg-destructive/5",
                      file.status === "Looking Good" && "text-success border-success/30 bg-success/5"
                    )}>
                      {file.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleViewLead(101)}>
                      Open File
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard> */}
    </div>
  );
}
