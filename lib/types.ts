import { LeadStatus } from "./enum";

export { LeadStatus };

export type LeadStage = "cold" | "hot" | "dead";

export interface Reminder {
  leadId: number;
  userId: number;
  title: string;
  reminderDateTime: Date;
  description: string;
  status: string;
  type: string;
}

export interface Lead {
  id: number;
  fullname: string;
  email: string;
  phone: string;
  whatsapp?: string;
  leadDate?: string;
  leadSource?: string;
  leadSubsource?: string;
  monthlyIncome?: number | string;
  jobTitle?: string;
  visaCategory?: string;
  country?: string;
  targetCountry?: string;
  formData?: Record<string, any>;
  stageId?: number;
  stage?: {
    id: number;
    name: string;
  };
  metaForm?: {
    name: string;
    formId: string;
    createdAt?: string;
  };
  status: string;
  leadOwner?: string;
  assignedTo?: string; // Kept in type as it might be used elsewhere, but marked optional/string to match API
  assignedBy?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string; // API returns string date
  updatedAt?: string; // API returns string date

  // UI helper props or keeping for compatibility temporarily if needed,
  // but strictly following API for main fields.
  // Optional legacy fields that might be used in other components (checking mock-data usage):
  notes?: string[];
  callLogs?: CallLog[];
  reminders?: Reminder[];
  documents?: Document[];
  assignmentHistory?: any[]; // Placeholder if needed

  // Mapped/Derived fields can be handled in component or extended here if we add frontend logic
  callAttempts?: number; // Not in API, maybe derived?
  maxCallAttempts?: number; // Not in API
  whatsappSent?: boolean;
  whatsappReplied?: boolean;
  nextFollowUp?: string | Date;
  priority?: number; // UI-only field for sorting
  lastContactedAt?: Date; // UI-only field for tracking
  selectedDocumentCheckList?: string;
}

/* export interface Note {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
} */

export interface CallLog {
  id: string;
  leadId: string;
  timestamp: Date;
  duration?: number;
  outcome: "answered" | "not-answered" | "voicemail" | "busy";
  notes?: string;
  userId: string;
}

export interface Meeting {
  id: string;
  leadId: string;
  title: string;
  scheduledAt: Date;
  duration: number;
  type: "initial" | "follow-up" | "closing";
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  advisorId: string;
  notes?: string;
  outcome?: string;
}

export type UserRole =
  | "admin"
  | "manager"
  | "advisor"
  | "telecaller"
  | "processing";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Role {
  id: number;
  name: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  users?: any[];
}
// agreement placeholder with optional section label
export interface AgreementPlaceholder {
  name: string;
  section?: string;
}
export interface UsersResponse {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  roleId?: number;
  role: {
    id: number | string;
    name: UserRole;
  };
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// -------------------- New Types --------------------
export type CreateLeadType = {
  fullname: string;
  email: string;
  phone: string;
  whatsapp?: string;
  leadDate?: string;
  leadSource?: string;
  leadSubsource?: string;
  monthlyIncome?: number;
  jobTitle?: string;
  country?: string;
  targetCountry?: string;
  visaCategory?: string;
  leadOwner?: string;
  companyName?: string;
  status?: string | number; // String status or stageId
  assignedTo?: number;
  assignedBy?: number;
  // Dynamic fields
  applying_for?: string;
  city?: string;
  currentPosition?: string;
  adName?: string;
  bankBalance?: number;
  workPermit?: boolean;
  notes?: string[];
};

export type CreateLeadResponseType = {
  success: boolean;
  message: string;
  data: {
    id: number;
    fullname: string;
    email: string;
    phone: string;
    applying_for: string;
    city: string;
    currentPosition: string;
    leadDate: string;
    adName: string;
    monthlyIncome: number;
    bankBalance: number;
    workPermit: true;
    companyName: string;
    jobTitle: string;
    status: number;
    stage: {
      id: number;
      name: string;
    };
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type StageType = {
  id: number;
  name: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  leads: any[];
};

export type GetAllStagesResponseType = {
  success: boolean;
  message: string;
  data: StageType[];
};

export type PaginationType = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetProcessingLeadsResponseType = {
  success: boolean;
  message: string;
  data: Lead[];
  pagination: PaginationType;
};

export type AssignableUser = {
  id: number;
  fullname: string;
  role: {
    id: number;
    name: string;
  };
};

export type AssignableUsersResponse = {
  success: boolean;
  message: string;
  data: AssignableUser[];
};

export type BulkUploadErrorItem = {
  row?: number;
  message: string;
};

export type BulkUploadResponseType = {
  success: boolean;
  message: string;
  data?: {
    total?: number;
    processed?: number;
    success?: number;
    failed?: number;
    skipped?: number;
    duplicates?: number;
    errors?: BulkUploadErrorItem[];
  };
};

export type CallStatistics = {
  total: number;
  answered: number;
  notAnswered: number;
};

export type DashboardCallItem = {
  id: number;
  leadId: number;
  followTypeId: number;
  remarks: string;
  outcome: string;
  callTime: string;
  duration: number;
  scheduledTime: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lead: {
    id: number;
    formData: Record<string, any>;
    stageId: number | null;
    status: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
  followUpTypes: {
    id: number;
    name: string;
  }[];
  followType: {
    id: number;
    name: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type CallDashboardResponse = {
  success: boolean;
  message: string;
  count: number;
  callStatistics: CallStatistics;
  data: DashboardCallItem[];
};

export type FollowType = "Call" | "WhatsApp" | "Email";

export type CreateCallType = {
  leadId: string;
  userId?: string;
  duration?: number;
  outcome: string;
  remarks?: string;
  callTime: string;
  followType: FollowType;
  scheduledTime?: string;
};

export type FollowupMethodType = {
  id: number;
  name: string;
  icon: React.ReactNode;
};

export type FollowupType = {
  id: number;
  name: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  leadAttempts: [];
};

export type GetFollowupsResponseType = {
  success: boolean;
  message: string;
  data: FollowupType[];
  count: number;
};

export type LeadDocumentItem = {
  id: number;
  documentLabel: string;
  expiryDate: string;
  url: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
};

// Lead Detail API Response Types
export type LeadAttemptItem = {
  id: number;
  remarks: string;
  outcome: string;
  callTime: string;
  duration: number;
  scheduledTime: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  followTypeId: number;
  followType: {
    id: number;
    name: string;
  };
};

export type LeadCallItem = {
  id: number;
  remarks: string;
  outcome: string;
  callTime: string;
  duration: number;
  scheduledTime: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  followType: {
    id: number;
    name: string;
  };
};

export type LeadWhatsAppItem = {
  id: number;
  remarks: string;
  outcome: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  followTypeId: number;
  followType: {
    id: number;
    name: string;
  };
};

export type LeadEmailItem = {
  id: number;
  remarks: string;
  outcome: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  followTypeId: number;
  followType: {
    id: number;
    name: string;
  };
};

export type AssignmentHistoryItem = {
  id: number;
  leadId: number;
  assignedTo: number;
  assignedToUser: {
    id: number;
    fullname: string;
    isPasswordChanged: boolean;
    username: string;
    password: string;
    email: string;
    phone: string | null;
    roleId: number;
    isActive: boolean;
    createdBy: string;
    resetPasswordToken: string | null;
    resetPasswordExpires: string | null;
    createdAt: string;
    updatedAt: string;
  };
  assignedBy: number;
  assignedByUser: {
    id: number;
    fullname: string;
    isPasswordChanged: boolean;
    username: string;
    password: string;
    email: string;
    phone: string | null;
    roleId: number;
    isActive: boolean;
    createdBy: string;
    resetPasswordToken: string | null;
    resetPasswordExpires: string | null;
    createdAt: string;
    updatedAt: string;
  };
  remarks: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadAssignment = {
  id: number;
  assignedTo: number;
  assignedToUser: {
    id: number;
    fullname: string;
    username: string;
  };
  assignedBy: number;
  assignedByUser: {
    id: number;
    fullname: string;
    username: string;
  };
  remarks: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadHistory = {
  id: number;
  assignedTo: number;
  assignedToUser: {
    id: number;
    fullname: string;
    username: string;
  };
  assignedBy: number;
  assignedByUser: {
    id: number;
    fullname: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type LeadReminderItem = {
  id: number;
  leadId: number;
  userId: number;
  title: string;
  description: string;
  reminderDateTime: string;
  status: string;
  type: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadDetailData = Lead & {
  calls: LeadCallItem[];
  whatsApp: LeadWhatsAppItem[];
  emails: LeadEmailItem[];
  attempts: LeadAttemptItem[];
  reminders: LeadReminderItem[];
  documents: LeadDocumentItem[];
  assignmentHistory: AssignmentHistoryItem[];
  emailString?: string;
  emailLogs?: LeadEmailItem[];
};

export type GetLeadFullDetailsByIdResponseType = {
  success: boolean;
  message: string;
  data: LeadDetailData;
};

export type AddReminderDataType = {
  leadId: number;
  userId: number;
  title: string;
  reminderDateTime: string;
  description: string;
  status: string;
};

export type GetRemindersByUserIdResponseType = {
  success: boolean;
  message: string;
  data: LeadReminderItem[];
  count: number;
};

export type SetRemindersStatusResponseType = {
  success: boolean;
  message: string;
  data: {
    id: number;
    status: ReminderStatus;
  };
};

export enum ReminderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  DISMISSED = "dismissed",
}

export type ExpiryDocumentWithLead = {
  id: number;
  url: string;
  documentLabel: string;
  expiryDate: string;
  leadId: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  lead: Lead;
};

export type GetDocumentsByLeadIdResponseType = {
  success: boolean;
  message: string;
  data: ExpiryDocumentWithLead[];
  count: number;
};

export type GetProcessingDashboardStatsResponseType = {
  success: boolean;
  message: string;
  data: {
    totalLeads: number;
    pendingLeads: number;
    expiredLeads: number;
    uploadedDocuments: number;
    expiryAlerts: {
      leadName: string;
      documentType: string;
      expiryDate: string;
      daysLeft: number;
    }[];
  };
};

export type GetAdminAndManagerDashboardStatsResponseType = {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalClients: {
        value: number;
        growth: string,
        label: string
      },
      activity: {
        value: number,
        growth: string,
        label: string
      },
      meetings: {
        value: number,
        growth: string,
        label: string
      },
      conversion: {
        value: number,
        growth: string,
        label: string
      }
    },
    performanceChart: { month: string, total: number, converted: number }[];
    pipelineChart: { label: string, count: number, color: string }[];
  };
};
export type AdvisorDashboardData = {
  activeOpportunities: number;
  totalAssignedLeadsToday: number;
  pendingAgreements: number;
  closeRate: string;
  pipelineStages: {
    stageName: string;
    count: number;
    color: string;
  }[];
  todayAssignedLeads: {
    id: number;
    name: string;
    phone: string;
    email: string;
    status: string;
    stage: string;
    assignedAt: string;
  }[];
  interactionVolume: {
    call: number;
    whatsapp: number;
    email: number;
  };
  recentActivities: {
    type: "call" | "reminder" | "whatsapp" | "email";
    title: string;
    leadName: string;
    time: string;
    timeAgo: string;
    description: string;
  }[];
};
