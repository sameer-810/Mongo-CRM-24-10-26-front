"use client";

import type { ChecklistTemplate } from "./types";

export const PORTUGAL_D2_CHECKLIST: ChecklistTemplate = {
  id: "portugal-d2",
  name: "Required Documents for Portugal D2 Visa Application",
  sections: [
    {
      title: "Documents from the Main Applicant",
      items: [
        {
          id: "portugal-d2-passport",
          label:
            "A copy of the Current Passport must be valid for at least one year at the time of the submission",
        },
        { id: "portugal-d2-uae-visa", label: "Copy of UAE Visa Permit" },
        { id: "portugal-d2-emirates-id", label: "Copy of Emirates ID" },
        { id: "portugal-d2-national-id", label: "Copy of National ID (if available)" },
        {
          id: "portugal-d2-email",
          label: "Generated Email Address with its password (share the password privately)",
        },
      ],
    },
    {
      title: "Immigration History",
      items: [
        {
          id: "portugal-d2-refusals",
          label:
            "Any refusals from any country (provide the date, country, and reason)",
        },
        {
          id: "portugal-d2-schengen",
          label: "Copy of Schengen visas, including expired ones",
        },
      ],
    },
    {
      title: "Residential Proof, any of the following",
      items: [
        { id: "portugal-d2-tenancy", label: "Residential Tenancy Contract" },
        { id: "portugal-d2-utility", label: "Utility Bills (recent)" },
        { id: "portugal-d2-title-deed", label: "Title Deed (if available)" },
      ],
    },
    {
      title: "Employment Documents (if employed)",
      items: [
        { id: "portugal-d2-employment-contract", label: "Employment Contract" },
        { id: "portugal-d2-salary-slips", label: "Salary Slips" },
        {
          id: "portugal-d2-bank-statement",
          label:
            "Personal Bank Statement for the past 12 months, online. (At the time of the visa application, we will request you to provide the original with a bank stamp)",
        },
      ],
    },
    {
      title: "If Self-Employed",
      items: [
        { id: "portugal-d2-trade-license", label: "Company Trade License" },
        { id: "portugal-d2-moa", label: "MOA" },
      ],
    },
    {
      title: "Qualifications/ Experience, any of the following",
      items: [
        { id: "portugal-d2-cv", label: "CV" },
        { id: "portugal-d2-academic", label: "Academic Documents" },
        { id: "portugal-d2-experience-cert", label: "Experience Certificate" },
      ],
    },
    {
      title: "Dependents' Documents",
      items: [
        { id: "portugal-d2-dep-passports", label: "All current passports" },
        {
          id: "portugal-d2-dep-uae-id",
          label: "Dependents' UAE Visa and Emirates ID",
        },
        { id: "portugal-d2-marriage-cert", label: "Marriage Certificate" },
        { id: "portugal-d2-birth-cert", label: "Children's Birth Certificates" },
      ],
    },
    {
      title: "",
      items: [],
      guidance: {
        intro: "FiveM Infotech will guide you with the below requirements",
        bullets: [
          "NIF (Personal TAX-Number)",
          "Portugal Company Incorporation",
          "Bank Account Opening",
        ],
      },
    },
    {
      title:
        "Documents are required at the time of the visa application, we will advise you when to provide them.",
      titleUnderline: true,
      items: [
        {
          id: "portugal-d2-photograph-1",
          label: "Passport-sized Photograph 1 (identical)",
        },
        {
          id: "portugal-d2-photograph-2",
          label: "Passport-sized Photograph 2 (identical)",
        },
        {
          id: "portugal-d2-travel-insurance",
          label:
            "Valid Travel Insurance covering necessary medical expenses, including urgent medical assistance and possible repatriation. Must be one year valid from the date of the application",
        },
        {
          id: "portugal-d2-police-clearance",
          label:
            "Police clearance certificate, issued by the competent authority of the country of the applicant's nationality or of the country where the applicant has lived for over a year, with the Hague Apostille (if applicable) or legalised",
          note: "Note: Police clearance is required to be submitted with a UAE MoFA stamp and must be legalized by the Portuguese embassy prior to submitting an application to VFS; otherwise, it is not accepted.",
          noteItalic:
            "Please note that an appointment at the Portuguese Embassy is mandatory for legalization purposes. The appointment needs to be made online through: https://agendamentos.mne.gov.pt/pt/login",
          processSteps: [
            "Obtain the Police Clearance Certificate through the Dubai Police App.",
            "Have it attested by the Ministry of Foreign Affairs.",
            "Get it attested by the Portuguese Embassy.",
          ],
        },
        {
          id: "portugal-d2-lease-agreement",
          label: "Lease Agreement in Portugal (12 months)",
        },
        { id: "portugal-d2-portugal-bank", label: "Portugal Bank Statement" },
        {
          id: "portugal-d2-bank-statement-stamp",
          label:
            "Last 12 months' bank statement (Original with bank Stamp and MOA attestation)",
          processSteps: [
            "Obtain the bank statement from the bank, with the manager's signature and official stamp.",
            "Have it stamped by the Central Bank.",
            "Get it attested by the Ministry of Foreign Affairs.",
          ],
        },
      ],
    },
  ],
  footerBlocks: [
    {
      type: "paragraph",
      text: "Prior to submitting the visa application, the applicant must demonstrate maintenance funds of €10,440 in their bank account.",
      italic: true,
    },
    {
      type: "bullets",
      intro: "In addition to this amount:",
      items: [
        "A spouse requires an additional 50% (€5,000+)",
        "Each child requires an additional 30% (€3,000+)",
      ],
      italic: true,
    },
    {
      type: "note",
      paragraphs: [
        "The UAE visa permit/ID passport must have a minimum validity of six months at the time of visa application.",
        "Please be informed that all the documents must be in English or Portuguese only.",
      ],
    },
  ],
};
