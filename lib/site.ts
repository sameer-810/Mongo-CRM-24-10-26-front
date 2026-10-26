export const SITE = {
  name: "Baker & Co. CRM",
  company: "Baker & Co. Associates",
  contactEmail: "info@bakerandco.ae",
  lastUpdated: "27 October 2026",
} as const;

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
