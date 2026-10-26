import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}

export function PageIntro({ eyebrow, title, children }: PageIntroProps) {
  return (
    <section className="bg-brand-navy text-brand-navy-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">{title}</h1>
        {children && <div className="mt-5 max-w-2xl text-lg text-brand-navy-foreground/80">{children}</div>}
      </div>
    </section>
  );
}

interface SectionHeadingProps {
  title: string;
  children?: ReactNode;
}

export function SectionHeading({ title, children }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {children && <p className="mt-3 text-muted-foreground">{children}</p>}
    </div>
  );
}
