import type { Metadata } from "next";
import { Lightbulb } from "lucide-react";
import { PageIntro } from "@/components/site/page-intro";
import { Screenshot } from "@/components/site/screenshot";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `User Guide | ${SITE.name}`,
  description: "Step-by-step instructions with screenshots for every role: signing in, dashboards, leads, calls, reminders, documents and users.",
};

interface GuideTopic {
  id: string;
  title: string;
  roles: string;
  steps: string[];
  image: string;
  alt: string;
  tip?: string;
}

const topics: GuideTopic[] = [
  {
    id: "sign-in",
    title: "Sign in",
    roles: "Everyone",
    steps: [
      "Click Sign in at the top of this website.",
      "Enter the email address and password your admin gave you, then click Sign in.",
      "Forgot your password? Click Forgot password, enter your email and follow the link we send you.",
    ],
    image: "/guide/login.png",
    alt: "Sign in page with email and password fields",
  },
  {
    id: "first-login",
    title: "Set your own password on first sign-in",
    roles: "Manager, Advisor, Telecaller, Processing",
    steps: [
      "The first time you sign in, you are taken to your profile page.",
      "Choose a new password and save it. The rest of the app unlocks straight away.",
      "Your profile also shows your role and what you have access to.",
    ],
    image: "/guide/profile.png",
    alt: "Profile page showing user details and role",
    tip: "Until you change the temporary password, every page sends you back to your profile.",
  },
  {
    id: "admin-dashboard",
    title: "Admin and manager dashboard",
    roles: "Admin, Manager",
    steps: [
      "The four cards show total clients, interactions this week, meetings scheduled and the lead-to-client conversion rate.",
      "Lead Performance compares new leads with converted leads month by month.",
      "Client Pipeline shows how many leads are Cold, Hot or Dead. Hover a bar to see the exact count.",
    ],
    image: "/guide/admin-dashboard.png",
    alt: "Admin dashboard with statistics cards and charts",
  },
  {
    id: "telecaller-dashboard",
    title: "Telecaller dashboard",
    roles: "Telecaller",
    steps: [
      "Check Calls Made Today, Connected Calls and your Connect Rate to track your daily target.",
      "Pending Follow-ups shows call-backs scheduled for today.",
      "Recent Logs lists your latest calls with their outcome, so you can pick up where you left off.",
    ],
    image: "/guide/telecaller-dashboard.png",
    alt: "Telecaller dashboard with call statistics and recent logs",
  },
  {
    id: "advisor-dashboard",
    title: "Advisor dashboard",
    roles: "Advisor",
    steps: [
      "Active Opportunities counts the qualified leads in your pipeline.",
      "New Leads Today lists leads just assigned to you, with phone, email and status.",
      "Pending Agreements and Close Rate show how many clients are waiting to sign and how many you convert.",
    ],
    image: "/guide/advisor-dashboard.png",
    alt: "Advisor dashboard with opportunities and new leads",
  },
  {
    id: "processing-dashboard",
    title: "Processing dashboard",
    roles: "Processing",
    steps: [
      "Total Leads shows every client file assigned to you.",
      "Pending, Expired and Uploaded tell you how the document collection is going.",
      "Expiry Alerts lists documents that need action now.",
    ],
    image: "/guide/processing-dashboard.png",
    alt: "Processing dashboard with document statistics",
  },
  {
    id: "leads-list",
    title: "Find and filter leads",
    roles: "Everyone",
    steps: [
      "Open Leads from the left menu. Admins and managers see all leads, and everyone else sees the leads assigned to them.",
      "Type a name, email or phone number in the search box.",
      "Narrow the list with the filters for status, stage, visa category, country, date and owner.",
      "Use Columns to choose what the table shows, and Export All Leads at the bottom to download a spreadsheet.",
    ],
    image: "/guide/leads-list.png",
    alt: "Leads list with search, filters and status badges",
  },
  {
    id: "add-lead",
    title: "Add a single lead",
    roles: "Admin, Manager",
    steps: [
      "On the Leads page, click Add New Lead and stay on the Single Lead tab.",
      "Fill in name, phone and email. These three are required.",
      "Add the current and target country, visa category, job title, monthly income and lead source.",
      "Optionally choose who to assign it to, then click Add Lead.",
    ],
    image: "/guide/add-lead.png",
    alt: "Add New Lead form with basic information filled in",
    tip: "If a lead with the same email or phone already exists, you will be told instead of creating a duplicate.",
  },
  {
    id: "bulk-import",
    title: "Upload many leads at once",
    roles: "Admin, Manager",
    steps: [
      "Click Add New Lead and switch to the Bulk Upload tab.",
      "Click Browse Files and pick an Excel (.xlsx, .xls) or CSV file.",
      "Leave Assign Lead empty to share the leads out automatically, or pick one person to receive them all.",
      "Click Upload Leads. You will see how many were imported and how many were skipped as duplicates.",
    ],
    image: "/guide/bulk-import.png",
    alt: "Bulk upload tab with file picker and assignment option",
  },
  {
    id: "lead-record",
    title: "Open a lead and add notes",
    roles: "Everyone",
    steps: [
      "Click a lead's name to open its record.",
      "The left side shows contact details, owner, source, income and visa details.",
      "Change the status from the drop-down at the top right. The stage updates to match.",
      "On the Notes tab, type a note and click Add Note. Everyone with access to the lead can read it.",
    ],
    image: "/guide/lead-detail.png",
    alt: "Lead record with contact info and the Notes tab",
  },
  {
    id: "log-call",
    title: "Log a call",
    roles: "Everyone",
    steps: [
      "Open the lead and go to the Calls tab.",
      "Click Log New Call.",
      "Choose the call status, such as Connected, Busy or Interested, and add remarks.",
      "Click Save Call Log. The call appears in the list and counts towards your dashboard.",
    ],
    image: "/guide/log-call.png",
    alt: "Log Call window with call status and remarks",
  },
  {
    id: "whatsapp-email",
    title: "Send WhatsApp messages and emails",
    roles: "Everyone",
    steps: [
      "Open the lead and go to the WhatsApp or Emails tab.",
      "Click Send WhatsApp or the email button, write your message and send it.",
      "Each message is saved on the lead with its outcome, so colleagues know what the client has received.",
    ],
    image: "/guide/lead-whatsapp.png",
    alt: "WhatsApp tab of a lead with one logged message",
  },
  {
    id: "reminders",
    title: "Set a reminder",
    roles: "Everyone",
    steps: [
      "Open the lead, go to the Reminders tab and click Add Reminder.",
      "Choose the reminder type and give it a clear title.",
      "Pick a date and time and add any notes, then click Add Reminder.",
      "When it is due, an alert pops up wherever you are in the app.",
    ],
    image: "/guide/add-reminder.png",
    alt: "Add Reminder window with type, title, date and time",
  },
  {
    id: "assign",
    title: "Reassign a lead",
    roles: "Everyone, for their own leads. Admins and managers for any lead.",
    steps: [
      "Open the lead and click Assign Lead at the top.",
      "Pick the team member who should take over.",
      "Check the activity the new owner will be able to see: calls, notes and reminders.",
      "Click Assign Lead. The change is added to the assignment history.",
    ],
    image: "/guide/assign-lead.png",
    alt: "Assign Lead window with current owner, activity logs and history",
  },
  {
    id: "documents",
    title: "Collect visa documents",
    roles: "Processing, Admin, Manager",
    steps: [
      "Open the lead and go to the Docs tab.",
      "Pick the client's visa route: Portugal D2, D7 or D8, Spain DNV or NLV, or UK Innovator Founder.",
      "Click Upload next to each item as you receive it. The checklist remembers which route you chose.",
    ],
    image: "/guide/lead-docs.png",
    alt: "Portugal D8 document checklist with upload buttons",
  },
  {
    id: "document-reminders",
    title: "Watch for expiring documents",
    roles: "Processing, Admin, Manager",
    steps: [
      "Open Document Reminders from the left menu.",
      "Documents expiring within the next seven days appear here.",
      "Search by lead name or document label to find a file quickly.",
    ],
    image: "/guide/document-reminders.png",
    alt: "Document Expiry Reminders page",
  },
  {
    id: "users",
    title: "Manage your team",
    roles: "Admin, Manager",
    steps: [
      "Open User Management from the left menu.",
      "Click Add User, enter the person's name and username, choose their role and set a temporary password.",
      "Filter the list by role. The menu on each row lets you view details, edit the user, change their password or delete them.",
    ],
    image: "/guide/users.png",
    alt: "User Management page with role counts and team list",
    tip: "Share the temporary password privately. The new user must change it when they first sign in.",
  },
];

export default function UserGuidePage() {
  return (
    <>
      <PageIntro eyebrow="User guide" title="How to use the CRM, step by step">
        <p>Short instructions with screenshots for every task. Each topic shows which roles it applies to.</p>
      </PageIntro>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Guide topics" className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Topics</h2>
          <ol className="mt-3 grid gap-1 text-sm sm:grid-cols-2 lg:grid-cols-1">
            {topics.map((t, i) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="block rounded-md px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                  {i + 1}. {t.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0 space-y-20">
          {topics.map((t, i) => (
            <section key={t.id} id={t.id} className="scroll-mt-24">
              <p className="text-sm font-semibold text-muted-foreground">Step {i + 1}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">{t.title}</h2>
              <p className="mt-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-medium">For: {t.roles}</p>
              <ol className="mt-5 list-decimal space-y-2 pl-5 text-muted-foreground marker:font-semibold marker:text-foreground">
                {t.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              {t.tip && (
                <p className="mt-4 flex gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
                  <Lightbulb className="h-4 w-4 shrink-0 translate-y-0.5 text-primary" aria-hidden />
                  {t.tip}
                </p>
              )}
              <div className="mt-6">
                <Screenshot src={t.image} alt={t.alt} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
