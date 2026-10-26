"use client";

import { useState, useEffect, useCallback } from "react";
import { Lead } from "@/lib/types";
import {
  getLeadsAction,
  getUniqueCountriesAction,
  getUniqueVisaCategoriesAction,
  createLeadAction,
  updateLeadAction,
  deleteLeadAction,
  deleteMultipleLeadsAction,
  getAssignableUsersAction,
  getAllStages,
} from "./actions";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadsTable } from "@/components/leads-comps/LeadsTable";
import { LeadDetailModal } from "@/components/leads-comps/LeadDetailModal";
import { AddLeadModal } from "@/components/leads-comps/AddLeadModal";
import { EditLeadSheet } from "@/components/leads-comps/EditLeadSheet";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { AddCallLogModal } from "@/components/leads-comps/AddCallLogModal";
import { WhatsAppModal } from "@/components/leads-comps/WhatsAppModal";
import { AddReminderModal } from "@/components/reminders/add-reminder-modal";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function LeadList() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [visaCategoryFilter, setVisaCategoryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [leadOwnerFilter, setLeadOwnerFilter] = useState("all");
  const [fromDate, setFromDate] = useState<string | undefined>();
  const [toDate, setToDate] = useState<string | undefined>();

  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availableVisaCategories, setAvailableVisaCategories] = useState<
    string[]
  >([]);
  const [userRoleMap, setUserRoleMap] = useState<Record<string, string>>({});
  const [availableStages, setAvailableStages] = useState<Array<{ id: number; name: string }>>([]);

  const [isFiltersInitialized, setIsFiltersInitialized] = useState(false);

  // Load filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("leads-filters");
    if (saved) {
      try {
        const filters = JSON.parse(saved);
        if (filters.searchQuery !== undefined) setSearchQuery(filters.searchQuery);
        if (filters.statusFilter !== undefined) setStatusFilter(filters.statusFilter);
        if (filters.stageFilter !== undefined) setStageFilter(filters.stageFilter);
        if (filters.visaCategoryFilter !== undefined) setVisaCategoryFilter(filters.visaCategoryFilter);
        if (filters.countryFilter !== undefined) setCountryFilter(filters.countryFilter);
        if (filters.leadOwnerFilter !== undefined) setLeadOwnerFilter(filters.leadOwnerFilter);
        if (filters.fromDate !== undefined) setFromDate(filters.fromDate);
        if (filters.toDate !== undefined) setToDate(filters.toDate);
        if (filters.pageSize !== undefined) setPageSize(filters.pageSize);
      } catch (e) {
        // Silent fail for localStorage parsing
      }
    }
    setIsFiltersInitialized(true);
  }, []);

  // Save filters to localStorage
  useEffect(() => {
    if (!isFiltersInitialized) return;
    const filters = {
      searchQuery,
      statusFilter,
      stageFilter,
      visaCategoryFilter,
      countryFilter,
      leadOwnerFilter,
      fromDate,
      toDate,
      pageSize,
    };
    localStorage.setItem("leads-filters", JSON.stringify(filters));
  }, [searchQuery, statusFilter, stageFilter, visaCategoryFilter, countryFilter, leadOwnerFilter, fromDate, toDate, pageSize, isFiltersInitialized]);

  // Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleteFilteredOpen, setIsDeleteFilteredOpen] = useState(false);
  const [isCallLogOpen, setIsCallLogOpen] = useState(false);
  const [callLogsRefreshTrigger, setCallLogsRefreshTrigger] = useState(0);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const fetchLeads = useCallback(async () => {
    if (!isFiltersInitialized) return;
    setIsLoading(true);
    try {
      const filters: any = {
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        stageId: stageFilter !== "all" ? Number(stageFilter) : undefined,
        visaCategory:
          visaCategoryFilter !== "all" ? visaCategoryFilter : undefined,
        country: countryFilter !== "all" ? countryFilter : undefined,
        // Backend filter expects `assignedTo=<userId>`
        assignedTo: leadOwnerFilter !== "all" ? leadOwnerFilter : undefined,
      };

      // Handle date filtering based on API requirements
      if (fromDate && toDate) {
        // Date range: use fromDate and toDate parameters
        filters.fromDate = fromDate;
        filters.toDate = toDate;
      } else if (fromDate) {
        // Single date: use date parameter
        filters.date = fromDate;
      }

      const response = await getLeadsAction(page, pageSize, filters);
      if (response && response.data) {
        // Cast response data to Lead[] if necessary, or ensure types match
        setLeads(response.data as unknown as Lead[]);
        setTotalLeads(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch leads", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    pageSize,
    searchQuery,
    statusFilter,
    stageFilter,
    visaCategoryFilter,
    countryFilter,
    leadOwnerFilter,
    fromDate,
    toDate,
    isFiltersInitialized,
  ]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const [countriesRes, visaCatsRes, users, stagesRes] = await Promise.all([
        getUniqueCountriesAction(),
        getUniqueVisaCategoriesAction(),
        getAssignableUsersAction(),
        getAllStages(),
      ]);

      if (countriesRes?.success) {
        setAvailableCountries(countriesRes.data);
      }
      if (visaCatsRes?.success) {
        setAvailableVisaCategories(visaCatsRes.data);
      }
      // Create a mapping from user names to their roles
      const roleMap: Record<string, string> = {};
      (users || []).forEach((u: any) => {
        if (u.name && u.role) {
          roleMap[u.name.toLowerCase()] = u.role.toLowerCase();
        }
      });
      setUserRoleMap(roleMap);
      // Set available stages
      if (stagesRes?.success && Array.isArray(stagesRes.data)) {
        setAvailableStages(stagesRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch filter options", error);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditOpen(true);
  };

  const handleDeleteLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLead?.id) {
      toast({
        title: "Error",
        description: "No lead selected for deletion.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await deleteLeadAction(String(selectedLead.id));

      // If we reach here, it means makeAuthenticatedRequest didn't throw
      toast({
        title: "Lead Deleted",
        description: `${selectedLead.fullname} has been removed successfully.`,
      });
      setIsDeleteOpen(false);
      fetchLeads();
    } catch (error: any) {
      console.error("Failed to delete lead:", error);
      toast({
        title: "Delete Failed",
        description:
          error.message || "An error occurred while deleting the lead.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFiltered = () => {
    setIsDeleteFilteredOpen(true);
  };

  const handleConfirmDeleteFiltered = async () => {
    if (leads.length === 0) return;

    try {
      const idsToDelete = leads.map((l) => String(l.id));

      const response = await deleteMultipleLeadsAction(idsToDelete);

      if (response && response.success) {
        toast({
          title: "Leads Deleted",
          description: `Successfully removed ${response.count} leads from the list.`,
        });
        setIsDeleteFilteredOpen(false);
        fetchLeads();
      }
    } catch (error: any) {
      console.error("Failed to delete filtered leads:", error);
      toast({
        title: "Bulk Delete Failed",
        description:
          error.message || "An error occurred while deleting multiple leads.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLead = async (leadId: string, leadData: any) => {
    try {
      const response = await updateLeadAction(leadId, leadData);
      if (response && (response as any).success !== false) {
        toast({
          title: "Lead Updated",
          description: "The lead information has been updated successfully.",
        });
        fetchLeads();
      } else {
        throw new Error((response as any)?.message || "Failed to update lead");
      }
    } catch (error: any) {
      console.error("Error in handleUpdateLead:", error);
      toast({
        title: "Update Failed",
        description:
          error.message || "An error occurred while updating the lead.",
        variant: "destructive",
      });
    }
  };

  const handleAssignLead = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleAddLead = async (leadData: any) => {
    try {
      const response = await createLeadAction(leadData);
      if (response && response.success) {
        toast({
          title: "Success",
          description: "Lead added successfully",
        });
        // Refresh list after add
        fetchLeads();
        return true;
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to add lead",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error in handleAddLead:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const canDelete = user?.role === "admin" || user?.role === "manager";
  const canAssign =
    user?.role === "admin" ||
    user?.role === "manager" ||
    user?.role === "telecaller" ||
    user?.role === "advisor" ||
    user?.role === "processing";
  const canAddLeads = user?.role === "admin" || user?.role === "manager" || user?.role === "telecaller" || user?.role === "advisor" ;
  const canEdit = user?.role === "admin" || user?.role === "manager" || user?.role === "telecaller" || user?.role === "advisor" || user?.role === "processing";//added can edit leads for telecaller and advisor


  return (
    <>
      <LeadsTable
        leads={leads}
        page={page}
        pageSize={pageSize}
        total={totalLeads}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        stageFilter={stageFilter}
        visaCategoryFilter={visaCategoryFilter}
        countryFilter={countryFilter}
        leadOwnerFilter={leadOwnerFilter}
        fromDate={fromDate}
        toDate={toDate}
        availableCountries={availableCountries}
        availableVisaCategories={availableVisaCategories}
        availableStages={availableStages}
        onSearchChange={setSearchQuery}
        onFilterChange={(type, value) => {
          if (type === "status") setStatusFilter(value);
          if (type === "stage") setStageFilter(value);
          if (type === "visaCategory") setVisaCategoryFilter(value);
          if (type === "country") setCountryFilter(value);
          if (type === "leadOwner") setLeadOwnerFilter(value);
          setPage(1);
        }}
        onDateRangeChange={(from, to) => {
          setFromDate(from);
          setToDate(to);
          setPage(1);
        }}
        isLoading={isLoading}
        onViewLead={handleViewLead}
        onView={handleViewLead}
        onEditLead={handleEditLead}
        onDeleteLead={handleDeleteLead}
        onDeleteFiltered={handleDeleteFiltered}
        onAssignLead={handleAssignLead}
        canDelete={canDelete}
        canAssign={canAssign}
        canEdit={canEdit}
        userRole={user?.role}
        userRoleMap={userRoleMap}
        totalLeads={totalLeads}
        onAssignmentSuccess={fetchLeads}
        onExport={async () => {
          // Export handler will be managed in LeadsTable
        }}
        headerAction={
          <div className="flex flex-wrap items-center gap-2">
            {/* Add New Lead Button - Only for Admin & Manager */}
            {canAddLeads && (
              <Button
                onClick={() => setIsAddOpen(true)}
                className="h-10 px-4 font-semibold shadow-sm transition-all hover:shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">Add New Lead</span>
                <span className="lg:hidden">Add Lead</span>
              </Button>
            )}
          </div>
        }
      />

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onLogCall={() => {
            setIsCallLogOpen(true);
          }}
          onAddReminder={() => {
            setIsDetailOpen(false);
            setIsReminderOpen(true);
          }}
          onUploadDocument={() => {
            setIsDetailOpen(false);
          }}
          onAssignLead={() => {
            setIsDetailOpen(false);
          }}
          onStatusChange={() => fetchLeads()}
          onAssignSuccess={() => fetchLeads()}
          canAssign={canAssign}
          refreshCallLogsTrigger={callLogsRefreshTrigger}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={() => {
            setIsDetailOpen(false);
            setIsEditOpen(true);
          }}
          onDelete={() => {
            setIsDetailOpen(false);
            setIsDeleteOpen(true);
          }}
        />
      )}

      <AddLeadModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddLead}
        onUploaded={fetchLeads}
      />
      <EditLeadSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        lead={selectedLead}
        onUpdate={handleUpdateLead}
      />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Lead"
        description={`Are you sure you want to delete ${selectedLead?.fullname}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        variant="destructive"
      />
      <ConfirmDialog
        open={isDeleteFilteredOpen}
        onOpenChange={setIsDeleteFilteredOpen}
        title="Delete Filtered Leads"
        description={`Are you sure you want to delete all ${totalLeads} leads currently in the filtered list? This action cannot be undone.`}
        confirmText="Delete All"
        onConfirm={handleConfirmDeleteFiltered}
        variant="destructive"
      />
      <AddCallLogModal
        isOpen={isCallLogOpen}
        onClose={() => setIsCallLogOpen(false)}
        lead={selectedLead as any}
        onSuccess={() => setCallLogsRefreshTrigger((n) => n + 1)}
      />
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        lead={selectedLead as any}
        onSuccess={() => {
          setIsWhatsAppOpen(false);
          fetchLeads();
        }}
      />
      <AddReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        lead={selectedLead as any}
        onSuccess={() => {
          setIsReminderOpen(false);
          fetchLeads();
        }}
      />
      {/* <DocumentUploadModal
        isOpen={isDocumentOpen}
        onClose={() => setIsDocumentOpen(false)}
        lead={selectedLead as any}
        onUpload={handleUploadDocument}
      /> */}
      {/* <LeadAssignmentModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        lead={selectedLead as any}
        users={mockUsers}
        currentUserId={user?.id || ""}
        onAssign={handleAssignSubmit}
      /> */}
    </>
  );
}