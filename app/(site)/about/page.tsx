import type { Metadata } from "next";
import { Eye, HeartHandshake, Lock, Target } from "lucide-react";
import { PageIntro, SectionHeading } from "@/components/site/page-intro";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `About | ${SITE.name}`,
  description: `Why ${SITE.company} built a CRM for immigration and residency consultancies.`,
};

const values = [
  { icon: Target, title: "Built for one job", text: "Every screen is designed around the journey from enquiry to visa decision, not generic sales." },
  { icon: Eye, title: "Clarity for everyone", text: "Each person sees what they need to act on today, and managers see the whole picture." },
  { icon: Lock, title: "Client data is sensitive", text: "Passports and financial details deserve strict access rules, encryption and audit trails." },
  { icon: HeartHandshake, title: "Every client matters", text: "A missed call-back can cost a family their relocation plans. The system makes sure that doesn't happen." },
];

const audience = [
  ["Immigration and residency consultancies", "Firms guiding clients through golden visas, digital nomad visas, passive income and entrepreneur routes."],
  ["Relocation and citizenship advisors", "Teams that run consultations, agreements and long document-collection phases."],
  ["Growing sales teams", "Companies running Meta ads or website campaigns that need fast, fair lead distribution."],
] as const;

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About us" title="We built the CRM we needed ourselves">
        <p>
          {SITE.company} helps clients relocate to Portugal, Spain, the UK and beyond. As our enquiries grew, spreadsheets and chat
          groups stopped working. {SITE.name} is the system we built to fix that, and it now runs our whole client journey.
        </p>
      </PageIntro>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <SectionHeading title="The problem we saw" />
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              A single advertising campaign can bring in hundreds of enquiries in a week. Each one needs a quick first call, a
              consultation with the right advisor, an agreement, a payment, and then weeks of document collection.
            </p>
            <p>
              When that work lives in spreadsheets and personal phones, leads go cold, two people call the same client, and
              managers cannot tell which campaigns or team members are actually converting.
            </p>
          </div>
        </div>
        <div>
          <SectionHeading title="What we set out to do" />
          <div className="mt-4 space-y-4 text-muted-foreground">
            <p>
              Put every lead in one place the moment it arrives. Hand it to the right person automatically. Record every call,
              message and note against the client. Remind people before something slips.
            </p>
            <p>
              Then give each role a dashboard built around its own work, so telecallers, advisors, processing staff and managers
              all start their day knowing exactly what to do.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <SectionHeading title="What we believe" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4 rounded-xl border bg-card p-6">
                <Icon className="h-6 w-6 shrink-0 text-primary" aria-hidden />
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHeading title="Who it is for">
          {SITE.name} supports several companies on one platform, each with its own private workspace.
        </SectionHeading>
        <dl className="mt-10 grid gap-6 md:grid-cols-3">
          {audience.map(([title, text]) => (
            <div key={title} className="border-l-4 border-primary pl-4">
              <dt className="font-semibold">{title}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{text}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
