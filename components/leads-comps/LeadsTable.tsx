import { useState, useEffect, useCallback, useMemo } from "react";
import {
  STATUS_LABELS,
} from "@/lib/mock-data";
import {
  getAssignableUsersAction,
  getLeadsAction,
  updateLeadAssignmentsBulkAction,
  deleteMultipleLeadsAction,
} from "@/app/leads/actions";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";

import { Lead, LeadStatus, LeadStage } from "@/lib/types";
import { LeadStatusBadge, LeadStageBadge } from "./LeadStatusBadge";
import { LeadAssignmentModal } from "./LeadAssignmentModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatDateTime } from "@/lib/format-utils";
import { userRoleConfig } from "@/lib/badge-configs";
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Activity,
  CreditCard,
  Layers,
  Phone,
  Mail,
  MessageCircle,
  Edit,
  Trash2,
  FileText,
  Globe,
  Download,
  X,
  RotateCcw,
  ArrowRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  AlertCircle,
  Shield,
  User,
  UserPlus,
  Columns as ColumnsIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns/format";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

interface LeadsTableProps {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
  onDeleteFiltered?: () => void;
  onCallLead?: (lead: Lead) => void;
  onWhatsAppLead?: (lead: Lead) => void;
  onAddReminder?: (lead: Lead) => void;
  onAssignLead?: (lead: Lead) => void;
  // Added props for server-side pagination/filtering compatibility
  headerAction?: React.ReactNode;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  searchQuery?: string;
  statusFilter?: string;
  stageFilter?: string;
  visaCategoryFilter?: string;
  countryFilter?: string;
  leadOwnerFilter?: string;
  fromDate?: string;
  toDate?: string;
  availableCountries?: string[];
  availableVisaCategories?: string[];
  availableStages?: Array<{ id: number; name: string }>;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (
    type: "status" | "stage" | "visaCategory" | "country" | "leadOwner" | "dateRange",
    value: string
  ) => void;
  onDateRangeChange?: (fromDate: string | undefined, toDate: string | undefined) => void;
  isLoading?: boolean;
  onAssignClick?: (lead: Lead) => void; // Alias for onAssignLead for compatibility
  onView: (lead: Lead) => void; // Alias for onViewLead for compatibility

  showOwner?: boolean;
  canDelete?: boolean;
  canAssign?: boolean;
  userRole?: string;
  userRoleMap?: Record<string, string>;
  totalLeads?: number;
  onExport?: () => void;
  onAssignmentSuccess?: () => void;
  canEdit?: boolean;
}

export function LeadsTable({
  leads,
  onViewLead,
  onEditLead,
  onDeleteLead,
  onDeleteFiltered,
  onCallLead,
  onWhatsAppLead,
  onAddReminder,
  onAssignLead,
  // New props destructuring
  headerAction,
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  onPageSizeChange,
  searchQuery: externalSearchQuery,
  statusFilter: externalStatusFilter,
  stageFilter: externalStageFilter,
  visaCategoryFilter: externalVisaCategoryFilter,
  countryFilter: externalCountryFilter,
  leadOwnerFilter: externalLeadOwnerFilter,
  fromDate: externalFromDate,
  toDate: externalToDate,
  availableCountries = [],
  availableVisaCategories = [],
  availableStages = [],
  onSearchChange,
  onFilterChange,
  onDateRangeChange,
  isLoading = false,
  onAssignClick,
  onView,
  showOwner = true,
  canDelete = false,
  canAssign = false,
  canEdit = false,
  userRole,
  userRoleMap = {},
  totalLeads: externalTotalLeads,
  onExport,
  onAssignmentSuccess,
}: LeadsTableProps) {
  const isPersonalRole =
    userRole?.toLowerCase() === "advisor" ||
    userRole?.toLowerCase() === "telecaller" ||
    userRole?.toLowerCase() === "processing";
  const { toast } = useToast();

  const canUseOwnerFilter =
    userRole?.toLowerCase() === "admin" || userRole?.toLowerCase() === "manager";

  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [leadsToAssign, setLeadsToAssign] = useState<Lead[]>([]);

  // Selection state
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set());
  // Delete confirmation state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [leadsToDelete, setLeadsToDelete] = useState<number[]>([]);

  const DEFAULT_COLUMN_VISIBILITY = {
    leadDate: true,
    fullname: true,
    phone: true,
    email: true,
    status: true,
    stage: true,
    whatsapp: true,
    leadOwner: true,
    bestTimeToCall: true,
    source: true,
    assignedBy: true,
    visaCategory: true,
    jobTitle: true,
    country: true,
    monthlyIncome: true,
  };

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(DEFAULT_COLUMN_VISIBILITY);

  const COLUMN_LABELS: Record<string, string> = {
    leadDate: "Lead Date",
    fullname: "Lead Name",
    phone: "Phone",
    email: "Email",
    status: "Status",
    stage: "Stage",
    whatsapp: "WhatsApp",
    leadOwner: "Lead Owner",
    bestTimeToCall: "Best Time to Call",
    source: "Source",
    assignedBy: "Assigned By",
    visaCategory: "Visa Category",
    jobTitle: "Job Title",
    country: "Country",
    monthlyIncome: "Monthly Income",
  };

  const [isColumnSettingsInitialized, setIsColumnSettingsInitialized] = useState(false);

  // Load Column Visibility from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("leads-table-columns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved settings with defaults to ensure new columns aren't lost
        setVisibleColumns(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        // Silent fail for localStorage parsing
      }
    }
    setIsColumnSettingsInitialized(true);
  }, []);

  // Save Column Visibility to localStorage
  useEffect(() => {
    if (isColumnSettingsInitialized) {
      localStorage.setItem("leads-table-columns", JSON.stringify(visibleColumns));
    }
  }, [visibleColumns, isColumnSettingsInitialized]);

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Select All handler
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Ensure IDs are treated as numbers
      const allIds = new Set(leads.map(lead => Number(lead.id)));
      setSelectedLeadIds(allIds);
    } else {
      setSelectedLeadIds(new Set());
    }
  };

  // Individual row selection handler
  const handleSelectRow = (leadId: number, checked: boolean) => {
    const newSelection = new Set(selectedLeadIds);
    if (checked) {
      newSelection.add(leadId);
    } else {
      newSelection.delete(leadId);
    }
    setSelectedLeadIds(newSelection);
  };

  // Delete confirmation handler
  const handleConfirmDelete = async () => {
    if (leadsToDelete.length === 0) return;

    try {
      const idsToDelete = leadsToDelete.map((id) => String(id));

      const response = await deleteMultipleLeadsAction(idsToDelete);

      if (response && response.success) {
        toast({
          title: "Leads Deleted",
          description: `Successfully deleted ${response.count} lead${response.count > 1 ? "s" : ""}.`,
        });
        // Clear selection and close dialog
        setSelectedLeadIds(new Set());
        setIsDeleteConfirmOpen(false);
        setLeadsToDelete([]);
        // Trigger parent refresh if callback provided
        if (onAssignmentSuccess) onAssignmentSuccess();
      }
    } catch (error: any) {
      console.error("Failed to delete leads:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "An error occurred while deleting leads.",
        variant: "destructive",
      });
    }
  };

  // Check if all rows are selected
  const isAllSelected = leads.length > 0 && selectedLeadIds.size === leads.length;
  const isSomeSelected = selectedLeadIds.size > 0 && selectedLeadIds.size < leads.length;

  useEffect(() => {
    // We need assignable users for:
    // - Admin/Manager owner filter
    // - Bulk assignment modal (when canAssign is true)
    if (!canUseOwnerFilter && !canAssign) return;
    let cancelled = false;

    (async () => {
      try {
        const users = await getAssignableUsersAction();
        if (cancelled) return;
        setAssignableUsers(Array.isArray(users) ? users : []);
      } catch (err) {
        console.error("Error fetching assignable users:", err);
        if (!cancelled) setAssignableUsers([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canUseOwnerFilter, canAssign]);

  // Use external or internal state
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalStatusFilter, setInternalStatusFilter] =
    useState<string>("all");
  const [internalStageFilter, setInternalStageFilter] = useState<string>("all");
  const [internalVisaCategoryFilter, setInternalVisaCategoryFilter] =
    useState<string>("all");
  const [internalCountryFilter, setInternalCountryFilter] =
    useState<string>("all");
  const [internalLeadOwnerFilter, setInternalLeadOwnerFilter] =
    useState<string>("all");
  const [internalFromDate, setInternalFromDate] = useState<Date | undefined>();
  const [internalToDate, setInternalToDate] = useState<Date | undefined>();
  // Temporary date selections for the date picker (before applying)
  const [tempFromDate, setTempFromDate] = useState<Date | undefined>();
  const [tempToDate, setTempToDate] = useState<Date | undefined>();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const searchQuery = externalSearchQuery ?? internalSearchQuery;
  const statusFilter = externalStatusFilter ?? internalStatusFilter;
  const stageFilter = externalStageFilter ?? internalStageFilter;
  const visaCategoryFilter =
    externalVisaCategoryFilter ?? internalVisaCategoryFilter;
  const countryFilter = externalCountryFilter ?? internalCountryFilter;
  const leadOwnerFilter = externalLeadOwnerFilter ?? internalLeadOwnerFilter;

  // Convert external string dates to Date objects if provided (using useMemo to prevent infinite loops)
  const fromDate = useMemo(() => {
    return externalFromDate ? new Date(externalFromDate) : internalFromDate;
  }, [externalFromDate, internalFromDate]);

  const toDate = useMemo(() => {
    return externalToDate ? new Date(externalToDate) : internalToDate;
  }, [externalToDate, internalToDate]);

  // Clear selection when leads change (e.g., pagination, filters)
  useEffect(() => {
    setSelectedLeadIds(new Set());
  }, [page, searchQuery, statusFilter, stageFilter, visaCategoryFilter, countryFilter, leadOwnerFilter, externalFromDate, externalToDate]);

  // Handler wrappers
  const handleSearchChange = (value: string) => {
    if (onSearchChange) onSearchChange(value);
    else setInternalSearchQuery(value);
  };

  const handleStatusChange = (value: string) => {
    if (onFilterChange) onFilterChange("status", value);
    else setInternalStatusFilter(value);
  };

  const handleStageChange = (value: string) => {
    if (onFilterChange) onFilterChange("stage", value);
    else setInternalStageFilter(value);
  };

  const handleVisaCategoryChange = (value: string) => {
    if (onFilterChange) onFilterChange("visaCategory", value);
    else setInternalVisaCategoryFilter(value);
  };

  const handleCountryChange = (value: string) => {
    if (onFilterChange) onFilterChange("country", value);
    else setInternalCountryFilter(value);
  };

  const handleLeadOwnerChange = (value: string) => {
    if (onFilterChange) onFilterChange("leadOwner", value);
    else setInternalLeadOwnerFilter(value);
  };

  const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
    if (onDateRangeChange) {
      const fromStr = from ? format(from, "yyyy-MM-dd") : undefined;
      const toStr = to ? format(to, "yyyy-MM-dd") : undefined;
      onDateRangeChange(fromStr, toStr);
    } else {
      setInternalFromDate(from);
      setInternalToDate(to);
    }
  };

  const handleClearDateRange = () => {
    if (onDateRangeChange) {
      onDateRangeChange(undefined, undefined);
    } else {
      setInternalFromDate(undefined);
      setInternalToDate(undefined);
    }
    // Also clear temp dates
    setTempFromDate(undefined);
    setTempToDate(undefined);
  };

  // Initialize temp dates when popover opens
  const handleDatePickerOpenChange = (open: boolean) => {
    setIsDatePickerOpen(open);
    if (open) {
      // Initialize temp dates with current applied dates
      setTempFromDate(fromDate);
      setTempToDate(toDate);
    } else {
      // Reset temp dates when closed without applying
      setTempFromDate(undefined);
      setTempToDate(undefined);
    }
  };

  // Handle Apply button click
  const handleApplyDateFilter = () => {
    if (tempFromDate) {
      handleDateRangeChange(tempFromDate, tempToDate);
    } else {
      // If no fromDate, clear the filter
      handleClearDateRange();
    }
    // Close the popover and reset temp dates
    setIsDatePickerOpen(false);
    setTempFromDate(undefined);
    setTempToDate(undefined);
  };

  // Check if Apply button should be enabled
  const canApplyDateFilter = tempFromDate !== undefined;

  // Resolve assign handler
  const finalOnAssignLead = onAssignLead || onAssignClick;
  const finalOnViewLead = onViewLead || onView;

  // Helper to get owner styling based on actual user role from userRoleMap
  const getOwnerStyles = (name?: string) => {
    if (!name) return userRoleConfig.telecaller;
    // Look up the user's actual role from the userRoleMap
    const userRole = userRoleMap[name.toLowerCase()];
    // Return the appropriate config based on the user's role
    if (userRole === "admin") return userRoleConfig.admin;
    if (userRole === "manager") return userRoleConfig.manager;
    if (userRole === "advisor") return userRoleConfig.advisor;
    if (userRole === "processing") return userRoleConfig.processing;
    if (userRole === "telecaller") return userRoleConfig.telecaller;
    // Default to telecaller if role not found
    return userRoleConfig.telecaller;
  };

  const handleExportLeads = useCallback(async () => {
    // If no total is provided, check current page leads
    if (total === 0 && leads.length === 0) {
      toast({
        title: "No Leads to Export",
        description: "There are no leads matching your current filters.",
        variant: "destructive",
      });
      return;
    }

    // Determine the exact count to export (from UI total or current leads)
    const totalToExport = total > 0 ? total : leads.length;

    // Show loading toast
    toast({
      title: "Preparing Export",
      description: `Fetching all ${totalToExport} lead${totalToExport > 1 ? "s" : ""}...`,
      duration: 2000,
    });

    try {
      // Prepare filters object
      const filters: any = {
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        stageId: stageFilter !== "all" ? Number(stageFilter) : undefined,
        visaCategory:
          visaCategoryFilter !== "all" ? visaCategoryFilter : undefined,
        country: countryFilter !== "all" ? countryFilter : undefined,
        assignedTo: leadOwnerFilter !== "all" ? leadOwnerFilter : undefined,
      };

      // Handle date filtering based on API requirements
      if (fromDate && toDate) {
        // Date range: use fromDate and toDate parameters
        filters.fromDate = format(fromDate, "yyyy-MM-dd");
        filters.toDate = format(toDate, "yyyy-MM-dd");
      } else if (fromDate) {
        // Single date: use date parameter
        filters.date = format(fromDate, "yyyy-MM-dd");
      }

      // Fetch ALL data using the exact total count shown in the UI
      // This ensures we get exactly what the user sees (whether filtered or not)
      const response = await getLeadsAction(1, totalToExport, filters);

      if (!response || !response.data || response.data.length === 0) {
        toast({
          title: "No Leads to Export",
          description: "There are no leads matching your current filters.",
          variant: "destructive",
        });
        return;
      }

      const allLeads = response.data as unknown as Lead[];

      // Verify we got the expected count
      if (allLeads.length === 0) {
        toast({
          title: "No Data to Export",
          description: "No leads were found matching your criteria.",
          variant: "destructive",
        });
        return;
      }

      // Prepare export data with all relevant fields
      const exportData = allLeads.map((lead, index) => ({
        "Sr. No.": index + 1,
        "Lead ID": lead.id || "",
        "Lead Date": lead.createdAt
          ? formatDateTime(lead.createdAt)
          : "",
        "Full Name": lead.fullname || "",
        "Phone Number": lead.phone || "",
        "Email Address": lead.email || "",
        "WhatsApp Number": lead.whatsapp || "",
        Status: lead.status || "",
        Stage: lead.stage?.name || "",
        "Lead Owner": lead.leadOwner || "Unassigned",
        "Assigned By": lead.assignedBy || "",
        "Visa Category": lead.visaCategory ? lead.visaCategory.replace(/_/g, " ") : "",
        "Job Title": lead.jobTitle || "",
        Country: lead.country || "",
        "Monthly Income (AED)": lead.monthlyIncome ? Number(lead.monthlyIncome).toLocaleString() : "",
        "Lead Source": lead.leadSource || "",
        "Lead Subsource": lead.leadSubsource || "",
        "Best Time to Call": lead.formData?.['best_time_to_call_you?'] || lead.formData?.['Best Time to Call You?'] || lead.formData?.best_time_to_call || "",
        "Created By": lead.createdBy || "",
        "Created At": lead.createdAt
          ? formatDateTime(lead.createdAt)
          : "",
        "Updated At": lead.updatedAt
          ? formatDateTime(lead.updatedAt)
          : "",
        "Is Active": lead.isActive ? "Yes" : "No",
      }));

      // Create worksheet from data
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 8 },  // Sr. No.
        { wch: 10 }, // Lead ID
        { wch: 15 }, // Lead Date
        { wch: 20 }, // Full Name
        { wch: 15 }, // Phone Number
        { wch: 28 }, // Email Address
        { wch: 15 }, // WhatsApp Number
        { wch: 18 }, // Status
        { wch: 12 }, // Stage
        { wch: 20 }, // Lead Owner
        { wch: 20 }, // Assigned By
        { wch: 20 }, // Visa Category
        { wch: 20 }, // Job Title
        { wch: 15 }, // Country
        { wch: 20 }, // Monthly Income
        { wch: 18 }, // Lead Source
        { wch: 18 }, // Lead Subsource
        { wch: 18 }, // Created By
        { wch: 20 }, // Created At
        { wch: 20 }, // Updated At
        { wch: 10 }, // Is Active
      ];
      ws["!cols"] = columnWidths;

      // Create workbook and append worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads Data");

      // Generate filename with current date and applied filters
      const filterParts = [];
      if (statusFilter !== "all")
        filterParts.push(STATUS_LABELS[statusFilter as LeadStatus]?.replace(/\s+/g, "_") || statusFilter);
      if (stageFilter !== "all") {
        const stageName = availableStages.find(s => String(s.id) === stageFilter)?.name || stageFilter;
        filterParts.push(stageName.replace(/\s+/g, "_"));
      }
      if (visaCategoryFilter !== "all")
        filterParts.push(visaCategoryFilter.replace(/\s+/g, "_"));
      if (countryFilter !== "all")
        filterParts.push(countryFilter.replace(/\s+/g, "_"));

      const filterSuffix =
        filterParts.length > 0 ? `_${filterParts.join("_")}` : "";
      const filename = `leads_export${filterSuffix}_${format(
        new Date(),
        "yyyy-MM-dd_HHmmss"
      )}.xlsx`;

      // Write and download the file
      XLSX.writeFile(wb, filename);

      // Show success toast with detailed information
      const successMessage =
        allLeads.length === totalToExport
          ? `All ${allLeads.length} lead${allLeads.length > 1 ? "s" : ""} exported successfully!`
          : `Exported ${allLeads.length} of ${totalToExport} lead${totalToExport > 1 ? "s" : ""}`;

      toast({
        title: "Export Successful",
        description: `${successMessage}\nFile: ${filename}`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the data. Please try again.",
        variant: "destructive",
      });
    }
  }, [total, leads, toast, searchQuery, statusFilter, stageFilter, visaCategoryFilter, countryFilter, leadOwnerFilter, availableStages]);

  const handleExportAllLeads = useCallback(async () => {
    if (userRole?.toLowerCase() !== "admin") return;

    const totalToExport = total > 0 ? total : leads.length;
    if (totalToExport === 0) {
      toast({
        title: "No Leads to Export",
        description: "There are no leads matching your current filters.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Preparing Export",
      description: `Fetching all ${totalToExport} leads for export...`,
      duration: 3000,
    });

    try {
      const filters: any = {
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        stageId: stageFilter !== "all" ? Number(stageFilter) : undefined,
        visaCategory: visaCategoryFilter !== "all" ? visaCategoryFilter : undefined,
        country: countryFilter !== "all" ? countryFilter : undefined,
        assignedTo: leadOwnerFilter !== "all" ? leadOwnerFilter : undefined,
        exportAll: true,
      };

      if (fromDate && toDate) {
        filters.fromDate = format(fromDate, "yyyy-MM-dd");
        filters.toDate = format(toDate, "yyyy-MM-dd");
      } else if (fromDate) {
        filters.date = format(fromDate, "yyyy-MM-dd");
      }

      const response = await getLeadsAction(1, totalToExport, filters);

      if (!response || !response.data || response.data.length === 0) {
        toast({
          title: "No Leads to Export",
          description: "There are no leads matching your current filters.",
          variant: "destructive",
        });
        return;
      }

      const allLeads = response.data as unknown as Lead[];

      const exportData = allLeads.map((lead, index) => ({
        "Sr. No.": index + 1,
        "Lead ID": lead.id || "",
        "Lead Date": lead.createdAt ? formatDateTime(lead.createdAt) : "",
        "Full Name": lead.fullname || "",
        "Phone Number": lead.phone || "",
        "Email Address": lead.email || "",
        "WhatsApp Number": lead.whatsapp || "",
        Status: lead.status || "",
        Stage: lead.stage?.name || "",
        "Lead Owner": lead.leadOwner || "Unassigned",
        "Assigned By": lead.assignedBy || "",
        "Visa Category": lead.visaCategory ? lead.visaCategory.replace(/_/g, " ") : "",
        "Job Title": lead.jobTitle || "",
        Country: lead.country || "",
        "Monthly Income (AED)": lead.monthlyIncome ? Number(lead.monthlyIncome).toLocaleString() : "",
        "Lead Source": lead.leadSource || "",
        "Lead Subsource": lead.leadSubsource || "",
        "Best Time to Call": lead.formData?.['best_time_to_call_you?'] || lead.formData?.['Best Time to Call You?'] || lead.formData?.best_time_to_call || "",
        "Created By": lead.createdBy || "",
        "Created At": lead.createdAt ? formatDateTime(lead.createdAt) : "",
        "Updated At": lead.updatedAt ? formatDateTime(lead.updatedAt) : "",
        "Is Active": lead.isActive ? "Yes" : "No",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const columnWidths = [
        { wch: 8 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
        { wch: 28 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 20 },
        { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 },
        { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 20 },
        { wch: 20 }, { wch: 10 },
      ];
      ws["!cols"] = columnWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "All Leads");

      const filename = `all_leads_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.xlsx`;
      XLSX.writeFile(wb, filename);

      toast({
        title: "Export Successful",
        description: `All ${allLeads.length} leads exported successfully!`,
      });
    } catch (error) {
      console.error("Export all failed:", error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting all leads. Please try again.",
        variant: "destructive",
      });
    }
  }, [total, leads, toast, searchQuery, statusFilter, stageFilter, visaCategoryFilter, countryFilter, leadOwnerFilter, fromDate, toDate, userRole, availableStages]);

  // Listen for export trigger from header
  useEffect(() => {
    const handleExportTrigger = () => {
      handleExportLeads();
    };

    window.addEventListener('triggerLeadsExport', handleExportTrigger);
    return () => {
      window.removeEventListener('triggerLeadsExport', handleExportTrigger);
    };
  }, [handleExportLeads]);

  // No local filtering if using server side data (implying external props are present)
  // But keeping it for hybrid or purely client side usage
  const filteredLeads = leads; // Server returns already filtered data usually if onFilterChange is passed.
  // Ideally we should trust passed 'leads' if 'total' is provided.

  const displayLeads = filteredLeads; // Alias for clarity

  const handleEmailClick = (e: React.MouseEvent, email: string) => {
    e.stopPropagation();
    window.open(`mailto:${email}`, "_blank");
  };

  const hasActiveFilters =
    statusFilter !== "all" ||
    stageFilter !== "all" ||
    visaCategoryFilter !== "all" ||
    countryFilter !== "all" ||
    leadOwnerFilter !== "all" ||
    fromDate !== undefined ||
    toDate !== undefined ||
    searchQuery !== "" ||
    Object.values(visibleColumns).some(v => v === false);

  const handleClearFilters = () => {
    handleStatusChange("all");
    handleStageChange("all");
    handleVisaCategoryChange("all");
    handleCountryChange("all");
    handleLeadOwnerChange("all");
    handleClearDateRange();
    handleSearchChange("");
    setVisibleColumns(DEFAULT_COLUMN_VISIBILITY);
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500 h-full w-full min-h-[400px]">
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-[2.5] blur-[120px] opacity-25 bg-primary/40 rounded-full" />
        <div className="relative bg-card border border-border/40 w-28 h-28 rounded-4xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
          <Inbox className="w-14 h-14 text-muted-foreground/20" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-primary border-[6px] border-card shadow-2xl rounded-2xl p-3 animate-bounce">
          <Search className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>
      <h3 className="text-3xl font-black text-foreground mb-3 tracking-tight text-center w-full">
        {hasActiveFilters ? "No Matching Leads" : "Start Your Lead Journey"}
      </h3>
      <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-sm leading-relaxed font-normal text-center px-6 w-full">
        {hasActiveFilters
          ? "We couldn't find any results for your current filter combination. Try adjusting your search or filters to broaden the scope."
          : "Your workspace is ready. You haven't added any leads yet. Start by creating one manually or uploading a list."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        {hasActiveFilters && (
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="h-12 px-8 rounded-2xl border-border/60 hover:bg-accent hover:text-accent-foreground shadow-sm transition-all gap-3 font-bold text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </Button>
        )}
        <div className="scale-110 origin-center">
          {headerAction}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 min-h-[calc(100vh-200px)] flex flex-col">
      {/* Header & Main Actions Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 h-10 bg-background/50 border-border focus:bg-background transition-all"
          />
        </div>
        <div className="flex items-center gap-2">{headerAction}</div>
      </div>

      {/* Structured Filter Bar */}
      <div className="bg-muted/40 p-3 rounded-xl border border-border/60 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </div>

          <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block shrink-0" />

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9 w-[130px] sm:w-[140px] lg:w-[150px] xl:w-[160px] bg-background border-border/50 text-xs hover:bg-accent/10 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Status" className="truncate" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stageFilter} onValueChange={handleStageChange}>
              <SelectTrigger className="h-9 w-[120px] sm:w-[130px] lg:w-[140px] xl:w-[150px] bg-background border-border/50 text-xs hover:bg-accent/10 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <Layers className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Stage" className="truncate" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {availableStages.map((stage) => (
                  <SelectItem key={stage.id} value={String(stage.id)}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={visaCategoryFilter}
              onValueChange={handleVisaCategoryChange}
            >
              <SelectTrigger className="h-9 w-[130px] sm:w-[140px] lg:w-[150px] xl:w-[160px] bg-background border-border/50 text-xs hover:bg-accent/10 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <CreditCard className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Category" className="truncate" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableVisaCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={handleCountryChange}>
              <SelectTrigger className="h-9 w-[130px] sm:w-[140px] lg:w-[150px] xl:w-[160px] bg-background border-border/50 text-xs hover:bg-accent/10 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-2 min-w-0 w-full">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <SelectValue placeholder="Country" className="truncate" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {availableCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Filter - Available for all roles */}
            <Popover open={isDatePickerOpen} onOpenChange={handleDatePickerOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 w-[160px] sm:w-[180px] lg:w-[190px] justify-start text-left font-normal bg-background border-border/50 text-xs hover:bg-accent/10 hover:border-accent/30 transition-colors",
                    (fromDate || toDate) && "text-foreground border-primary/30"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {fromDate && toDate ? (
                    <span className="truncate font-medium">
                      {format(fromDate, "dd MMM")} - {format(toDate, "dd MMM")}
                    </span>
                  ) : fromDate ? (
                    <span className="truncate font-medium">{format(fromDate, "dd MMM yyyy")}</span>
                  ) : (
                    <span className="text-muted-foreground truncate">Select Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">Filter by Date</span>
                    {(fromDate || toDate) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearDateRange}
                        className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Side-by-side calendars */}
                  <div className="flex gap-4">
                    {/* From Date Calendar */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground block">
                        From Date
                      </label>
                      <div className="date-picker-from [&_.rdp-day_today]:!bg-cyan-500/25 [&_.rdp-day_today]:!text-cyan-700 dark:[&_.rdp-day_today]:!bg-cyan-400/30 dark:[&_.rdp-day_today]:!text-cyan-200 [&_.rdp-day_today]:!font-bold [&_.rdp-day_today]:!border-2 [&_.rdp-day_today]:!border-cyan-500 dark:[&_.rdp-day_today]:!border-cyan-400 [&_.rdp-day_today]:!rounded-md [&_button[data-selected-single='true']]:!bg-blue-600 [&_button[data-selected-single='true']]:!text-white dark:[&_button[data-selected-single='true']]:!bg-blue-500 [&_button[data-selected-single='true']]:!font-bold [&_button[data-selected-single='true']]:!shadow-lg [&_button[data-selected-single='true']]:!ring-2 [&_button[data-selected-single='true']]:!ring-blue-400/50 dark:[&_button[data-selected-single='true']]:!ring-blue-300/50">
                        <Calendar
                          mode="single"
                          selected={tempFromDate}
                          onSelect={(date) => {
                            setTempFromDate(date || undefined);
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            return date > today || (tempToDate ? date > tempToDate : false);
                          }}
                          initialFocus
                          className="rounded-md border"
                        />
                      </div>
                    </div>

                    {/* To Date Calendar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-0">
                        <label className="text-xs font-medium text-muted-foreground">
                          To Date <span className="text-[10px] opacity-60">(Optional)</span>
                        </label>
                        {tempToDate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTempToDate(undefined)}
                            className="h-5 px-1.5 text-[10px]"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <div className={cn(
                        "date-picker-to [&_.rdp-day_today]:!bg-cyan-500/25 [&_.rdp-day_today]:!text-cyan-700 dark:[&_.rdp-day_today]:!bg-cyan-400/30 dark:[&_.rdp-day_today]:!text-cyan-200 [&_.rdp-day_today]:!font-bold [&_.rdp-day_today]:!border-2 [&_.rdp-day_today]:!border-cyan-500 dark:[&_.rdp-day_today]:!border-cyan-400 [&_.rdp-day_today]:!rounded-md [&_button[data-selected-single='true']]:!bg-emerald-600 [&_button[data-selected-single='true']]:!text-white dark:[&_button[data-selected-single='true']]:!bg-emerald-500 [&_button[data-selected-single='true']]:!font-bold [&_button[data-selected-single='true']]:!shadow-lg [&_button[data-selected-single='true']]:!ring-2 [&_button[data-selected-single='true']]:!ring-emerald-400/50 dark:[&_button[data-selected-single='true']]:!ring-emerald-300/50",
                        !tempFromDate && "opacity-50 pointer-events-none"
                      )}>
                        <Calendar
                          mode="single"
                          selected={tempToDate}
                          onSelect={(date) => {
                            setTempToDate(date || undefined);
                          }}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(23, 59, 59, 999);
                            if (!tempFromDate) return true; // Disable all if no fromDate
                            return date > today || date < tempFromDate;
                          }}
                          className="rounded-md border"
                        />
                      </div>
                      {tempFromDate && (
                        <p className="text-[10px] text-muted-foreground italic">
                          Leave empty for single date
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsDatePickerOpen(false);
                        setTempFromDate(undefined);
                        setTempToDate(undefined);
                      }}
                      className="h-8 px-3 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApplyDateFilter}
                      disabled={!canApplyDateFilter}
                      className="h-8 px-4 text-xs font-medium"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Lead Owner Filter - Only visible to Admin and Manager */}
            {canUseOwnerFilter && (
              <Select value={leadOwnerFilter} onValueChange={handleLeadOwnerChange}>
                <SelectTrigger className="h-9 w-[130px] sm:w-[140px] lg:w-[150px] xl:w-[160px] bg-background border-border/50 text-xs hover:bg-accent/10 hover:border-accent/30 transition-colors">
                  <div className="flex items-center gap-2 min-w-0 w-full">
                    <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <SelectValue placeholder="Owner" className="truncate" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {assignableUsers.map((u) => (
                    <SelectItem key={String(u.id)} value={String(u.id)}>
                      {u.fullname || u.name || String(u.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Column Visibility Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 bg-background border-border/50 text-xs font-medium hover:bg-accent/10"
                >
                  <ColumnsIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px] h-[350px] overflow-y-auto">
                <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Select All Option */}
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center justify-between px-2 py-1.5 focus:bg-muted/50">
                  <Label htmlFor="select-all-cols" className="cursor-pointer font-bold text-xs flex-1">Select All</Label>
                  <Switch
                    id="select-all-cols"
                    checked={Object.entries(COLUMN_LABELS).every(([key]) => {
                      if (!showOwner && (key === "leadOwner" || key === "assignedBy")) return true;
                      return visibleColumns[key];
                    })}
                    onCheckedChange={(checked) => {
                      const newVisibility = { ...visibleColumns };
                      Object.keys(COLUMN_LABELS).forEach((key) => {
                        if (!showOwner && (key === "leadOwner" || key === "assignedBy")) return;
                        newVisibility[key] = !!checked;
                      });
                      setVisibleColumns(newVisibility);
                    }}
                    className="scale-75 origin-right"
                  />
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {Object.entries(COLUMN_LABELS).map(([key, label]) => {
                  // Skip owner columns if showOwner is false
                  if (!showOwner && (key === "leadOwner" || key === "assignedBy")) return null;

                  return (
                    <DropdownMenuItem key={key} onSelect={(e) => e.preventDefault()} className="flex items-center justify-between px-2 py-1.5 focus:bg-muted/50">
                      <Label htmlFor={`col-${key}`} className="cursor-pointer text-xs font-normal flex-1">{label}</Label>
                      <Switch
                        id={`col-${key}`}
                        checked={visibleColumns[key]}
                        onCheckedChange={() => toggleColumn(key)}
                        className="scale-75 origin-right"
                      />
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-muted-foreground hover:text-foreground text-xs font-medium gap-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden flex-1 flex flex-col relative transition-all duration-300">
        <div className="overflow-x-auto overflow-y-auto flex-1 scroll-smooth">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/60 hover:bg-muted/30 h-[48px]">
                <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider w-[50px]">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected || isSomeSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all leads"
                      className={cn(
                        "cursor-pointer",
                        isSomeSelected && !isAllSelected && "data-[state=checked]:bg-primary/60"
                      )}
                    />
                  </div>
                </TableHead>
                {visibleColumns.leadDate && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[150px]">
                    Lead Date
                  </TableHead>
                )}
                {visibleColumns.fullname && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[150px]">
                    Lead Name
                  </TableHead>
                )}
                {visibleColumns.phone && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[130px]">
                    Phone
                  </TableHead>
                )}
                {visibleColumns.email && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[180px]">
                    Email
                  </TableHead>
                )}
                {visibleColumns.status && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[140px]">
                    Status
                  </TableHead>
                )}
                {visibleColumns.stage && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[100px]">
                    Stage
                  </TableHead>
                )}
                {visibleColumns.whatsapp && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[130px]">
                    WhatsApp
                  </TableHead>
                )}
                {showOwner && visibleColumns.leadOwner && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[130px]">
                    Lead Owner
                  </TableHead>
                )}
                {visibleColumns.bestTimeToCall && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[130px]">
                    Best Time to Call
                  </TableHead>
                )}
                {visibleColumns.source && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[100px]">
                    Source
                  </TableHead>
                )}
                {showOwner && visibleColumns.assignedBy && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[140px]">
                    Assigned By
                  </TableHead>
                )}
                {visibleColumns.visaCategory && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[130px]">
                    Visa Category
                  </TableHead>
                )}
                {visibleColumns.jobTitle && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[120px]">
                    Job Title
                  </TableHead>
                )}
                {visibleColumns.country && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[100px]">
                    Country
                  </TableHead>
                )}
                {visibleColumns.monthlyIncome && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider min-w-[120px]">
                    Monthly Income
                  </TableHead>
                )}
                {(canEdit || canDelete) && (
                  <TableHead className="font-bold text-foreground/70 py-3 px-4 text-[12px] uppercase tracking-wider text-right min-w-[100px]">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="h-[64px] border-b border-border/40 hover:bg-transparent">
                    <TableCell className="py-2 px-4"><Skeleton className="h-4 w-4" /></TableCell>
                    {visibleColumns.leadDate && <TableCell className="py-2 px-4"><Skeleton className="h-4 w-24" /></TableCell>}
                    {visibleColumns.fullname && <TableCell className="py-2 px-4"><Skeleton className="h-5 w-40" /></TableCell>}
                    {visibleColumns.phone && <TableCell className="py-2 px-4"><Skeleton className="h-4 w-32" /></TableCell>}
                    {visibleColumns.email && <TableCell className="py-2 px-4"><Skeleton className="h-4 w-48" /></TableCell>}
                    {visibleColumns.status && <TableCell className="py-2 px-4"><Skeleton className="h-6 w-28 rounded-full" /></TableCell>}
                    {visibleColumns.stage && <TableCell className="py-2 px-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>}
                    {visibleColumns.whatsapp && <TableCell className="py-2 px-4"><Skeleton className="h-4 w-32" /></TableCell>}
                    {showOwner && visibleColumns.leadOwner && (
                      <TableCell className="py-2 px-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-7 w-32 rounded-lg" />
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.bestTimeToCall && <TableCell className="py-2 px-4"><Skeleton className="h-4 w-24" /></TableCell>}
                    {visibleColumns.source && <TableCell className="py-2 px-4"><Skeleton className="h-4 w-24" /></TableCell>}
                    {showOwner && visibleColumns.assignedBy && (
                      <TableCell className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.visaCategory && <TableCell className="py-2 px-4"><Skeleton className="h-5 w-32 rounded-md" /></TableCell>}
                    {visibleColumns.jobTitle && <TableCell className="py-2 px-4"><Skeleton className="h-4 w-32" /></TableCell>}
                    {visibleColumns.country && <TableCell className="py-2 px-4"><Skeleton className="h-4 w-24" /></TableCell>}
                    {visibleColumns.monthlyIncome && <TableCell className="py-2 px-4"><Skeleton className="h-6 w-32 rounded-md" /></TableCell>}
                    {(canEdit || canDelete) && (
                      <TableCell className="py-2 px-4 text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                    )}
                  </TableRow>
                ))
              ) : displayLeads.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={
                      1 + // Checkbox
                      Object.entries(visibleColumns).filter(([key, isVisible]) => {
                        if (key === "leadOwner" || key === "assignedBy") return false; // Handle explicitly
                        return isVisible;
                      }).length +
                      (showOwner && visibleColumns.leadOwner ? 1 : 0) +
                      (showOwner && visibleColumns.assignedBy ? 1 : 0) +
                      (canEdit || canDelete ? 1 : 0)
                    }
                    className="p-0"
                  >
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                displayLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className={cn(
                      "lead-row h-[64px] cursor-pointer hover:bg-muted/40 transition-all border-b border-border/40 group active:scale-[0.998]",
                      selectedLeadIds.has(lead.id) && "bg-primary/5"
                    )}
                    onClick={() => finalOnViewLead && finalOnViewLead(lead)}
                  >
                    <TableCell className="py-2 px-4 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedLeadIds.has(lead.id)}
                        onCheckedChange={(checked) => handleSelectRow(Number(lead.id), checked as boolean)}
                        aria-label={`Select ${lead.fullname}`}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    {visibleColumns.leadDate && (
                      <TableCell className="py-2 px-4">
                        <span className="text-[13px] font-medium text-muted-foreground/80 tabular-nums">
                          {lead?.createdAt ? formatDateTime(lead.createdAt) : "-"}
                        </span>
                      </TableCell>
                    )}
                    {visibleColumns.fullname && (
                      <TableCell className="py-2 px-4">
                        <div className="font-bold text-foreground text-[14px] truncate max-w-[150px]" title={lead.fullname}>
                          {lead.fullname}
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.phone && (
                      <TableCell className="py-2 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-[13px] font-medium text-foreground/80 hover:text-primary transition-colors gap-1.5 max-w-[150px]"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onCallLead) onCallLead(lead);
                          }}
                          title={lead.phone}
                        >
                          <Phone className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                          <span className="truncate">{lead.phone}</span>
                        </Button>
                      </TableCell>
                    )}
                    {visibleColumns.email && (
                      <TableCell className="py-2 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-[13px] font-medium text-muted-foreground hover:text-primary transition-colors gap-1.5 max-w-[150px]"
                          onClick={(e) => handleEmailClick(e, lead.email)}
                          title={lead.email}
                        >
                          <Mail className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </Button>
                      </TableCell>
                    )}
                    {visibleColumns.status && (
                      <TableCell className="py-2 px-4">
                        <LeadStatusBadge status={lead.status as LeadStatus} className="h-6" />
                      </TableCell>
                    )}
                    {visibleColumns.stage && (
                      <TableCell className="py-2 px-4">
                        <LeadStageBadge
                          stage={
                            (lead.stage?.name.toLowerCase() as LeadStage) || "cold"
                          }
                          className="h-6"
                        />
                      </TableCell>
                    )}
                    {visibleColumns.whatsapp && (
                      <TableCell className="py-2 px-4">
                        {lead.whatsapp ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-[13px] font-medium text-success/80 hover:text-success transition-colors gap-1.5 max-w-[150px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onWhatsAppLead) onWhatsAppLead(lead);
                            }}
                            title={lead.whatsapp}
                          >
                            <MessageCircle className="w-3.5 h-3.5 opacity-60 flex-shrink-0" />
                            <span className="truncate">{lead.whatsapp}</span>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground/40">-</span>
                        )}
                      </TableCell>
                    )}
                    {showOwner && visibleColumns.leadOwner && (
                      <TableCell className="py-2 px-4">
                        <div className="flex items-center gap-3">
                          {(() => {
                            // When displaying "You", use current user's role for colors
                            // Otherwise, use the lead owner's role from userRoleMap
                            const roleForStyling = isPersonalRole ? userRole?.toLowerCase() : userRoleMap[lead.leadOwner?.toLowerCase() || ""];

                            // Get styles based on the determined role
                            const styles = (() => {
                              if (roleForStyling === "admin") return userRoleConfig.admin;
                              if (roleForStyling === "manager") return userRoleConfig.manager;
                              if (roleForStyling === "advisor") return userRoleConfig.advisor;
                              if (roleForStyling === "processing") return userRoleConfig.processing;
                              if (roleForStyling === "telecaller") return userRoleConfig.telecaller;
                              return userRoleConfig.telecaller; // default
                            })();

                            const OwnerIcon = styles.icon;
                            return (
                              <>
                                {!isPersonalRole && (
                                  <Avatar className={cn("h-8 w-8 border shadow-sm transition-transform group-hover:scale-105", styles.borderColor)}>
                                    <AvatarFallback className={cn("text-[10px] font-bold", styles.bgColor, styles.color)}>
                                      {getInitials(lead.leadOwner || "??")}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <Badge
                                  className={cn(
                                    "px-2.5 py-0.5 rounded-lg border flex items-center gap-1.5 whitespace-nowrap font-bold text-[11px] shadow-sm",
                                    styles.bgColor,
                                    styles.color,
                                    styles.borderColor
                                  )}
                                >
                                  <OwnerIcon className="w-3 h-3 opacity-70" />
                                  {isPersonalRole ? "You" : (lead.leadOwner || "Unassigned")}
                                </Badge>
                              </>
                            );
                          })()}
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.bestTimeToCall && (
                      <TableCell className="py-2 px-4">
                        {lead.formData?.['best_time_to_call_you?'] || lead.formData?.['Best Time to Call You?'] || lead.formData?.best_time_to_call ? (
                          <span
                            className="text-[13px] font-medium text-muted-foreground/80 block truncate max-w-[150px]"
                            title={lead.formData?.['best_time_to_call_you?'] || lead.formData?.['Best Time to Call You?'] || lead.formData?.best_time_to_call}
                          >
                            {lead.formData?.['best_time_to_call_you?'] || lead.formData?.['Best Time to Call You?'] || lead.formData?.best_time_to_call}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-[13px]">-</span>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.source && (
                      <TableCell className="py-2 px-4">
                        {lead.leadSource ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="font-medium text-[11px] text-muted-foreground w-fit">
                              {lead.leadSource}
                            </Badge>
                            {lead.leadSource === "Meta" && (lead.metaForm?.name || lead.leadSubsource) && (
                              <span className="text-[10px] text-muted-foreground/70 truncate max-w-[150px]" title={lead.metaForm?.name || lead.leadSubsource}>
                                {lead.metaForm?.name || lead.leadSubsource}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40 text-[13px]">-</span>
                        )}
                      </TableCell>
                    )}
                    {showOwner && visibleColumns.assignedBy && (
                      <TableCell className="py-2 px-4">
                        {lead.assignedBy ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-help group/assign">
                                <Avatar className="h-6 w-6 border border-border shadow-sm group-hover/assign:border-primary/40 transition-all">
                                  <AvatarFallback className="bg-muted text-[10px] font-bold text-muted-foreground group-hover/assign:text-primary transition-colors">
                                    {getInitials(lead.assignedBy)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[12px] font-medium text-muted-foreground group-hover/assign:text-foreground transition-colors">
                                  {lead.assignedBy}
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-popover border-border shadow-2xl p-2 rounded-lg">
                              <p className="text-[11px] font-bold">Assigned by {lead.assignedBy}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-black opacity-30 border-dashed px-2 h-5 tracking-widest">
                            DIRECT
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.visaCategory && (
                      <TableCell className="py-2 px-4">
                        {lead.visaCategory && lead.visaCategory !== "-" ? (
                          <Badge variant="secondary" className="font-medium truncate max-w-[150px] block" title={lead.visaCategory.replace(/_/g, " ")}>
                            {lead.visaCategory.replace(/_/g, " ")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/40 text-[13px]">-</span>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.jobTitle && (
                      <TableCell className="py-2 px-4">
                        {lead.jobTitle ? (
                          <span className="text-[13px] font-medium text-foreground/80 block truncate max-w-[150px]" title={lead.jobTitle}>{lead.jobTitle}</span>
                        ) : (
                          <span className="text-muted-foreground/40 text-[13px]">-</span>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.country && (
                      <TableCell className="py-2 px-4">
                        {lead.country && lead.country !== "-" ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-foreground/80 truncate max-w-[150px] block" title={lead.country}>{lead.country}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40 text-[13px]">-</span>
                        )}
                      </TableCell>
                    )}
                    {visibleColumns.monthlyIncome && (
                      <TableCell className="py-2 px-4">
                        {lead.monthlyIncome ? (
                          <span className="text-[13px] font-medium text-foreground/80 tabular-nums">
                            {typeof lead.monthlyIncome === 'number'
                              ? `AED ${lead.monthlyIncome.toLocaleString()}`
                              : lead.monthlyIncome}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-[13px]">-</span>
                        )}
                      </TableCell>
                    )}
                    {(canEdit || canDelete) && (
                      <TableCell className="py-2 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/80 rounded-full">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 p-1.5 shadow-2xl rounded-xl border-border/40">
                            <DropdownMenuItem
                              className="rounded-lg h-9 gap-2.5 px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEditLead) onEditLead(lead);
                              }}
                              disabled={!canEdit}
                            >
                              <Edit className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">Edit</span>
                            </DropdownMenuItem>
                            {canDelete && (
                              <>
                                <DropdownMenuSeparator className="my-1 opacity-50" />
                                <DropdownMenuItem
                                  className="rounded-lg h-9 gap-2.5 px-3 text-destructive focus:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onDeleteLead) onDeleteLead(lead);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="font-medium">Delete</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Floating Toolbar - Shown when leads are selected */}
      {selectedLeadIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="backdrop-blur-3xl bg-card border border-border/50 shadow-2xl rounded-2xl px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Selection Counter */}
              <div className="flex items-center gap-2 pr-3 border-r border-border/50">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 border border-primary/30">
                  <span className="text-xs font-bold text-primary tabular-nums">
                    {selectedLeadIds.size}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground/90 whitespace-nowrap">
                  {selectedLeadIds.size === 1 ? "lead" : "leads"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Assign Lead Button */}
                {canAssign && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const selectedLeads = leads.filter((l) =>
                        selectedLeadIds.has(Number(l.id))
                      );

                      if (selectedLeads.length === 0) {
                        toast({
                          title: "No Leads Selected",
                          description: "Please select at least one lead to assign.",
                          variant: "destructive",
                        });
                        return;
                      }

                      setLeadsToAssign(selectedLeads);
                      setIsAssignModalOpen(true);
                    }}
                    className="h-9 px-3 font-semibold shadow-sm transition-all hover:shadow-md gap-2 border-primary/30 hover:bg-primary/5 bg-background/50"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span className="text-xs">Assign</span>
                  </Button>
                )}

                {/* Export Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // Use existing export functionality but filter by selected IDs
                    const selectedLeads = leads.filter(lead => selectedLeadIds.has(Number(lead.id)));

                    if (selectedLeads.length === 0) {
                      toast({
                        title: "No Leads to Export",
                        description: "No leads selected for export.",
                        variant: "destructive",
                      });
                      return;
                    }

                    toast({
                      title: "Preparing Export",
                      description: `Exporting ${selectedLeads.length} selected lead${selectedLeads.length > 1 ? "s" : ""}...`,
                      duration: 2000,
                    });

                    try {
                      // Prepare export data
                      const exportData = selectedLeads.map((lead, index) => ({
                        "Sr. No.": index + 1,
                        "Lead ID": lead.id || "",
                        "Lead Date": lead.createdAt
                          ? formatDateTime(lead.createdAt)
                          : "",
                        "Full Name": lead.fullname || "",
                        "Phone Number": lead.phone || "",
                        "Email Address": lead.email || "",
                        "WhatsApp Number": lead.whatsapp || "",
                        Status: lead.status || "",
                        Stage: lead.stage?.name || "",
                        "Lead Owner": lead.leadOwner || "Unassigned",
                        "Assigned By": lead.assignedBy || "",
                        "Visa Category": lead.visaCategory ? lead.visaCategory.replace(/_/g, " ") : "",
                        "Job Title": lead.jobTitle || "",
                        Country: lead.country || "",
                        "Target Country": lead.targetCountry || "",
                        "Monthly Income (AED)": lead.monthlyIncome ? Number(lead.monthlyIncome).toLocaleString() : "",
                        "Lead Source": lead.leadSource || "",
                        "Lead Subsource": lead.leadSubsource || "",
                        "Best Time to Call": lead.formData?.['best_time_to_call_you?'] || lead.formData?.['Best Time to Call You?'] || lead.formData?.best_time_to_call || "",
                        "Created By": lead.createdBy || "",
                        "Created At": lead.createdAt
                          ? formatDateTime(lead.createdAt)
                          : "",
                        "Updated At": lead.updatedAt
                          ? formatDateTime(lead.updatedAt)
                          : "",
                        "Is Active": lead.isActive ? "Yes" : "No",
                      }));

                      const ws = XLSX.utils.json_to_sheet(exportData);

                      const columnWidths = [
                        { wch: 8 }, { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
                        { wch: 28 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 20 },
                        { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 18 },
                        { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 20 },
                        { wch: 20 }, { wch: 10 },
                      ];
                      ws["!cols"] = columnWidths;

                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Selected Leads");

                      const filename = `selected_leads_export_${format(new Date(), "yyyy-MM-dd_HHmmss")}.xlsx`;
                      XLSX.writeFile(wb, filename);

                      toast({
                        title: "Export Successful",
                        description: `${selectedLeads.length} lead${selectedLeads.length > 1 ? "s" : ""} exported successfully!`,
                      });

                      // Clear selection after successful export
                      setSelectedLeadIds(new Set());
                    } catch (error) {
                      console.error("Export failed:", error);
                      toast({
                        title: "Export Failed",
                        description: "An error occurred while exporting. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="h-9 px-3 font-semibold shadow-sm transition-all hover:shadow-md gap-2 border-border/60 bg-background/50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="text-xs">Export</span>
                </Button>

                {/* Delete Button - Only for Admin */}
                {canDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const selectedIds = Array.from(selectedLeadIds) as number[];

                      if (selectedIds.length === 0) {
                        toast({
                          title: "No Leads Selected",
                          description: "Please select at least one lead to delete.",
                          variant: "destructive",
                        });
                        return;
                      }

                      // Open confirmation dialog
                      setLeadsToDelete(selectedIds);
                      setIsDeleteConfirmOpen(true);
                    }}
                    className="h-9 px-3 font-semibold shadow-sm transition-all hover:shadow-md gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-xs">Delete</span>
                  </Button>
                )}
              </div>

              {/* Clear Selection */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLeadIds(new Set())}
                className="h-9 w-9 p-0 hover:bg-muted/50 ml-1 border-l border-border/50 rounded-l-none"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign (bulk) Modal */}
      <LeadAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setLeadsToAssign([]);
        }}
        leads={leadsToAssign}
        users={assignableUsers as any}
        onAssign={() => {
          // Not used from LeadsTable bulk selection.
        }}
        onAssignBulk={async (items, assignToUserId, shareActivityLogs, notes) => {
          await updateLeadAssignmentsBulkAction(
            items.map((it) => ({
              id: it.id,
              leadId: it.leadId,
              assignedTo: Number(assignToUserId),
              remarks: notes || "",
              canAccessPreviousLogs: Boolean(shareActivityLogs),
            }))
          );

          setSelectedLeadIds(new Set());
          setIsAssignModalOpen(false);
          setLeadsToAssign([]);

          toast({
            title: "Leads Assigned",
            description: `${items.length} lead${items.length > 1 ? "s" : ""} assigned successfully.`,
          });

          if (onAssignmentSuccess) onAssignmentSuccess();
        }}
      />

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t">
        {/* Left side - Results info and page size selector */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {total > 0 ? (page - 1) * pageSize + 1 : 0}
            </span>
            {" - "}
            <span className="font-medium text-foreground">
              {Math.min(page * pageSize, total || displayLeads.length)}
            </span>
            {" of "}
            <span className="font-medium text-foreground">
              {total || displayLeads.length}
            </span>{" "}
            leads
          </div>

          {onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Rows per page:
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  onPageSizeChange(Number(value));
                  // Reset to first page when changing page size
                  if (onPageChange) {
                    onPageChange(1);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[70px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {userRole?.toLowerCase() === "admin" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAllLeads}
              className="h-8 px-3 text-xs font-semibold gap-2 border-primary/30 hover:bg-primary/5"
            >
              <Download className="w-3.5 h-3.5" />
              Export All Leads
            </Button>
          )}
        </div>

        {/* Right side - Pagination controls */}
        {total > pageSize && onPageChange && (
          <div className="flex items-center gap-1">
            {/* First page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={page <= 1 || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {(() => {
                const totalPages = Math.ceil(total / pageSize);
                const maxVisiblePages = 5;
                const pages: number[] = [];

                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total pages is less than max
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Show pages with ellipsis logic
                  if (page <= 3) {
                    // Show first pages
                    for (let i = 1; i <= 4; i++) {
                      pages.push(i);
                    }
                    pages.push(-1); // Ellipsis
                    pages.push(totalPages);
                  } else if (page >= totalPages - 2) {
                    // Show last pages
                    pages.push(1);
                    pages.push(-1); // Ellipsis
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Show middle pages
                    pages.push(1);
                    pages.push(-1); // Ellipsis
                    for (let i = page - 1; i <= page + 1; i++) {
                      pages.push(i);
                    }
                    pages.push(-1); // Ellipsis
                    pages.push(totalPages);
                  }
                }

                return pages.map((pageNum, index) => {
                  if (pageNum === -1) {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-muted-foreground"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      disabled={isLoading}
                      className={cn(
                        "h-8 w-8 p-0",
                        page === pageNum &&
                        "bg-primary text-primary-foreground hover:bg-primary"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                });
              })()}
            </div>

            {/* Next page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= Math.ceil(total / pageSize) || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.ceil(total / pageSize))}
              disabled={page >= Math.ceil(total / pageSize) || isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog*/}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Selected Leads"
        description={`Are you sure you want to delete ${leadsToDelete.length} selected lead${leadsToDelete.length !== 1 ? "s" : ""}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
    </div>
  );
}
