import type { ReactNode } from "react";
import { PageIntro } from "@/components/site/page-intro";
import { SITE } from "@/lib/site";

export interface LegalSection {
  title: string;
  body: ReactNode;
}

interface LegalDocumentProps {
  title: string;
  summary: string;
  sections: LegalSection[];
}

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function LegalDocument({ title, summary, sections }: LegalDocumentProps) {
  return (
    <>
      <PageIntro eyebrow="Legal" title={title}>
        <p>{summary}</p>
        <p className="mt-3 text-sm text-brand-navy-foreground/60">Last updated: {SITE.lastUpdated}</p>
      </PageIntro>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[220px_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ol className="sticky top-24 space-y-2 text-sm">
            {sections.map((s, i) => (
              <li key={s.title}>
                <a href={`#${slug(s.title)}`} className="text-muted-foreground hover:text-foreground">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <section key={s.title} id={slug(s.title)} className="scroll-mt-24">
              <h2 className="text-xl font-semibold">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
