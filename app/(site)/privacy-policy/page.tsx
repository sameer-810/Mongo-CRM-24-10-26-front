import type { Metadata } from "next";
import { LegalDocument, type LegalSection } from "@/components/site/legal-document";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE.name}`,
  description: `How ${SITE.company} collects, uses and protects personal data in ${SITE.name}.`,
};

const sections: LegalSection[] = [
  {
    title: "Who we are",
    body: (
      <p>
        {SITE.name} is a lead management platform operated by {SITE.company} (&quot;we&quot;, &quot;us&quot;). This policy explains
        what personal data the platform handles, why, and the choices you have. It applies to this website and to the CRM
        application.
      </p>
    ),
  },
  {
    title: "Our role and our customers' role",
    body: (
      <>
        <p>
          Companies that subscribe to {SITE.name} (&quot;customers&quot;) decide which leads and client records they store. For that
          data the customer is the data controller and we act as its processor, handling it only on the customer&apos;s
          instructions.
        </p>
        <p>
          For account information about the people who use the platform, and for visitors to this website, we are the controller.
        </p>
      </>
    ),
  },
  {
    title: "Data we collect",
    body: (
      <ul>
        <li>
          <strong>Account data:</strong> name, email address, phone number, role and an encrypted (hashed) password for each user.
        </li>
        <li>
          <strong>Lead and client data</strong> entered by customers or received from their connected sources: names, contact
          details, nationality and target country, visa category, job title, income range, notes, call logs, messages, reminders
          and uploaded documents such as passports or permits.
        </li>
        <li>
          <strong>Activity data:</strong> which user created, assigned or changed a record and when, plus security audit logs.
        </li>
        <li>
          <strong>Technical data:</strong> IP address, browser type and pages visited, collected through server logs and privacy-
          friendly analytics.
        </li>
      </ul>
    ),
  },
  {
    title: "How we use data",
    body: (
      <ul>
        <li>To provide the CRM: storing, displaying and assigning leads, and sending reminders and notifications.</li>
        <li>To secure the service: authenticating users, enforcing role permissions and detecting misuse.</li>
        <li>To send service emails such as password reset links.</li>
        <li>To support customers and improve the product using aggregated, non-identifying usage statistics.</li>
      </ul>
    ),
  },
  {
    title: "Legal basis",
    body: (
      <p>
        We process account data to perform our contract with customers, and technical data for our legitimate interest in running
        a secure service. Customers are responsible for having a lawful basis, such as consent, for the lead data they collect and
        store in the platform.
      </p>
    ),
  },
  {
    title: "Sharing and service providers",
    body: (
      <>
        <p>We do not sell personal data. We share it only with providers that help us run the platform, under contract:</p>
        <ul>
          <li>Cloud hosting and database providers that store the application and its data.</li>
          <li>Secure file storage for uploaded documents.</li>
          <li>Email delivery providers for password resets and notifications.</li>
          <li>Lead sources a customer connects, such as Meta lead ads or the customer&apos;s own website forms.</li>
        </ul>
        <p>We may also disclose data where the law requires it.</p>
      </>
    ),
  },
  {
    title: "International transfers",
    body: (
      <p>
        Our providers may store data in data centres outside your country. Where that happens we rely on appropriate safeguards,
        such as standard contractual clauses, to protect it.
      </p>
    ),
  },
  {
    title: "Security",
    body: (
      <ul>
        <li>Passwords are stored as one-way hashes and are never visible to anyone, including us.</li>
        <li>Each customer&apos;s data is kept separate from every other customer&apos;s data.</li>
        <li>Users see only what their role allows. Telecallers, advisors and processing staff see only the leads assigned to them.</li>
        <li>Data travels over encrypted HTTPS connections, and sensitive actions are recorded in audit logs.</li>
      </ul>
    ),
  },
  {
    title: "Retention",
    body: (
      <p>
        Customer data is kept for as long as the customer&apos;s subscription is active. After the subscription ends we delete or
        return it within a reasonable period, unless the law requires us to keep it longer.
      </p>
    ),
  },
  {
    title: "Your rights",
    body: (
      <>
        <p>
          Depending on where you live, you may have the right to access, correct, delete or export your personal data, and to object
          to or restrict its processing.
        </p>
        <p>
          If you are a lead or client of one of our customers, please contact that company first, because it controls your record.
          We will help them respond.
        </p>
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        The application uses a strictly necessary session cookie to keep you signed in. It does not use advertising cookies. Basic
        analytics on this website do not identify individual visitors.
      </p>
    ),
  },
  {
    title: "Changes and contact",
    body: (
      <p>
        We may update this policy and will change the date at the top when we do. Questions or requests can be sent to{" "}
        <a href={`mailto:${SITE.contactEmail}`} className="text-foreground underline">
          {SITE.contactEmail}
        </a>
        .
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      summary="What personal data the platform handles, why we handle it, and how we keep it safe."
      sections={sections}
    />
  );
}
