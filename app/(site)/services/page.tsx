import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/site/page-intro";
import { Screenshot } from "@/components/site/screenshot";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Services | ${SITE.name}`,
  description: "Lead capture, assignment, call and message tracking, reminders, document checklists, dashboards and user management.",
};

const services = [
  {
    title: "Lead capture from every channel",
    image: "/guide/bulk-import.png",
    alt: "Bulk upload window for Excel or CSV files",
    points: [
      "Leads from Meta lead ads and your website forms arrive automatically, with the ad or form name attached.",
      "Upload hundreds of leads at once from Excel (.xlsx, .xls) or CSV files.",
      "Add walk-ins and referrals by hand with a short form.",
      "Duplicate emails and phone numbers are caught before they create a second record.",
    ],
  },
  {
    title: "Fair, fast lead assignment",
    image: "/guide/assign-lead.png",
    alt: "Assign Lead window showing current owner and assignment history",
    points: [
      "Imported leads are shared out automatically across the team, or all given to one person you choose.",
      "Reassign any lead in two clicks and decide whether the new owner sees earlier calls and notes.",
      "A full assignment history shows who handed the lead to whom, and when.",
    ],
  },
  {
    title: "Every conversation in one place",
    image: "/guide/lead-calls.png",
    alt: "Calls tab of a lead with a logged connected call",
    points: [
      "Log calls with an outcome such as Connected, Busy or Interested, plus remarks.",
      "Send WhatsApp messages and emails from the lead record and keep a copy of each.",
      "Add notes the whole team can read, signed with the author's name and time.",
    ],
  },
  {
    title: "Reminders that keep cases moving",
    image: "/guide/add-reminder.png",
    alt: "Add Reminder window with type, title, date and time",
    points: [
      "Schedule call-backs, meetings and follow-ups against a lead.",
      "On-screen alerts appear when a reminder is due, wherever you are in the app.",
      "Document reminders warn the processing team about documents expiring within seven days.",
    ],
  },
  {
    title: "Visa document checklists",
    image: "/guide/lead-docs.png",
    alt: "Portugal D8 document checklist with upload buttons",
    points: [
      "Ready-made checklists for Portugal D2, D7 and D8, Spain Digital Nomad and Non-Lucrative, and the UK Innovator Founder visa.",
      "Upload each document against its checklist item and tick it off when received.",
      "The processing dashboard shows pending, expired and uploaded documents across all clients.",
    ],
  },
  {
    title: "Dashboards for every role",
    image: "/guide/telecaller-dashboard.png",
    alt: "Telecaller dashboard with call statistics and recent call logs",
    points: [
      "Admins and managers see total clients, weekly activity, conversion rate and the pipeline by stage.",
      "Telecallers see calls made, connect rate and today's outcomes.",
      "Advisors see open opportunities, pending agreements and their close rate.",
    ],
  },
  {
    title: "Team and access management",
    image: "/guide/users.png",
    alt: "User Management page listing team members by role",
    points: [
      "Create accounts for managers, advisors, telecallers and processing staff.",
      "Each role only reaches the pages and leads it should.",
      "New users must set their own password before they can start work.",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageIntro eyebrow="Services" title="Everything your consultancy needs, from first enquiry to final visa">
        <p>Each feature below is part of the same system, so information entered once is available to everyone who needs it.</p>
      </PageIntro>

      <div className="mx-auto max-w-6xl space-y-24 px-4 py-20 sm:px-6">
        {services.map((s, i) => (
          <section key={s.title} className="grid items-center gap-10 lg:grid-cols-2">
            <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{s.title}</h2>
              <ul className="mt-6 space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3 text-muted-foreground">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <Screenshot src={s.image} alt={s.alt} />
          </section>
        ))}
      </div>

      <section className="bg-muted/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-bold">Want to see it step by step?</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/how-it-works">How it works</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/user-guide">User guide</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
