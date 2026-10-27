import { LeadStatus, LeadStage, Meeting } from "@/lib/types";

export type UserRole =
  | "admin"
  | "manager"
  | "telecaller"
  | "advisor"
  | "processing"
  | "super_admin";

export type CallStatus =
  | "connected"
  | "not_connected"
  | "busy"
  | "callback"
  | "interested"
  | "not_interested";

export type WhatsAppStatus = "sent" | "delivered" | "read" | "failed";

export type DocumentStatus = "pending" | "collected";

export type VisaCategory =
  | "uk_innovator_founder_visa"
  | "uk_global_business_mobility"
  | "canadian_startup_visa_business"
  | "portugal_d2_immigration"
  | "portugal_d7_immigration"
  | "portugal_d8_immigration"
  | "portugal_golden_visa"
  | "spain_entrepreneur_visa"
  | "saint_lucia_passport_citizenship"
  | "vanuatu_citizenship_by_investment"
  | "saint_kitts_and_nevis_citizenship_by_investment"
  | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface LeadAssignment {
  id: string;
  leadId: string;
  assignedById: string;
  assignedByName: string;
  assignedToId: string;
  assignedToName: string;
  assignedAt: Date;
  sharedActivityLogs: boolean;
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: LeadStatus;
  stage: LeadStage;
  // Extended fields from user's requirements
  jobTitle?: string;
  currentPosition?: string;
  whatsapp?: string;
  leadDate: Date;
  ownerId: string;
  ownerName: string;
  // Assignment tracking
  assignedById?: string;
  assignedByName?: string;
  assignedToId?: string;
  assignedToName?: string;
  assignmentHistory: LeadAssignment[];
  source: string;
  subsource?: string;
  monthlyIncome?: number;
  // Visa/Immigration specific fields
  visaCategory?: VisaCategory;
  country?: string;
  targetCountry?: string;
  passportNumber?: string;
  passportExpiry?: Date;
  // Activity tracking
  notes: Note[];
  callLogs: CallLog[];
  whatsappLogs: WhatsAppLog[];
  reminders: Reminder[];
  documents: Document[];
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
}

export interface Note {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface CallLog {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  status: CallStatus;
  duration?: number;
  remarks?: string;
  createdAt: Date;
}

export interface WhatsAppLog {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  message: string;
  status: WhatsAppStatus;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  leadId: string;
  userId: string;
  userName: string;
  title: string;
  description?: string;
  dateTime: Date;
  reminderType: "call" | "meeting" | "follow_up" | "document" | "other";
  isCompleted: boolean;
  createdAt: Date;
}

export interface Document {
  id: string;
  leadId: string;
  name: string;
  type: string;
  category: DocumentCategory;
  url: string;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: Date;
  country?: string;
}

export type DocumentCategory =
  | "passport"
  | "photo"
  | "education"
  | "experience"
  | "financial"
  | "medical"
  | "police_clearance"
  | "language_test"
  | "visa_application"
  | "travel"
  | "other";

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  hotLeads: number;
  coldLeads: number;
  deadLeads: number;
  pendingFollowUps: number;
  meetingsScheduled: number;
  meetingsDone: number;
  paymentsCollected: number;
  pendingDocuments: number;
  completedCases: number;
}

// Status to Stage mapping based on the flow
export const STATUS_STAGE_MAP: Record<LeadStatus, LeadStage> = {
  [LeadStatus.NEW]: "cold",
  [LeadStatus.NOT_ANSWERED]: "cold",
  [LeadStatus.BUSY]: "cold",
  [LeadStatus.ANSWERED]: "hot",
  [LeadStatus.FOLLOW_UP]: "hot",
  [LeadStatus.MEETING_SCHEDULED]: "hot",
  [LeadStatus.MEETING_DONE]: "hot",
  [LeadStatus.AGREEMENT_PENDING]: "hot",
  [LeadStatus.AGREEMENT_DONE]: "hot",
  [LeadStatus.PAYMENT_PENDING]: "hot",
  [LeadStatus.PAYMENT_DONE]: "hot",
  [LeadStatus.DOCUMENTATION]: "hot",
  [LeadStatus.COMPLETED]: "hot",
  [LeadStatus.NOT_INTERESTED]: "dead",
  [LeadStatus.NOT_ELIGIBLE]: "dead",
  [LeadStatus.NO_SHOW]: "hot",
  [LeadStatus.WRONG_NUMBER]: "dead",
  [LeadStatus.APPOINTMENT_BOOKED]: "hot",
  [LeadStatus.VISA_GRANTED]: "hot",
  [LeadStatus.NIF_DONE]: "hot",
  [LeadStatus.INCORPORATION_DONE]: "hot",
  [LeadStatus.DECISION_PENDING]: "hot",
  [LeadStatus.ENDORSEMENT_GRANTED]: "hot",
  [LeadStatus.VISA_REJECTED]: "cold",
  [LeadStatus.REFUNDED]: "dead",
};

// Status to Role mapping
export const STATUS_ROLE_MAP: Record<LeadStatus, UserRole> = {
  [LeadStatus.NEW]: "telecaller",
  [LeadStatus.NOT_ANSWERED]: "telecaller",
  [LeadStatus.BUSY]: "telecaller",
  [LeadStatus.ANSWERED]: "telecaller",
  [LeadStatus.FOLLOW_UP]: "telecaller",
  [LeadStatus.MEETING_SCHEDULED]: "advisor",
  [LeadStatus.MEETING_DONE]: "advisor",
  [LeadStatus.AGREEMENT_PENDING]: "advisor",
  [LeadStatus.AGREEMENT_DONE]: "advisor",
  [LeadStatus.PAYMENT_PENDING]: "advisor",
  [LeadStatus.PAYMENT_DONE]: "advisor",
  [LeadStatus.DOCUMENTATION]: "processing",
  [LeadStatus.COMPLETED]: "processing",
  [LeadStatus.NOT_INTERESTED]: "telecaller",
  [LeadStatus.NOT_ELIGIBLE]: "telecaller",
  [LeadStatus.NO_SHOW]: "advisor",
  [LeadStatus.WRONG_NUMBER]: "telecaller",
  [LeadStatus.APPOINTMENT_BOOKED]: "telecaller",
  [LeadStatus.VISA_GRANTED]: "processing",
  [LeadStatus.NIF_DONE]: "processing",
  [LeadStatus.INCORPORATION_DONE]: "processing",
  [LeadStatus.DECISION_PENDING]: "processing",
  [LeadStatus.ENDORSEMENT_GRANTED]: "processing",
  [LeadStatus.VISA_REJECTED]: "processing",
  [LeadStatus.REFUNDED]: "processing",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: "New",
  [LeadStatus.NOT_ANSWERED]: "Not Answered",
  [LeadStatus.BUSY]: "Busy",
  [LeadStatus.ANSWERED]: "Answered",
  [LeadStatus.FOLLOW_UP]: "Follow Up",
  [LeadStatus.MEETING_SCHEDULED]: "Meeting Scheduled",
  [LeadStatus.MEETING_DONE]: "Meeting Done",
  [LeadStatus.AGREEMENT_PENDING]: "Agreement Pending",
  [LeadStatus.AGREEMENT_DONE]: "Agreement Done",
  [LeadStatus.PAYMENT_PENDING]: "Payment Pending",
  [LeadStatus.PAYMENT_DONE]: "Payment Done",
  [LeadStatus.DOCUMENTATION]: "Documentation",
  [LeadStatus.COMPLETED]: "Completed",
  [LeadStatus.NOT_INTERESTED]: "Not Interested",
  [LeadStatus.NOT_ELIGIBLE]: "Not Eligible",
  [LeadStatus.NO_SHOW]: "No Show",
  [LeadStatus.WRONG_NUMBER]: "Wrong Number",
  [LeadStatus.APPOINTMENT_BOOKED]: "Appointment Booked",
  [LeadStatus.VISA_GRANTED]: "Visa Granted",
  [LeadStatus.NIF_DONE]: "NIF Done",
  [LeadStatus.INCORPORATION_DONE]: "Incorporation Done",
  [LeadStatus.DECISION_PENDING]: "Decision Pending",
  [LeadStatus.ENDORSEMENT_GRANTED]: "Endorsement Granted",
  [LeadStatus.VISA_REJECTED]: "Visa Rejected",
  [LeadStatus.REFUNDED]: "Refunded",
};

export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  connected: "Connected",
  not_connected: "Not Connected",
  busy: "Busy",
  callback: "Callback Requested",
  interested: "Interested",
  not_interested: "Not Interested",
};

export const VISA_CATEGORY_LABELS: Record<VisaCategory, string> = {
  uk_innovator_founder_visa: "UK Innovator Founder Visa",
  uk_global_business_mobility: "UK Global Business Mobility",
  canadian_startup_visa_business: "Canadian Startup Visa - Business",
  portugal_d2_immigration: "Portugal D2 Immigration",
  portugal_d7_immigration: "Portugal D7 Immigration",
  portugal_d8_immigration: "Portugal D8 Immigration",
  portugal_golden_visa: "Portugal Golden Visa",
  spain_entrepreneur_visa: "Spain Entrepreneur Visa",
  saint_lucia_passport_citizenship: "Saint Lucia Passport Citizenship",
  vanuatu_citizenship_by_investment: "Vanuatu Citizenship By Investment",
  saint_kitts_and_nevis_citizenship_by_investment: "Saint Kitts And Nevis Citizenship By Investment",
  other: "Other",
};

export const STANDARD_LEAD_FIELDS = [
  "fullname",
  "email",
  "phone",
  "whatsapp",
  "jobTitle",
  "leadSource",
  "leadSubsource",
  "monthlyIncome",
  "country",
  "targetCountry",
  "visaCategory",
  "stageId",
  "status",
  "assignedTo",
  "selectedDocumentCheckList",
];

export const SYSTEM_FIELDS = [
  "raw_meta_data",
  "meta_lead_id",
  "form_id",
  "created_time",
];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  passport: "Passport",
  photo: "Photograph",
  education: "Education Documents",
  experience: "Work Experience",
  financial: "Financial Documents",
  medical: "Medical Reports",
  police_clearance: "Police Clearance",
  language_test: "Language Test Results",
  visa_application: "Visa Application",
  travel: "Travel Documents",
  other: "Other",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  telecaller: "Telecaller",
  advisor: "Advisor",
  processing: "Processing",
};

export const STAGE_LABELS: Record<LeadStage, string> = {
  cold: "Cold",
  hot: "Hot",
  dead: "Dead",
};

// Country list for multinational support
export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "United Arab Emirates",
  "Singapore",
  "New Zealand",
  "Netherlands",
  "Ireland",
  "Switzerland",
  "Sweden",
  "Norway",
  "Denmark",
  "Belgium",
  "Austria",
  "Italy",
  "Spain",
  "Portugal",
  "Japan",
  "South Korea",
  "Malaysia",
  "Thailand",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
];

// Document requirements by country
export const COUNTRY_DOCUMENT_REQUIREMENTS: Record<string, DocumentCategory[]> =
{
  "United States": [
    "passport",
    "photo",
    "education",
    "experience",
    "financial",
    "police_clearance",
  ],
  "United Kingdom": [
    "passport",
    "photo",
    "education",
    "experience",
    "financial",
    "language_test",
    "medical",
  ],
  Canada: [
    "passport",
    "photo",
    "education",
    "experience",
    "financial",
    "language_test",
    "police_clearance",
    "medical",
  ],
  Australia: [
    "passport",
    "photo",
    "education",
    "experience",
    "financial",
    "language_test",
    "police_clearance",
    "medical",
  ],
  Germany: [
    "passport",
    "photo",
    "education",
    "experience",
    "financial",
    "language_test",
  ],
  "United Arab Emirates": [
    "passport",
    "photo",
    "education",
    "experience",
    "medical",
  ],
  Singapore: ["passport", "photo", "education", "experience", "financial"],
  "New Zealand": [
    "passport",
    "photo",
    "education",
    "experience",
    "financial",
    "language_test",
    "police_clearance",
    "medical",
  ],
};

// Predefined WhatsApp messages
export const WHATSAPP_TEMPLATES = [
  {
    id: "greeting",
    label: "Greeting",
    message: "Hello! Thank you for your interest. How can I assist you today?",
  },
  {
    id: "follow_up",
    label: "Follow Up",
    message:
      "Hi! I wanted to follow up on our previous conversation. Do you have any questions?",
  },
  {
    id: "meeting_reminder",
    label: "Meeting Reminder",
    message:
      "Hi! This is a reminder for your scheduled meeting. Please confirm your availability.",
  },
  {
    id: "document_request",
    label: "Document Request",
    message:
      "Hi! We need some documents to proceed with your application. Please share the required documents at your earliest convenience.",
  },
  {
    id: "payment_reminder",
    label: "Payment Reminder",
    message:
      "Hi! This is a gentle reminder regarding the pending payment. Please complete the payment to proceed further.",
  },
  {
    id: "status_update",
    label: "Status Update",
    message:
      "Hi! Good news! There is an update on your application status. Please reach out to us for more details.",
  },
];

const leadSources = [
  "Website",
  "Referral",
  "Social Media",
  "Advertisement",
  "Cold Call",
  "Event",
  "Partner Agency",
];
const leadSubsources = [
  "Facebook",
  "LinkedIn",
  "Google Ads",
  "Partner",
  "Trade Show",
  "Direct",
  "Instagram",
  "WhatsApp",
];
const jobTitles = [
  "Software Engineer",
  "Marketing Manager",
  "Sales Executive",
  "Business Analyst",
  "Product Manager",
  "CEO",
  "CTO",
  "HR Manager",
  "Accountant",
  "Teacher",
  "Doctor",
  "Nurse",
];

const currentPositions = [
  "Employed",
  "Self-Employed",
  "Business Owner",
  "Unemployed",
  "Student",
  "Freelancer",
];

const names = [
  "Rajesh Kumar",
  "Priya Sharma",
  "Amit Patel",
  "Sneha Reddy",
  "Vikram Singh",
  "Anita Desai",
  "Suresh Gupta",
  "Meera Nair",
  "Arjun Rao",
  "Divya Menon",
  "Kiran Shah",
  "Pooja Verma",
  "Ravi Krishnan",
  "Lakshmi Iyer",
  "Manoj Pillai",
];

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "United Arab Emirates",
  "Singapore",
];

const targetCountries = [
  "Canada",
  "Australia",
  "United Kingdom",
  "United States",
  "Germany",
  "New Zealand",
  "Singapore",
];

const visaCategories: VisaCategory[] = [
  "uk_innovator_founder_visa",
  "uk_global_business_mobility",
  "canadian_startup_visa_business",
  "portugal_d2_immigration",
  "portugal_d7_immigration",
  "portugal_d8_immigration",
  "portugal_golden_visa",
  "spain_entrepreneur_visa",
  "saint_lucia_passport_citizenship",
  "vanuatu_citizenship_by_investment",
  "saint_kitts_and_nevis_citizenship_by_investment",
];

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@crm.com",
    phone: "+1234567890",
    role: "admin",
    createdAt: new Date("2024-01-01"),
    isActive: true,
  },
  {
    id: "2",
    name: "Sarah Manager",
    email: "sarah@crm.com",
    phone: "+1234567891",
    role: "manager",
    createdAt: new Date("2024-01-05"),
    isActive: true,
  },
  {
    id: "3",
    name: "John Telecaller",
    email: "john@crm.com",
    phone: "+1234567892",
    role: "telecaller",
    createdAt: new Date("2024-01-10"),
    isActive: true,
  },
  {
    id: "4",
    name: "Emily Advisor",
    email: "emily@crm.com",
    phone: "+1234567893",
    role: "advisor",
    createdAt: new Date("2024-01-15"),
    isActive: true,
  },
  {
    id: "5",
    name: "Mike Processing",
    email: "mike@crm.com",
    phone: "+1234567894",
    role: "processing",
    createdAt: new Date("2024-01-20"),
    isActive: true,
  },
  {
    id: "6",
    name: "Lisa Telecaller",
    email: "lisa@crm.com",
    phone: "+1234567895",
    role: "telecaller",
    createdAt: new Date("2024-02-01"),
    isActive: true,
  },
  {
    id: "7",
    name: "David Advisor",
    email: "david@crm.com",
    phone: "+1234567896",
    role: "advisor",
    createdAt: new Date("2024-02-05"),
    isActive: false,
  },
];

function generateLeads(): Lead[] {
  const leads: Lead[] = [];
  const statuses = Object.values(LeadStatus);

  for (let i = 1; i <= 50; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const stage = STATUS_STAGE_MAP[status as LeadStatus];
    const owner = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const createdDate = new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
    );
    const phoneNumber = `+91${Math.floor(Math.random() * 9000000000) + 1000000000
      }`;

    // Generate call logs
    const callLogs: CallLog[] = [];
    const numCalls = Math.floor(Math.random() * 4);
    for (let j = 0; j < numCalls; j++) {
      callLogs.push({
        id: `call-${i}-${j}`,
        leadId: `lead-${i}`,
        userId: owner.id,
        userName: owner.name,
        status: [
          "connected",
          "not_connected",
          "busy",
          "callback",
          "interested",
        ][Math.floor(Math.random() * 5)] as CallLog["status"],
        duration: Math.floor(Math.random() * 600) + 60,
        remarks: [
          "Discussed visa options",
          "Will call back",
          "Interested in PR",
          "Asked for documents",
          "Needs more time",
        ][Math.floor(Math.random() * 5)],
        createdAt: new Date(createdDate.getTime() + j * 24 * 60 * 60 * 1000),
      });
    }

    // Generate WhatsApp logs
    const whatsappLogs: WhatsAppLog[] = [];
    const numWhatsapp = Math.floor(Math.random() * 3);
    for (let j = 0; j < numWhatsapp; j++) {
      whatsappLogs.push({
        id: `wa-${i}-${j}`,
        leadId: `lead-${i}`,
        userId: owner.id,
        userName: owner.name,
        message: [
          "Hello! Thank you for your interest.",
          "Please share the required documents.",
          "Your meeting is scheduled.",
        ][Math.floor(Math.random() * 3)],
        status: ["sent", "delivered", "read"][
          Math.floor(Math.random() * 3)
        ] as WhatsAppLog["status"],
        createdAt: new Date(createdDate.getTime() + j * 12 * 60 * 60 * 1000),
      });
    }

    // Generate reminders
    const reminders: Reminder[] = [];
    if (Math.random() > 0.5) {
      reminders.push({
        id: `rem-${i}-1`,
        leadId: `lead-${i}`,
        userId: owner.id,
        userName: owner.name,
        title: [
          "Follow up call",
          "Document collection",
          "Meeting reminder",
          "Payment follow-up",
        ][Math.floor(Math.random() * 4)],
        description: "Follow up with the client",
        dateTime: new Date(
          Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        reminderType: ["call", "meeting", "follow_up", "document"][
          Math.floor(Math.random() * 4)
        ] as Reminder["reminderType"],
        isCompleted: Math.random() > 0.7,
        createdAt: createdDate,
      });
    }

    // Generate documents for leads in documentation/completed status
    const documents: Document[] = [];
    if (status === LeadStatus.DOCUMENTATION || status === LeadStatus.COMPLETED) {
      const docTypes = [
        "passport",
        "photo",
        "education",
        "experience",
      ] as const;
      docTypes.forEach((cat, idx) => {
        documents.push({
          id: `doc-${i}-${idx}`,
          leadId: `lead-${i}`,
          name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Document`,
          type: "application/pdf",
          category: cat,
          url: "#",
          status: Math.random() > 0.3 ? "collected" : "pending",
          uploadedBy: owner.name,
          uploadedAt: new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000),
          country:
            targetCountries[Math.floor(Math.random() * targetCountries.length)],
        });
      });
    }

    // Generate assignment history
    const assignmentHistory: LeadAssignment[] = [];
    const managers = mockUsers.filter(
      (u) => u.role === "admin" || u.role === "manager"
    );
    const assignedBy = managers[Math.floor(Math.random() * managers.length)];

    if (Math.random() > 0.3) {
      assignmentHistory.push({
        id: `assign-${i}-1`,
        leadId: `lead-${i}`,
        assignedById: assignedBy.id,
        assignedByName: assignedBy.name,
        assignedToId: owner.id,
        assignedToName: owner.name,
        assignedAt: new Date(createdDate.getTime() + 60 * 60 * 1000),
        sharedActivityLogs: true,
        notes: "Initial assignment",
      });
    }

    leads.push({
      id: `lead-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      phone: phoneNumber,
      email: `lead${i}@example.com`,
      status: status as LeadStatus,
      stage,
      jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      currentPosition:
        currentPositions[Math.floor(Math.random() * currentPositions.length)],
      whatsapp: phoneNumber,
      leadDate: createdDate,
      ownerId: owner.id,
      ownerName: owner.name,
      assignedById: assignmentHistory.length > 0 ? assignedBy.id : undefined,
      assignedByName:
        assignmentHistory.length > 0 ? assignedBy.name : undefined,
      assignedToId: owner.id,
      assignedToName: owner.name,
      assignmentHistory,
      source: leadSources[Math.floor(Math.random() * leadSources.length)],
      subsource:
        leadSubsources[Math.floor(Math.random() * leadSubsources.length)],
      monthlyIncome: Math.floor(Math.random() * 200000) + 30000,
      visaCategory:
        visaCategories[Math.floor(Math.random() * visaCategories.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      targetCountry:
        targetCountries[Math.floor(Math.random() * targetCountries.length)],
      notes: [
        {
          id: `note-${i}-1`,
          leadId: `lead-${i}`,
          userId: owner.id,
          userName: owner.name,
          content:
            "Initial contact made. Client shows interest in our services.",
          createdAt: createdDate,
        },
      ],
      callLogs,
      whatsappLogs,
      reminders,
      documents,
      createdAt: createdDate,
      updatedAt: new Date(),
      lastContactedAt:
        callLogs.length > 0
          ? callLogs[callLogs.length - 1].createdAt
          : undefined,
    });
  }

  return leads;
}

export const mockLeads: Lead[] = generateLeads();

// Dummy meetings data
export const mockMeetings: Meeting[] = [
  {
    id: "meeting-1",
    leadId: "lead-1",
    title: "Initial Consultation - Visa Application",
    scheduledAt: new Date(), // Today
    duration: 60,
    type: "initial",
    status: "scheduled",
    advisorId: "2",
    notes: "Discuss visa requirements and documentation needed.",
  },
  {
    id: "meeting-2",
    leadId: "lead-2",
    title: "Follow-up Meeting - Document Review",
    scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    duration: 45,
    type: "follow-up",
    status: "scheduled",
    advisorId: "2",
    notes: "Review submitted documents and provide feedback.",
  },
  {
    id: "meeting-3",
    leadId: "lead-3",
    title: "Closing Meeting - Final Agreement",
    scheduledAt: new Date(Date.now() + 172800000), // Day after tomorrow
    duration: 90,
    type: "closing",
    status: "scheduled",
    advisorId: "2",
    notes: "Finalize agreement and payment terms.",
  },
  {
    id: "meeting-4",
    leadId: "lead-4",
    title: "Initial Consultation - Work Visa",
    scheduledAt: new Date(Date.now() + 259200000), // 3 days from now
    duration: 60,
    type: "initial",
    status: "scheduled",
    advisorId: "2",
  },
  {
    id: "meeting-5",
    leadId: "lead-5",
    title: "Follow-up - Application Status",
    scheduledAt: new Date(Date.now() - 86400000), // Yesterday (completed)
    duration: 30,
    type: "follow-up",
    status: "completed",
    advisorId: "2",
    notes: "Discussed application progress and next steps.",
    outcome: "Application submitted successfully",
  },
  {
    id: "meeting-6",
    leadId: "lead-6",
    title: "Initial Consultation - Student Visa",
    scheduledAt: new Date(Date.now() - 172800000), // 2 days ago (completed)
    duration: 60,
    type: "initial",
    status: "completed",
    advisorId: "2",
    notes: "Client interested in student visa program.",
    outcome: "Client enrolled in program",
  },
  {
    id: "meeting-7",
    leadId: "lead-7",
    title: "Follow-up Meeting - Document Submission",
    scheduledAt: new Date(Date.now() + 345600000), // 4 days from now
    duration: 45,
    type: "follow-up",
    status: "scheduled",
    advisorId: "2",
  },
  {
    id: "meeting-8",
    leadId: "lead-8",
    title: "Closing Meeting - Agreement Signing",
    scheduledAt: new Date(Date.now() + 432000000), // 5 days from now
    duration: 60,
    type: "closing",
    status: "scheduled",
    advisorId: "2",
    notes: "Final agreement signing and payment processing.",
  },
];