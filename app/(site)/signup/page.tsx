import type { Metadata } from "next";
import Link from "next/link";
import { Building2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageIntro } from "@/components/site/page-intro";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Sign up | ${SITE.name}`,
  description: `How to get an account on ${SITE.name}.`,
};

export default function SignupPage() {
  return (
    <>
      <PageIntro eyebrow="Sign up" title="Get your team on the CRM">
        <p>
          Accounts are created by each company&apos;s administrator, so client data is only ever seen by people the company has
          approved. Choose the option that fits you.
        </p>
      </PageIntro>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
        <Card>
          <CardContent className="flex h-full flex-col p-8">
            <UserPlus className="h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-4 text-xl font-semibold">My company already uses it</h2>
            <ol className="mt-4 flex-1 list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>Ask your admin or manager to create your account.</li>
              <li>You will receive your email address and a temporary password.</li>
              <li>Sign in and set your own password on the profile page.</li>
            </ol>
            <Button asChild className="mt-6">
              <Link href="/login">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col p-8">
            <Building2 className="h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-4 text-xl font-semibold">I want it for my company</h2>
            <ol className="mt-4 flex-1 list-decimal space-y-2 pl-5 text-muted-foreground">
              <li>Email us with your company name and team size.</li>
              <li>We set up a private workspace and a plan that fits.</li>
              <li>You get an admin account to invite the rest of your team.</li>
            </ol>
            <Button asChild variant="outline" className="mt-6">
              <a href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent(`New workspace for ${SITE.name}`)}`}>
                Email {SITE.contactEmail}
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
