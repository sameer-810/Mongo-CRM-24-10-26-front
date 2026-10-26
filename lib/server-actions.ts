"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-config";
import { redirect } from "next/navigation";
import {
  CreateLeadType,
  CreateLeadResponseType,
  GetFollowupsResponseType,
  CreateCallType,
  GetDocumentsByLeadIdResponseType,
  GetProcessingLeadsResponseType,
  GetLeadFullDetailsByIdResponseType,
  AddReminderDataType,
  GetRemindersByUserIdResponseType,
  ReminderStatus,
  LeadReminderItem,
  SetRemindersStatusResponseType,
  GetProcessingDashboardStatsResponseType,
  GetAdminAndManagerDashboardStatsResponseType,
  AdvisorDashboardData,
} from "@/lib/types";
import { STANDARD_LEAD_FIELDS } from "@/lib/mock-data";

// Generic function to make authenticated API calls
async function makeAuthenticatedRequest(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = true
) {
  const session = await getServerSession(authOptions);

  if (requireAuth && !session) {
    redirect("/login");
  }

  const accessToken = session?.accessToken;

  const apiBase = process.env.BACKEND_API_URL;
  const isFormDataBody =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const requestHeaders = new Headers();

  if (!isFormDataBody) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (process.env.BACKEND_API_SECRET) {
    requestHeaders.set("X-API-Secret", process.env.BACKEND_API_SECRET);
  }

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        requestHeaders.set(key, value);
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        requestHeaders.set(key, value);
      });
    } else {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value !== "undefined") {
          requestHeaders.set(key, value as string);
        }
      });
    }
  }

  console.log(`[API Request] ${options.method || "GET"} ${endpoint}`);

  const response = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    headers: requestHeaders,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`[API Error] ${response.status} ${endpoint}:`, errorData);
    throw new Error(
      errorData.message || `API request failed: ${response.status}`
    );
  }

  // Handle empty responses (like 204 No Content)
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null; // Return null for non-JSON responses
  }

  return await response.json();
}

// Server Actions for different API endpoints

// User Management
export async function getAssignableUsers() {
  const res = await makeAuthenticatedRequest("/api/admin/users/assignable");
  return Array.isArray(res) ? res : res?.data ?? [];
}

export async function getAllUsers() {
  const res = await makeAuthenticatedRequest("/api/admin/users", {
    method: "GET",
  });

  // Normalize backend response { success, message, data: [...] } -> array of users
  const payload = Array.isArray(res) ? res : res?.data ?? [];

  return (payload as any[]).map((u) => ({
    id: String(u.id ?? u._id ?? ""),
    name: u.fullname ?? u.name ?? "",
    username: u.username,
    email: u.email ?? "",
    phone: u.phone ?? null,
    roleId: u.roleId ?? null,
    role: {
      id: u.role?.id ?? u.roleId ?? "",
      name: (u.role?.name ?? u.role ?? "").toString(),
    },
    isActive: Boolean(u.isActive ?? true),
    createdBy: u.createdBy ?? null,
    createdAt: u.createdAt ?? null,
    updatedAt: u.updatedAt ?? null,
  }));
}

export async function getUserById(id: string) {
  return makeAuthenticatedRequest(`/users/${id}`);
}

export async function createUser(userData: {
  name: string;
  email: string;
  role: string;
  password: string;
}) {
  return makeAuthenticatedRequest("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function updateUser(userData: {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
}) {
  return makeAuthenticatedRequest(`/api/admin/users/${userData.id}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
}

export async function updateUserPassword(id: string, password: string) {
  return makeAuthenticatedRequest(`/api/admin/users/${id}/password`, {
    method: "PUT",
    body: JSON.stringify({ password }),
  });
}

export async function deleteUser(id: string) {
  return makeAuthenticatedRequest(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}

// Leads Management
export async function getLeads(
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
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (filters?.assignedTo && filters.assignedTo !== "all") {
    params.append("assignedTo", String(filters.assignedTo));
  }
  if (filters?.stageId) {
    params.append("stageId", filters.stageId.toString());
  }
  if (filters?.status && filters.status !== "all") {
    params.append("status", filters.status);
  }
  if (filters?.search?.trim()) {
    params.append("search", filters.search.trim());
  }
  if (filters?.visaCategory && filters.visaCategory !== "all") {
    params.append("visaCategory", filters.visaCategory);
  }
  if (filters?.country && filters.country !== "all") {
    params.append("country", filters.country);
  }

  // Date filtering: single date or date range
  if (filters?.date) {
    params.append("date", filters.date);
  } else if (filters?.fromDate && filters?.toDate) {
    params.append("fromDate", filters.fromDate);
    params.append("toDate", filters.toDate);
  }

  if (filters?.exportAll) {
    params.append("export", "true");
  }

  const res = await makeAuthenticatedRequest(`/api/leads?${params.toString()}`);

  return res;
}

export async function getUniqueCountries() {
  return makeAuthenticatedRequest("/api/leads/countries");
}

export async function getUniqueVisaCategories() {
  return makeAuthenticatedRequest("/api/leads/visa-categories");
}

export async function getLeadsByUserId(
  userId: string,
  page: number = 1,
  limit: number = 10,
  filters?: {
    stageId?: number;
    status?: string;
    search?: string;
    visaCategory?: string;
    country?: string;
    date?: string;
    fromDate?: string;
    toDate?: string;
  }
) {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (filters?.stageId) {
    params.append("stageId", filters.stageId.toString());
  }
  if (filters?.status && filters.status !== "all") {
    params.append("status", filters.status);
  }
  if (filters?.search?.trim()) {
    params.append("search", filters.search.trim());
  }
  if (filters?.visaCategory && filters.visaCategory !== "all") {
    params.append("visaCategory", filters.visaCategory);
  }
  if (filters?.country && filters.country !== "all") {
    params.append("country", filters.country);
  }

  // Date filtering: single date or date range
  if (filters?.date) {
    params.append("date", filters.date);
  } else if (filters?.fromDate && filters?.toDate) {
    params.append("fromDate", filters.fromDate);
    params.append("toDate", filters.toDate);
  }

  const res = await makeAuthenticatedRequest(
    `/api/leads/user/${userId}?${params.toString()}`
  );
  return res;
}

export async function createLead(leadData: CreateLeadType) {
  // Wrap the lead data in a formData object
  // const payload = {
  //   leadData,
  // };
  // console.log("leadData", JSON.stringify(payload));

  return makeAuthenticatedRequest("/api/leads", {
    method: "POST",
    body: JSON.stringify(leadData),
  }) as Promise<CreateLeadResponseType>;
}

export async function updateLead(
  id: string,
  leadData: any
) {
  // Build the request body according to API spec
  const requestBody: any = {};

  // Fields that are real database columns (allow from standard boxes)
  const standardFields = STANDARD_LEAD_FIELDS;

  // Populate request body from the incoming leadData
  Object.keys(leadData).forEach((key) => {
    if (standardFields.includes(key)) {
      // Top level fields
      if (key === "assignedTo" && leadData[key] !== "") {
        requestBody[key] = parseInt(leadData[key], 10);
      } else {
        requestBody[key] = leadData[key];
      }
    } else if (key === "formData") {
      // Dynamic fields
      requestBody.formData = leadData.formData;
    }
  });

  return makeAuthenticatedRequest(`/api/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify(requestBody),
  });
}

export async function deleteLead(id: string) {
  return makeAuthenticatedRequest(`/api/leads/${id}`, {
    method: "DELETE",
  });
}

export async function bulkUploadLeads(formData: FormData) {
  return makeAuthenticatedRequest("/api/leads/bulk-import", {
    method: "POST",
    body: formData,
  });
}

export async function getRestDetailsByLeadId(id: string) {
  const response = (await makeAuthenticatedRequest(
    `/api/leads/${id}`
  )) as Promise<GetLeadFullDetailsByIdResponseType>;
  return response;
}

// Meetings Management - TEMPORARILY DISABLED
// export async function getMeetings() {
//   return makeAuthenticatedRequest("/meetings");
// }

// export async function getMeetingById(id: string) {
//   return makeAuthenticatedRequest(`/meetings/${id}`);
// }

// export async function createMeeting(meetingData: {
//   title: string;
//   description?: string;
//   startTime: string;
//   endTime: string;
//   leadId?: string;
//   userId?: string;
//   location?: string;
//   type: string;
// }) {
//   return makeAuthenticatedRequest("/meetings", {
//     method: "POST",
//     body: JSON.stringify(meetingData),
//   });
// }

// export async function updateMeeting(
//   id: string,
//   meetingData: Partial<{
//     title: string;
//     description: string;
//     startTime: string;
//     endTime: string;
//     leadId: string;
//     userId: string;
//     location: string;
//     type: string;
//     type: string;
//   }>
// ) {
//   return makeAuthenticatedRequest(`/meetings/${id}`, {
//     method: "PUT",
//     body: JSON.stringify(meetingData),
//   });
// }

// export async function deleteMeeting(id: string) {
//   return makeAuthenticatedRequest(`/meetings/${id}`, {
//     method: "DELETE",
//   });
// }

// Calls Management
export async function getCalls() {
  return makeAuthenticatedRequest("/api/lead-attempts/dashboard", {
    method: "GET",
  });
}

export async function getCallById(id: string) {
  return makeAuthenticatedRequest(`/api/lead-attempts/lead/${id}`);
}

export async function getFollowups() {
  return makeAuthenticatedRequest(
    "/api/followups"
  ) as Promise<GetFollowupsResponseType>;
}

export async function createCall(callData: CreateCallType) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  return makeAuthenticatedRequest("/api/lead-attempts", {
    method: "POST",
    body: JSON.stringify({ ...callData, userId }),
  });
}

export async function updateCall(
  id: string,
  callData: Partial<{
    followTypeId: number;
    remarks: string;
  }>
) {
  return makeAuthenticatedRequest(`/api/lead-attempts/${id}`, {
    method: "PUT",
    body: JSON.stringify(callData),
  });
}

export async function deleteCall(id: string) {
  return makeAuthenticatedRequest(`/api/lead-attempts/${id}`, {
    method: "DELETE",
  });
}

// Reports
export async function getReports() {
  return makeAuthenticatedRequest("/reports");
}

export async function getReportById(id: string) {
  return makeAuthenticatedRequest(`/reports/${id}`);
}

export async function generateReport(reportData: {
  type: string;
  startDate: string;
  endDate: string;
  filters?: Record<string, any>;
}) {
  return makeAuthenticatedRequest("/reports/generate", {
    method: "POST",
    body: JSON.stringify(reportData),
  });
}

// Dashboard Data
export async function getDashboardData() {
  return makeAuthenticatedRequest("/dashboard");
}

export async function getTelecallerDashboard(userId: string) {
  return makeAuthenticatedRequest(`/api/dashboard/telecaller/${userId}`);
}

export async function getAdvisorDashboard(userId: string) {
  return makeAuthenticatedRequest(
    `/api/dashboard/advisor/${userId}`
  ) as Promise<AdvisorDashboardData>;
}

// Stages Management
export async function getStages() {
  return makeAuthenticatedRequest("/api/stages");
}

export async function getStageById(id: string) {
  return makeAuthenticatedRequest(`/stages/${id}`);
}

export async function createStage(stageData: {
  name: string;
  description?: string;
  order: number;
  color?: string;
}) {
  return makeAuthenticatedRequest("/stages", {
    method: "POST",
    body: JSON.stringify(stageData),
  });
}

export async function updateStage(
  id: string,
  stageData: Partial<{
    name: string;
    description: string;
    order: number;
    color: string;
  }>
) {
  return makeAuthenticatedRequest(`/stages/${id}`, {
    method: "PUT",
    body: JSON.stringify(stageData),
  });
}

export async function deleteStage(id: string) {
  return makeAuthenticatedRequest(`/stages/${id}`, {
    method: "DELETE",
  });
}

// Roles Management
export async function getAllRoles() {
  const res = await makeAuthenticatedRequest("/api/roles", {
    method: "GET",
  });

  // Normalize backend response { success, message, data: [...] } -> array of roles
  const payload = Array.isArray(res) ? res : res?.data ?? [];

  return (payload as any[]).map((r) => ({
    id: r.id ?? 0,
    name: r.name ?? "",
    isActive: Boolean(r.isActive ?? true),
    createdBy: r.createdBy ?? null,
    createdAt: r.createdAt ?? null,
    updatedAt: r.updatedAt ?? null,
    users: r.users ?? [],
  }));
}

export async function getLeadIds(search?: string) {
  return makeAuthenticatedRequest(`/api/leads/search?leadId=${search}`);
}

// Utility function to check user permissions
export async function checkUserPermission(permission: string) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return false;
  }

  // You can implement role-based permission checking here
  // For now, we'll return true for authenticated users
  // In a real implementation, you'd check against user roles/permissions
  return true;
}

export async function getProcessingLeadsByUserId(
  page: number = 1,
  limit: number = 10,
  filters?: {
    stageId?: number;
    status?: string;
    search?: string;
  }
) {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  if (filters?.stageId) {
    params.append("stageId", filters.stageId.toString());
  }
  if (filters?.status && filters.status !== "all") {
    params.append("status", filters.status);
  }
  if (filters?.search?.trim()) {
    params.append("search", filters.search.trim());
  }

  const res = await makeAuthenticatedRequest(
    `/api/leads/payment-received?${params.toString()}`
  );
  return res as Promise<GetProcessingLeadsResponseType>;
}

// Documents Management
export async function uploadDocument(formData: FormData) {
  return makeAuthenticatedRequest("/api/documents/upload", {
    method: "POST",
    body: formData,
  });
}
 /**
 * Request a short-lived pre-signed S3 PUT URL from the backend.
 * The browser then uploads the file directly to S3 (bypasses Amplify 6 MB limit).
 */
export async function getDocumentPresignedUrl(
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; s3Key: string; publicUrl: string }> {
  return makeAuthenticatedRequest("/api/documents/presigned-url", {
    method: "POST",
    body: JSON.stringify({ fileName, contentType }),
  }) as any;
}

/**
 * After the browser has uploaded the file directly to S3,
 * call this to save the document metadata in the database.
 */
export async function registerDocumentFromS3(data: {
  s3Key: string;
  leadId: string;
  documentLabel?: string;
  expiryDate?: string;
}) {
  return makeAuthenticatedRequest("/api/documents/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * After the browser has uploaded a replacement file directly to S3,
 * call this to update metadata in the database.
 */
export async function updateDocumentFromS3(
  id: string,
  data: { s3Key?: string; expiryDate?: string }
) {
  return makeAuthenticatedRequest(`/api/documents/${id}/register`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}


export async function getDocumentsByLeadId(leadId: string) {
  return makeAuthenticatedRequest(
    `/api/documents/lead/${leadId}`
  ) as Promise<GetDocumentsByLeadIdResponseType>;
}

export async function updateDocument(id: string, formData: FormData) {
  return makeAuthenticatedRequest(`/api/documents/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export async function deleteDocument(id: string) {
  return makeAuthenticatedRequest(`/api/documents/${id}`, {
    method: "DELETE",
  });
}

export async function updateLeadNotes(id: string, notes: string[]) {
  return makeAuthenticatedRequest(`/api/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify({ notes: notes }),
  });
}

export async function createNote(leadId: number, text: string) {
  const session = await getServerSession(authOptions);
  const userFullName = session?.user?.name || "Unknown User";

  return makeAuthenticatedRequest(`/api/notes`, {
    method: "POST",
    body: JSON.stringify({
      leadId,
      text,
      createdBy: userFullName,
    }),
  });
}

export async function addReminder(reminderData: AddReminderDataType) {
  return makeAuthenticatedRequest(`/api/lead-reminders`, {
    method: "POST",
    body: JSON.stringify(reminderData),
  });
}

export type LeadAssignmentDataType = {
  id?: number;
  leadId: number;
  assignedTo: number;
  assignedBy: number;
  remarks: string;
  canAccessPreviousLogs: boolean;
};

export async function assignLead(data: LeadAssignmentDataType) {
  // Use the upsert endpoint which handles both creating new assignments
  // and updating existing ones based on leadId, avoiding issues with stale assignment IDs
  const upsertPayload = {
    leadId: data.leadId,
    assignedTo: data.assignedTo,
    assignedBy: data.assignedBy,
    remarks: data.remarks,
    canAccessPreviousLogs: data.canAccessPreviousLogs,
  };

  return makeAuthenticatedRequest("/api/lead-assignments/upsert", {
    method: "POST",
    body: JSON.stringify(upsertPayload),
  });
}

// ---------------------------------------------------------------------------
// Lead assignment updates (single or bulk) - per API docs:
// PUT /api/lead-assignments/:id  (single object)
// PUT /api/lead-assignments/bulk (bulk array)
// ---------------------------------------------------------------------------

export type UpdateLeadAssignmentPayload = {
  assignedTo: number;
  remarks?: string;
  canAccessPreviousLogs?: boolean;
};

export type BulkUpdateLeadAssignmentItem = {
  id?: number;
  leadId: number;
  assignedTo: number;
  remarks?: string;
  // Not in the bulk example in docs, but some backends may support it.
  // We'll keep it optional so callers can choose to include it.
  canAccessPreviousLogs?: boolean;
};

export async function updateLeadAssignment(
  assignmentId: string | number,
  payload: UpdateLeadAssignmentPayload
) {
  return makeAuthenticatedRequest(`/api/lead-assignments/${assignmentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateLeadAssignmentsBulk(
  items: BulkUpdateLeadAssignmentItem[]
) {
  return makeAuthenticatedRequest(`/api/lead-assignments/bulk`, {
    method: "PUT",
    body: JSON.stringify(items),
  });
}

// Auth - Password Reset (Public endpoints, no auth required)
export async function forgotPassword(email: string) {
  return makeAuthenticatedRequest(
    "/api/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    false
  );
}

export async function resetPassword(token: string, newPassword: string) {
  return makeAuthenticatedRequest(
    "/api/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    },
    false
  );
}

export async function getRemindersByUserId(userId: string) {
  return makeAuthenticatedRequest(`/api/lead-reminders/user/${userId}`, {
    method: "GET",
  }) as Promise<GetRemindersByUserIdResponseType>;
}

export async function setRemindersStatus(id: string, status: ReminderStatus) {
  return makeAuthenticatedRequest(`/api/lead-reminders/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  }) as Promise<SetRemindersStatusResponseType | null>;
}

// get the documents that are goint expire in 7 days
export async function getExpiryDocuments(searchText?: string) {
  const params = new URLSearchParams();
  if (searchText) {
    params.append("searchText", searchText);
  }
  return makeAuthenticatedRequest(
    `/api/documents/expiring?${params.toString()}`,
    {
      method: "GET",
    }
  ) as Promise<GetDocumentsByLeadIdResponseType>;
}


// get processing dashboard data
export async function getProcessingDashboardData(userId: number) {
  return makeAuthenticatedRequest(`/api/dashboard/processing/${userId}`, {
    method: "GET",
  }) as Promise<GetProcessingDashboardStatsResponseType>;
}

// get admin and manager dashboard data
export async function getAdminAndManagerDashboardData() {
  return makeAuthenticatedRequest("/api/dashboard/admin", {
    method: "GET",
  }) as Promise<GetAdminAndManagerDashboardStatsResponseType>;
}

// ===== Agreement =====

/** List all available agreement templates from S3 */
export async function getAgreementTemplates() {
  return makeAuthenticatedRequest(`/api/agreement/templates`, {
    method: "GET",
  });
}

/** Fetch all placeholder variable names from the docx template */
export async function getAgreementPlaceholders(templateName?: string) {
  const query = templateName ? `?template=${encodeURIComponent(templateName)}` : "";
  return makeAuthenticatedRequest(`/api/agreement/placeholders${query}`, {
    method: "GET",
  });
}

/**
 * Generate a filled .docx agreement document.
 * Returns an ArrayBuffer (binary) that can be turned into a Blob on the client.
 */
export async function generateAgreementDocument(
  data: Record<string, string>,
  templateName?: string
): Promise<ArrayBuffer> {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const apiBase = process.env.BACKEND_API_URL;
  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (process.env.BACKEND_API_SECRET) {
    requestHeaders["X-API-Secret"] = process.env.BACKEND_API_SECRET;
  }
  if (session.accessToken) {
    requestHeaders["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const response = await fetch(`${apiBase}/api/agreement/generate`, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({ data, templateName }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to generate agreement document");
  }

  return response.arrayBuffer();
}