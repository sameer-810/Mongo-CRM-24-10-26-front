const emailDomain = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "bakerandco.ae";

/** Branding comes from NEXT_PUBLIC_* env vars (baked in at build time); redeploy after changing them. */
export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "FiveM Infotech CRM",
  company: process.env.NEXT_PUBLIC_COMPANY_NAME || "FiveM Infotech",
  emailDomain,
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || `info@${emailDomain}`,
  lastUpdated: "27 October 2026",
};

export const SITE_NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/user-guide", label: "User Guide" },
] as const;

export const SITE_LEGAL = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
] as const;

const SITE_PATHS = ["/about", "/services", "/how-it-works", "/user-guide", "/signup", "/privacy-policy", "/terms-and-conditions"];

/** Public marketing pages render without the CRM sidebar or an auth check. */
export function isSitePath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/" || SITE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
