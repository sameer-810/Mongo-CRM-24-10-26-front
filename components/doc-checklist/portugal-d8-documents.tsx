"use client";

import type { ChecklistTemplate } from "./types";

export const PORTUGAL_D8_CHECKLIST: ChecklistTemplate = {
  id: "portugal-d8",
  name: "Required Documents for Portugal D8 Visa",
  sections: [
    {
      title: "Documents from the Main Applicant",
      items: [
        {
          id: "portugal-d8-passport",
          label:
            "A copy of the Current Passport must be valid for at least one year at the time of the submission",
        },
        { id: "portugal-d8-uae-visa", label: "Copy of UAE Visa Permit" },
        { id: "portugal-d8-emirates-id", label: "Copy of Emirates ID" },
        { id: "portugal-d8-national-id", label: "Copy of National ID (if available)" },
        {
          id: "portugal-d8-email",
          label: "Generated Email Address with a password (Bakerandco@123)",
        },
      ],
    },
    {
      title: "Immigration History",
      items: [
        {
          id: "portugal-d8-refusals",
          label:
            "Any refusals from any country (provide the date, country, and reason)",
        },
        {
          id: "portugal-d8-schengen",
          label: "Copy of Schengen visas, including expired ones.",
        },
      ],
    },
    {
      title: "Residential Proof",
      items: [
        { id: "portugal-d8-tenancy", label: "Residential Tenancy Contract" },
        { id: "portugal-d8-utility", label: "Utility Bills (recent)" },
        { id: "portugal-d8-title-deed", label: "Title Deed (if available)" },
      ],
    },
    {
      title: "Employment Documents: If employed",
      items: [
        { id: "portugal-d8-employment-contract", label: "Employment Contract" },
        { id: "portugal-d8-salary-certificate", label: "Salary Certificate" },
        {
          id: "portugal-d8-personal-bank-statement",
          label:
            "Personal Bank Statement for the past 12 months, online. (At the time of the visa application, we will request you to provide the original MOFA attestation)",
        },
      ],
    },
    {
      title: "Employment Documents: If Self-Employed",
      items: [
        { id: "portugal-d8-trade-license", label: "Company Trade License" },
        { id: "portugal-d8-moa", label: "MOA" },
      ],
    },
    {
      title: "Qualifications/Experience",
      items: [
        { id: "portugal-d8-cv", label: "CV" },
        { id: "portugal-d8-academic", label: "Academic Documents" },
        { id: "portugal-d8-experience-cert", label: "Experience Certificate" },
      ],
    },
  ],
};
