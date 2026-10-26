import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Briefcase,
  ClipboardCheck,
  FileSpreadsheet,
  Headphones,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/site/page-intro";
import { Screenshot } from "@/components/site/screenshot";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} | Lead management for immigration consultancies`,
  description:
    "Capture leads from ads and your website, assign them to the right person, follow up on time and track every client to a visa decision.",
};

const problems = [
  {
    title: "Leads arrive from everywhere",
    text: "Enquiries come from Meta ads, the website, referrals and walk-ins. The CRM pulls them into one list automatically, with no copying from spreadsheets.",
  },
  {
    title: "Follow-ups get forgotten",
    text: "Every lead has reminders, call logs and notes. Each team member sees what is due today, so nobody has to rely on memory.",
  },
  {
    title: "Managers can't see the pipeline",
    text: "Live dashboards show how many leads are new, in meetings, paid or granted, and how each team member is performing.",
  },
  {
    title: "Paperwork slows cases down",
    text: "Visa-specific document checklists and document reminders keep the processing team on top of every file.",
  },
];

const roles = [
  { icon: ShieldCheck, name: "Admin", text: "Owns the workspace, creates user accounts, sees every lead and report." },
  { icon: UserCog, name: "Manager", text: "Imports and distributes leads, watches team performance, manages users." },
  { icon: Briefcase, name: "Advisor", text: "Runs consultations, moves clients through meetings, agreements and payment." },
  { icon: Headphones, name: "Telecaller", text: "Makes first contact, qualifies interest and books meetings with advisors." },
  { icon: ClipboardCheck, name: "Processing", text: "Collects documents and prepares applications after the client has paid." },
];

const features = [
  { icon: FileSpreadsheet, title: "Automatic lead capture", text: "Meta lead ads, website forms and Excel bulk import." },
  { icon: Users, title: "Smart assignment", text: "Assign by hand or auto-distribute imported leads across the team." },
  { icon: MessageCircle, title: "Calls, WhatsApp and email", text: "Log every conversation and message clients from the lead record." },
  { icon: BellRing, title: "Reminders", text: "Scheduled call-backs and document deadlines with on-screen alerts." },
  { icon: LayoutDashboard, title: "Role dashboards", text: "Each role lands on a dashboard built around its own work." },
  { icon: ShieldCheck, title: "Secure by design", text: "Role-based access, encrypted passwords and isolated company data." },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-brand-navy text-brand-navy-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">CRM for immigration consultancies</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              Turn every enquiry into a <span className="text-primary">successful visa case</span>
            </h1>
            <p className="mt-6 text-lg text-brand-navy-foreground/80">
              {SITE.name} brings your leads, calls, meetings, payments and documents into one place. Your whole team works from the
              same up-to-date record, from the first call to the final visa decision.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/30 bg-transparent text-brand-navy-foreground hover:bg-white/10 hover:text-brand-navy-foreground"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
          <Screenshot src="/guide/admin-dashboard.png" alt="Admin dashboard with lead statistics and charts" priority />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading title="The problems it solves">
          Consultancies lose clients through slow replies and missed follow-ups, not through a lack of enquiries.
        </SectionHeading>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {problems.map((p) => (
            <Card key={p.title}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-muted-foreground">{p.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading title="Who uses it">
            Five roles, each with its own dashboard and only the access it needs.
          </SectionHeading>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {roles.map(({ icon: Icon, name, text }) => (
              <div key={name} className="rounded-xl border bg-card p-6">
                <Icon className="h-8 w-8 text-primary" aria-hidden />
                <h3 className="mt-4 font-semibold">{name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading title="Everything your team needs" />
          <Link href="/services" className="font-medium text-foreground underline-offset-4 hover:underline">
            See all services →
          </Link>
        </div>
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/20">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading title="One record for every client">
              Open any lead to see the full story: contact details, visa route, call history, WhatsApp and email messages, notes,
              reminders and documents. Anyone picking up the case knows exactly where it stands.
            </SectionHeading>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/how-it-works">See how a lead moves through the CRM</Link>
            </Button>
          </div>
          <Screenshot src="/guide/lead-detail.png" alt="Lead detail window showing contact information and activity tabs" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight">Ready to stop losing leads?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Sign in if your company already has an account. New to {SITE.name}? Find out how to get your team set up.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Sign up</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/user-guide">Read the user guide</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
