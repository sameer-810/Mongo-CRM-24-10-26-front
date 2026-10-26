"use client";

import type { ChecklistTemplate } from "./types";

export const UK_INNOVATOR_CHECKLIST: ChecklistTemplate = {
  id: "uk-innovator",
  name: "Required Documents for UK Innovator Founder Visa",
  sections: [
    {
      title: "Documents from the Main Applicant",
      items: [
        { id: "uk-innovator-passport", label: "Copy of Current Passport — All pages" },
        {
          id: "uk-innovator-uae-visa",
          label: "Copy of UAE Visa Permit (if applying from the UAE)",
        },
        {
          id: "uk-innovator-emirates-id",
          label: "Copy of Emirates ID (if applying from the UAE)",
        },
        {
          id: "uk-innovator-national-id",
          label: "Copy of National ID (if available)",
        },
        {
          id: "uk-innovator-email",
          label: "Generated Email Address with its password (share the password privately)",
        },
      ],
    },
    {
      title: "Immigration History",
      items: [
        {
          id: "uk-innovator-travel-history",
          label:
            "Last 10 years Travel History — do not include home country and country of residence",
        },
        {
          id: "uk-innovator-previous-uk",
          label: "Previous UK Visa application (if any)",
        },
        {
          id: "uk-innovator-refusals",
          label:
            "Any refusals from any country (provide the date, country, and reason)",
        },
      ],
    },
    {
      title: "Residential Proof",
      items: [
        {
          id: "uk-innovator-tenancy",
          label: "Residential Tenancy Contract",
        },
        {
          id: "uk-innovator-title-deed",
          label: "Title Deed (if available)",
        },
      ],
    },
    {
      title: "Employment Documents (if employed)",
      items: [
        {
          id: "uk-innovator-employment-contract",
          label: "Employment Contract",
        },
        { id: "uk-innovator-salary-slips", label: "Salary Slips" },
      ],
    },
    {
      title: "Financial documents",
      items: [
        {
          id: "uk-innovator-bank-statement",
          label:
            "Personal Bank Statement — past 6 or 12 months, original with the bank's stamp",
        },
      ],
    },
    {
      title: "Qualifications/ Experience",
      items: [
        { id: "uk-innovator-cv", label: "CV" },
        { id: "uk-innovator-academic", label: "Academic Documents" },
        {
          id: "uk-innovator-experience-cert",
          label: "Experience Certificate",
        },
      ],
    },
    {
      title: "Knowledge of English (please provide any of the documents)",
      sectionNote:
        "IELTS Certificate: Minimum CEFR level required B2 — Components: Listening, Reading, Writing and Speaking. Other accepted: UK Naric; PSI Services 'Skills for English UKVI'; Pearson 'PTE Academic UKVI' or 'PTE Home'. Test and minimum scores: IELTS for UKVI — minimum 5.5 in each of the four components.",
      items: [
        {
          id: "uk-innovator-ielts",
          label: "IELTS Certificate (CEFR B2 — Listening, Reading, Writing, Speaking)",
        },
        {
          id: "uk-innovator-uk-naric",
          label: "UK Naric (qualification equivalency)",
        },
        {
          id: "uk-innovator-psi",
          label: "PSI Services: Skills for English UKVI",
        },
        {
          id: "uk-innovator-pearson",
          label: "Pearson: PTE Academic UKVI or PTE Home",
        },
      ],
    },
    {
      title: "Dependents' Documents",
      items: [
        { id: "uk-innovator-dep-passports", label: "All current passports" },
        {
          id: "uk-innovator-dep-uae-id",
          label: "Dependents' UAE Visa and Emirates ID",
        },
        { id: "uk-innovator-marriage-cert", label: "Marriage Certificate" },
        { id: "uk-innovator-birth-cert", label: "Children's Birth Certificates" },
        {
          id: "uk-innovator-dep-travel-history",
          label:
            "Last 10 years Travel History (excluding home country and country of residence)",
        },
        {
          id: "uk-innovator-dep-previous-uk",
          label: "Previous UK Visa application (if any)",
        },
        {
          id: "uk-innovator-dep-refusals",
          label:
            "Any refusals from any country (date, country, and reason)",
        },
      ],
    },
  ],
  footerBlocks: [
    {
      type: "paragraph",
      text: "Financial Requirements (Personal bank statement): Minimum funds to be maintained for 28 days prior to the visa application.",
      italic: true,
    },
    {
      type: "bullets",
      intro: "Required minimum:",
      items: [
        "Main Applicant: £1,270",
        "Spouse: £285",
        "First Child: £315",
        "Additional Child: £200 each",
      ],
      italic: true,
    },
    {
      type: "note",
      paragraphs: [
        "Special Requirement for Pakistan Applicants: If applying from Pakistan, a Tuberculosis (TB) Test is required. See: https://www.gov.uk/tb-test-visa/countries-where-you-need-a-tb-test-to-enter-the-uk",
      ],
    },
  ],
};
