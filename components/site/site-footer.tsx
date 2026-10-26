import Link from "next/link";
import { SITE, SITE_LEGAL, SITE_NAV } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-brand-navy text-brand-navy-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src="/logo.png" alt={SITE.company} className="h-10 w-auto" />
          <p className="mt-4 max-w-sm text-sm text-brand-navy-foreground/70">
            A lead management CRM built for immigration and residency consultancies. Capture every enquiry, follow up on time and
            guide each client from first call to visa decision.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-primary">Explore</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {SITE_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-brand-navy-foreground/70 hover:text-brand-navy-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-primary">Account & legal</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {[{ href: "/login", label: "Sign in" }, { href: "/signup", label: "Sign up" }, ...SITE_LEGAL].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-brand-navy-foreground/70 hover:text-brand-navy-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${SITE.contactEmail}`} className="text-brand-navy-foreground/70 hover:text-brand-navy-foreground">
                {SITE.contactEmail}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-brand-navy-foreground/60">
        © {new Date().getFullYear()} {SITE.company}. All rights reserved.
      </div>
    </footer>
  );
}
