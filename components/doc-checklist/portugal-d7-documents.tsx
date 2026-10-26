"use client";

import type { ChecklistTemplate } from "./types";

export const PORTUGAL_D7_CHECKLIST: ChecklistTemplate = {
  id: "portugal-d7",
  name: "Required Documents for Portugal D7 Visa",
  sections: [
    {
      title: "Documents from the Main Applicant",
      items: [
        {
          id: "portugal-d7-passport",
          label:
            "Copy of Current Passport MUST be valid for one year at the time of the visa submission",
        },
        { id: "portugal-d7-uae-visa", label: "Copy of UAE Visa Permit" },
        { id: "portugal-d7-emirates-id", label: "Copy of Emirates ID" },
        { id: "portugal-d7-national-id", label: "Copy of National ID (if available)" },
        {
          id: "portugal-d7-email",
          label: "Generated Email Address with a password (Bakerandco@123)",
        },
      ],
    },
    {
      title: "Immigration History",
      items: [
        {
          id: "portugal-d7-refusals",
          label:
            "Any refusals from any country (provide the date, country, and reason)",
        },
        {
          id: "portugal-d7-schengen",
          label: "Copy of Schengen visas, including expired ones.",
        },
      ],
    },
    {
      title: "Residential Proof",
      items: [
        { id: "portugal-d7-tenancy", label: "Residential Tenancy Contract" },
        { id: "portugal-d7-utility", label: "Utility Bills (recent)" },
        { id: "portugal-d7-title-deed", label: "Title Deed (if available)" },
      ],
    },
    {
      title: "Passive Income",
      items: [
        { id: "portugal-d7-property-docs", label: "Property documents" },
        { id: "portugal-d7-tenancy-agreement", label: "Tenancy agreement" },
        { id: "portugal-d7-cheques", label: "Cheques" },
        {
          id: "portugal-d7-bank-statement",
          label:
            "Bank statement showing the payment received in the account (past 12 months)",
        },
      ],
      sectionNote: "All must be attested by the Ministry of Foreign Affairs",
    },
    {
      title: "Employment Documents (if employed)",
      items: [
        { id: "portugal-d7-employment-contract", label: "Employment Contract" },
        { id: "portugal-d7-salary-slips", label: "Salary Slips" },
        {
          id: "portugal-d7-personal-bank-statement",
          label:
            "Personal Bank Statement for the past 12 months, online. (At the time of the visa application, we will request you to provide the original with bank stamp)",
        },
      ],
    },
    {
      title: "If Self-Employed",
      items: [
        { id: "portugal-d7-trade-license", label: "Company Trade License" },
        { id: "portugal-d7-moa", label: "MOA" },
      ],
    },
  ],
};
