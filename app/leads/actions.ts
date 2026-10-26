"use server";

import {
  createLead,
  getLeads,
  getStages,
  bulkUploadLeads,
  getAssignableUsers,
  updateLead,
  deleteLead,
  getRestDetailsByLeadId,
  getUniqueCountries,
  getUniqueVisaCategories,
  updateLeadNotes,
  createCall,
  addReminder,
  createNote,
  assignLead,
  updateLeadAssignment,
  updateLeadAssignmentsBulk,
  LeadAssignmentDataType,
  type UpdateLeadAssignmentPayload,
  type BulkUpdateLeadAssignmentItem,
} from "@/lib/server-actions";
import {
  AddReminderDataType,
  CreateCallType,
  CreateLeadType,
  LeadStatus,
} from "@/lib/types";
import { COUNTRIES, VISA_CATEGORY_LABELS, STANDARD_LEAD_FIELDS, SYSTEM_FIELDS } from "@/lib/mock-data";
import { getField, formatStatusForCSS, isStandardKey } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-config";
import { getLeadsByUserId as getLeadsByUserIdAction } from "@/lib/server-actions";

export async function getAssignableUsersAction() {
  const result = await getAssignableUsers();

  // Normalize role if it's an object to match User interface expectations
  return (result || []).map((u: any) => ({
    id: String(u.id),
    name: u.fullname || u.name,
    role: typeof u.role === 'object' ? u.role.name : u.role,
    email: u.email || "",
    avatar: u.avatar || null,
  }));
}

export async function createLeadAction(values: CreateLeadType) {
  try {
    // Delegate to shared server action that already injects auth headers
    const result = await createLead({
      ...values,
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in createLeadAction:", error);
    return {
      success: false,
      message: error.message || "Failed to create lead"
    };
  }
}

export async function updateLeadAction(id: string, data: any) {
  const payload: any = {};
  const dynamicFields: Record<string, any> = {};

  // Separate standard fields from dynamic fields
  Object.entries(data).forEach(([key, value]) => {
    if (STANDARD_LEAD_FIELDS.includes(key)) {
      // Top-level standard database column
      payload[key] = value;
    } else if (key !== "formData") {
      // Unknown field, move to dynamic section
      dynamicFields[key] = value;
    }
  });

  // If the incoming data already had a formData object (e.g. from the state), merge it
  if (data.formData) {
    Object.assign(dynamicFields, data.formData);
  }

  // CLEANUP: Remove any standard fields from the dynamic section to prevent priority conflicts
  Object.keys(dynamicFields).forEach((key) => {
    if (SYSTEM_FIELDS.includes(key.toLowerCase())) return;

    if (isStandardKey(key, STANDARD_LEAD_FIELDS)) {
      delete dynamicFields[key];
      return;
    }
  });

  // If we have dynamic fields, package them into payload.formData
  if (Object.keys(dynamicFields).length > 0) {
    payload.formData = dynamicFields;
  } else {
    // If dynamic fields is empty, we should explicitly clear it in the DB
    payload.formData = {};
  }

  try {
    const result = await updateLead(id, payload);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in updateLeadAction:", error);
    return {
      success: false,
      message: error.message || "Failed to update lead",
    };
  }
}

export async function getAllStages() {
  return getStages();
}

export async function getLeadsAction(
  page: number = 1,
  limit: number = 10,
  filters?: {
    stageId?: number;
    status?: string;
    search?: string;
    visaCategory?: string;
    country?: string;
    assignedTo?: string;
    date?: string;
    fromDate?: string;
    toDate?: string;
    exportAll?: boolean;
  }
) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role?.toLowerCase();
  const userId = session?.user?.id;

  const rolesUsingPersonalLeads = ["advisor", "telecaller", "processing"];

  let response;
  if (userId && rolesUsingPersonalLeads.includes(userRole || "")) {
    // assignedTo filtering must ONLY apply to global `getLeads` (not personal leads endpoint)
    const { assignedTo: _assignedTo, ...restFilters } = filters || {};
    response = await getLeadsByUserIdAction(userId, page, limit, restFilters);
  } else {
    response = await getLeads(page, limit, filters);
  }

  // If response is not in expected format, return as-is
  if (!response) {
    return response;
  }

  // Map API response to Lead type format
  const formattedData = {
    ...response,
    data: ((response as any).data || []).map((apiLead: any) => {
      const formData = apiLead.formData || {};

      return {
        id: apiLead.id,

        fullname:
          apiLead.fullname ||
          getField(["Lead Name", "Name", "fullname"], formData),

        email:
          getField(["Email"], formData, "") ||
          apiLead.email,

        phone:
          getField(["Phone"], formData, "") ||
          apiLead.phone,

        whatsapp:
          getField(["WhatApp Number", "WhatsApp", "whatsapp", "whatsappNumber"], formData, undefined) ||
          apiLead.whatsapp,

        leadDate:
          getField(["Lead Date"], formData, undefined) ||
          apiLead.leadDate,

        leadSource:
          getField(["Source", "Lead Source", "leadSource"], formData, undefined) ||
          apiLead.leadSource,

        leadSubsource:
          getField(
            ["Lead Subsource", "Subsource", "leadSubsource"],
            formData,
            undefined
          ) ||
          apiLead.leadSubsource,

        monthlyIncome:
          getField(["Monthly Income", "monthlyIncome"], formData, undefined) ??
          apiLead.monthlyIncome,

        jobTitle:
          getField(["Job Title", "Current Position", "jobTitle"], formData, undefined) ||
          apiLead.jobTitle ||
          "-",

        visaCategory:
          getField(["Visa Category", "visaCategory"], formData, undefined) ||
          apiLead.visaCategory,

        country:
          getField(["Country", "country"], formData, undefined) ||
          apiLead.country,

        targetCountry:
          getField(["Target Country", "targetCountry"], formData, undefined) ||
          apiLead.targetCountry,

        formData: formData,

        stageId: apiLead.stageId,
        stage: apiLead.stage,

        status: (getField(["Status"], formData, "") || apiLead.status || LeadStatus.NEW) as LeadStatus,

        leadOwner:
          getField(["Lead Owner"], formData, undefined) ||
          apiLead.leadOwner,

        assignedTo:
          getField(["Assigned To"], formData, undefined) ||
          apiLead.assignedTo?.toString() ||
          apiLead.assignments?.[0]?.assignedToUser?.fullname ||
          undefined,

        assignedBy:
          getField(["Assigned By"], formData, undefined) ||
          apiLead.assignedBy?.toString() ||
          apiLead.assignments?.[0]?.assignedByUser?.fullname ||
          undefined,

        isActive: apiLead.isActive ?? true,

        createdBy: apiLead.createdBy,
        createdAt: apiLead.createdAt,
        updatedAt: apiLead.updatedAt,

        // Optional fields
        reminders: apiLead.reminders || [],
        documents: apiLead.documents || [],
        callAttempts: apiLead.callAttempts || 0,
        maxCallAttempts: apiLead.maxCallAttempts || 10,
        whatsappSent: apiLead.whatsappSent || false,
        whatsappReplied: apiLead.whatsappReplied || false,
        selectedDocumentCheckList: apiLead.selectedDocumentCheckList || "",
        metaForm: apiLead.metaForm || null,
      };
    }),
    // Preserve pagination if it exists
    pagination: (response as any).pagination || {
      page,
      limit,
      total: (response as any).data?.length || 0,
      totalPages: Math.ceil(((response as any).data?.length || 0) / limit),
    },
  };

  return formattedData;
}

export async function getUniqueCountriesAction() {
  return getUniqueCountries();
}

export async function getUniqueVisaCategoriesAction() {
  return getUniqueVisaCategories();
}

export async function bulkUploadLeadsAction(formData: FormData) {
  return bulkUploadLeads(formData);
}

export async function deleteLeadAction(id: string) {
  return deleteLead(id);
}

export async function deleteMultipleLeadsAction(ids: string[]) {
  // Since there's no bulk delete endpoint, we delete each one sequentially
  const results = [];
  for (const id of ids) {
    try {
      const result = await deleteLead(id);
      results.push({ id, success: true, result });
    } catch (error) {
      results.push({ id, success: false, error });
    }
  }
  const failedCount = results.filter(r => !r.success).length;
  if (failedCount > 0) {
    throw new Error(`Failed to delete ${failedCount} leads.`);
  }
  return { success: true, count: results.length };
}

export async function getRestDetailsByLeadIdAction(id: string) {
  const response = await getRestDetailsByLeadId(id);
  // If response is not in expected format, return as-is
  if (!response || !(response as any).success || !(response as any).data) {
    return response;
  }

  const apiLead = (response as any).data;
  const formData = apiLead.formData || {};

  // Handle email field conflict: API may return email as string or array
  // LeadDetailData type expects email as array, but we also need email string for display
  const emailString =
    typeof apiLead.email === "string"
      ? apiLead.email
      : getField(["Email"], formData, "");
  // API returns emails (plural) as array of email attempts
  const emailArray = Array.isArray(apiLead.emails)
    ? apiLead.emails
    : Array.isArray(apiLead.email)
      ? apiLead.email
      : apiLead.emailLogs || [];

  // Map API response to LeadDetailData type format
  const formattedLead: any = {
    id: apiLead.id,
    fullname:
      getField(["Lead Name", "Name", "fullname"], formData) || apiLead.fullname,
    // For LeadDetailData type, email is an array of email attempts
    // But we also preserve emailString for display purposes
    email: emailArray,
    emailString: emailString, // Preserve email string for UI display
    phone: apiLead.phone || getField(["Phone"], formData, ""),
    whatsapp:
      getField(["WhatApp Number", "WhatsApp", "whatsapp", "whatsappNumber"], formData, undefined) ||
      apiLead.whatsapp,
    leadDate: apiLead.leadDate || getField(["Lead Date"], formData, undefined),
    leadSource:
      apiLead.leadSource ||
      getField(["Source", "Lead Source"], formData, undefined),
    leadSubsource:
      apiLead.leadSubsource ||
      getField(["Lead Subsource", "Subsource"], formData, undefined),
    monthlyIncome:
      apiLead.monthlyIncome !== undefined
        ? apiLead.monthlyIncome
        : getField(["Monthly Income"], formData, undefined),
    jobTitle:
      apiLead.jobTitle ||
      getField(["Job Title", "Current Position"], formData, undefined),
    visaCategory:
      apiLead.visaCategory || getField(["Visa Category"], formData, undefined),
    country: apiLead.country || getField(["Country"], formData, undefined),
    targetCountry:
      apiLead.targetCountry ||
      getField(["Target Country"], formData, undefined),
    formData: formData,
    stageId: apiLead.stageId,
    stage: apiLead.stage,
    status: (apiLead.status || getField(["Status"], formData, "") || LeadStatus.NEW) as LeadStatus,
    // Derive leadOwner from backend field, explicit field, or first assignment's user
    leadOwner:
      apiLead.leadOwner ||
      getField(["Lead Owner"], formData, undefined) ||
      apiLead.assignments?.[0]?.assignedToUser?.fullname,
    assignedTo:
      apiLead.assignedTo?.toString() ||
      apiLead.assignments?.[0]?.assignedToUser?.fullname ||
      undefined,
    assignedBy:
      apiLead.assignedBy?.toString() ||
      apiLead.assignments?.[0]?.assignedByUser?.fullname ||
      undefined,
    isActive: apiLead.isActive ?? true,
    createdBy: apiLead.createdBy,
    createdAt: apiLead.createdAt,
    updatedAt: apiLead.updatedAt,
    // LeadDetailData specific fields
    // Note: LeadDetailData.email is LeadEmailItem[] (array), not string
    // We set email as array to match the type, and emailString for display
    calls: apiLead.calls || [],
    whatsApp: apiLead.whatsApp || [],
    attempts: apiLead.attempts || [],
    reminders: apiLead.reminders || [],
    documents: apiLead.documents || [],
    assignmentHistory: apiLead.histories || apiLead.assignmentHistory || [],
    // Optional legacy fields
    notes: apiLead.notes || [],
    callLogs: apiLead.calls || [],
    callAttempts: apiLead.callAttempts || 0,
    maxCallAttempts: apiLead.maxCallAttempts || 10,
    whatsappSent: apiLead.whatsappSent || false,
    whatsappReplied: apiLead.whatsappReplied || false,
    selectedDocumentCheckList: apiLead.selectedDocumentCheckList || "",
    // Email logs for UI compatibility (LeadDetailModal expects this)
    emails: emailArray,
    emailLogs: emailArray,
  };

  return {
    ...response,
    data: formattedLead,
  };
}

export async function updateLeadNotesAction(id: string, notes: string[]) {
  const response = await updateLeadNotes(id, notes);
  return response;
}

export async function createCallAction(data: CreateCallType) {
  return createCall(data);
}

export async function addReminderAction(data: AddReminderDataType) {
  const response = await addReminder(data);
  return response;
}

export async function createNoteAction(leadId: number, text: string) {
  const response = await createNote(leadId, text);
  return response;
}

export async function assignLeadAction(data: LeadAssignmentDataType) {
  const response = await assignLead(data);
  return response;
}

export async function updateLeadAssignmentAction(
  assignmentId: string | number,
  payload: UpdateLeadAssignmentPayload
) {
  return updateLeadAssignment(assignmentId, payload);
}

export async function updateLeadAssignmentsBulkAction(
  items: BulkUpdateLeadAssignmentItem[]
) {
  return updateLeadAssignmentsBulk(items);
}

// ===== Agreement =====
export async function getAgreementTemplatesAction() {
  const { getAgreementTemplates } = await import("@/lib/server-actions");
  return getAgreementTemplates();
}

export async function getAgreementPlaceholdersAction(templateName?: string) {
  const { getAgreementPlaceholders } = await import("@/lib/server-actions");
  return getAgreementPlaceholders(templateName);
}

export async function generateAgreementDocumentAction(
  data: Record<string, string>,
  templateName?: string
): Promise<number[]> {
  const { generateAgreementDocument } = await import("@/lib/server-actions");
  const arrayBuffer = await generateAgreementDocument(data, templateName);
  // Convert ArrayBuffer to a plain number array so it can cross the server-action boundary
  return Array.from(new Uint8Array(arrayBuffer));
}