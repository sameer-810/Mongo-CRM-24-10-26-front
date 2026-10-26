import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/site/legal-document";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms & Conditions | ${SITE.name}`,
  description: `The terms that apply when you use ${SITE.name}.`,
};

const sections: LegalSection[] = [
  {
    title: "Acceptance",
    body: (
      <p>
        These terms govern your use of {SITE.name}, provided by {SITE.company}. By signing in or using the platform you agree to
        them. If you use it on behalf of a company, you confirm you have authority to accept them for that company.
      </p>
    ),
  },
  {
    title: "Accounts",
    body: (
      <ul>
        <li>User accounts are created by your company&apos;s administrator. There is no public self-registration.</li>
        <li>You must change the temporary password you receive before using the platform.</li>
        <li>Keep your credentials private and do not share accounts. You are responsible for activity under your account.</li>
        <li>Tell your administrator or us straight away if you suspect unauthorised access.</li>
      </ul>
    ),
  },
  {
    title: "Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>Upload leads or documents you have no right to process, or contact people who have not agreed to be contacted.</li>
          <li>Try to access data belonging to another company or outside your role.</li>
          <li>Probe, overload or disrupt the service, or reverse engineer it.</li>
          <li>Use the platform to send spam or unlawful content.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Customer data",
    body: (
      <p>
        You keep all rights to the data your company stores in the platform. You give us permission to host and process it only to
        provide the service. Our handling of personal data is described in the{" "}
        <Link href="/privacy-policy" className="text-foreground underline">
          Privacy Policy
        </Link>
        .
      </p>
    ),
  },
  {
    title: "Subscriptions and limits",
    body: (
      <ul>
        <li>Each company subscribes to a plan that may limit the number of users, leads and documents.</li>
        <li>When a limit is reached, new records of that type cannot be added until the plan is upgraded.</li>
        <li>If a subscription expires or is cancelled, existing data stays readable but new records cannot be created.</li>
        <li>We may suspend a workspace for non-payment or a serious breach of these terms, after notice where practical.</li>
      </ul>
    ),
  },
  {
    title: "Third-party services",
    body: (
      <p>
        Features such as Meta lead ads, WhatsApp, email and file storage rely on third-party services. Their availability and terms
        are outside our control, and your use of them is also subject to their own terms.
      </p>
    ),
  },
  {
    title: "Availability and changes",
    body: (
      <p>
        We work to keep the platform available and secure but do not guarantee uninterrupted service. We may improve or change
        features over time, and will give notice of changes that materially reduce functionality.
      </p>
    ),
  },
  {
    title: "Intellectual property",
    body: (
      <p>
        The software, design and branding of {SITE.name} belong to {SITE.company}. These terms give you a limited, non-transferable
        right to use the platform during your subscription.
      </p>
    ),
  },
  {
    title: "Liability",
    body: (
      <p>
        To the extent the law allows, the platform is provided &quot;as is&quot;. We are not liable for indirect or consequential
        losses, including lost profits or lost business. Our total liability is limited to the fees your company paid in the twelve
        months before the claim.
      </p>
    ),
  },
  {
    title: "Termination",
    body: (
      <p>
        Your company may stop using the platform at any time. We may end access for a material breach of these terms. On
        termination you can request an export of your data within thirty days, after which it may be deleted.
      </p>
    ),
  },
  {
    title: "Governing law and contact",
    body: (
      <p>
        These terms are governed by the laws of the United Arab Emirates. Questions about them can be sent to{" "}
        <a href={`mailto:${SITE.contactEmail}`} className="text-foreground underline">
          {SITE.contactEmail}
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms & Conditions"
      summary="The rules for using the platform, what you can expect from us, and what we expect from you."
      sections={sections}
    />
  );
}
