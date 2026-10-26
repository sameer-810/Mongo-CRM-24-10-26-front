import type { Metadata } from "next";
import { PageIntro, SectionHeading } from "@/components/site/page-intro";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `How It Works | ${SITE.name}`,
  description: "How a lead moves through the CRM, from capture to visa decision, and who does what at each step.",
};

const journey = [
  {
    step: "Capture",
    who: "Automatic, or Admin and Manager",
    statuses: ["New"],
    text: "A lead arrives from a Meta ad, a website form, a bulk upload or manual entry. It is saved with its source and placed in the Cold stage.",
  },
  {
    step: "Assign",
    who: "Automatic, or Admin and Manager",
    statuses: [],
    text: "The lead is given to a telecaller, either shared out automatically or chosen by a manager. The telecaller sees it on their dashboard and lead list straight away.",
  },
  {
    step: "First contact",
    who: "Telecaller",
    statuses: ["Not Answered", "Busy", "Answered", "Follow Up", "Not Interested", "Wrong Number"],
    text: "The telecaller calls, logs the outcome and sets a reminder for the next attempt. Wrong numbers and uninterested leads are closed so the list stays clean.",
  },
  {
    step: "Consultation",
    who: "Telecaller hands over to Advisor",
    statuses: ["Meeting Scheduled", "Meeting Done", "No Show"],
    text: "Interested clients are reassigned to an advisor, who can see the earlier call history. The advisor runs the consultation and records what was agreed.",
  },
  {
    step: "Agreement and payment",
    who: "Advisor",
    statuses: ["Agreement Pending", "Agreement Done", "Payment Pending", "Payment Done"],
    text: "The advisor sends the agreement, tracks the signature and confirms payment. Managers see these numbers live on their dashboard.",
  },
  {
    step: "Documents and filing",
    who: "Processing",
    statuses: ["Documentation", "NIF Done", "Incorporation Done", "Appointment Booked"],
    text: "Processing staff open the visa checklist, collect and upload each document, and get warnings before anything expires.",
  },
  {
    step: "Decision",
    who: "Processing and Advisor",
    statuses: ["Decision Pending", "Endorsement Granted", "Visa Granted", "Visa Rejected", "Completed"],
    text: "The outcome is recorded against the client, completing the record for reporting and for any future applications.",
  },
];

const stages = [
  ["Cold", "Leads not yet engaged: New, Not Answered or Busy. A Visa Rejected case also returns here for a possible new route."],
  ["Hot", "Every status that shows intent, from Answered and Follow Up through meetings, agreements, payment, processing and Visa Granted."],
  ["Dead", "Not Interested, Not Eligible, Wrong Number or Refunded. These leads stay searchable but out of the way."],
] as const;

const access = [
  ["Admin", "All leads", "Create, import, edit, assign and delete leads. Manage users."],
  ["Manager", "All leads", "Create, import, edit and assign leads. Manage users."],
  ["Advisor", "Assigned leads", "Edit, log activity, set reminders and reassign their own leads."],
  ["Telecaller", "Assigned leads", "Edit, log calls and messages, set reminders and reassign their own leads."],
  ["Processing", "Assigned leads", "Manage document checklists and uploads, and track document expiry."],
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro eyebrow="How it works" title="How a lead moves from enquiry to visa decision">
        <p>
          Every lead follows the same path, and the CRM records who handled it at each step. Its status tells everyone where it
          stands, and its stage tells managers how warm it is.
        </p>
      </PageIntro>

      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <SectionHeading title="The lead journey" />
        <ol className="mt-12 space-y-0">
          {journey.map((j, i) => (
            <li key={j.step} className="relative flex gap-6 pb-12 last:pb-0">
              {i < journey.length - 1 && <span className="absolute left-5 top-10 h-full w-px bg-border" aria-hidden />}
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="pt-1">
                <h3 className="text-xl font-semibold">{j.step}</h3>
                <p className="text-sm font-medium text-muted-foreground">{j.who}</p>
                <p className="mt-3 text-muted-foreground">{j.text}</p>
                {j.statuses.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {j.statuses.map((s) => (
                      <span key={s} className="rounded-full border bg-card px-3 py-1 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading title="Stages at a glance">
            Changing a lead&apos;s status moves it to the matching stage automatically, so the pipeline chart is always current.
          </SectionHeading>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {stages.map(([name, text]) => (
              <div key={name} className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading title="Who can do what" />
        <div className="mt-10 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Role</th>
                <th scope="col" className="px-4 py-3 font-semibold">Sees</th>
                <th scope="col" className="px-4 py-3 font-semibold">Can</th>
              </tr>
            </thead>
            <tbody>
              {access.map(([role, sees, can]) => (
                <tr key={role} className="border-t">
                  <th scope="row" className="px-4 py-3 font-medium">{role}</th>
                  <td className="px-4 py-3 text-muted-foreground">{sees}</td>
                  <td className="px-4 py-3 text-muted-foreground">{can}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
