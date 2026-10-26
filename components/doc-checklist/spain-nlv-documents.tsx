"use client";

import type { ChecklistTemplate } from "./types";

export const SPAIN_NLV_CHECKLIST: ChecklistTemplate = {
  id: "spain-nlv",
  name: "Documents required for Non-Lucrative Visa",
  sections: [
    {
      title: "",
      items: [],
      guidance: {
        intro: "Eligibility Criteria",
        bullets: [
          "You must not work or earn income in Spain (remote work is generally not allowed under NLV).",
          "You must have sufficient financial means to support yourself and any dependents.",
          "You must be a legal resident in the UAE (holding a valid residence visa or Emirates ID valid for at least 6 months at the time of the visa submission).",
        ],
      },
    },
    {
      title: "Required Documents",
      items: [
        {
          id: "spain-nlv-visa-form",
          label: "Completed National Visa Application Form — filled and signed",
        },
        {
          id: "spain-nlv-passport",
          label:
            "Valid Passport — minimum validity of 1 year, with at least two blank pages; plus photocopy of all pages (even blank ones)",
        },
        {
          id: "spain-nlv-uae-residence",
          label:
            "UAE Residence Visa & Emirates ID — valid at the time of application; copies of both needed",
        },
        {
          id: "spain-nlv-photograph-1",
          label: "Passport-Size Photograph 1 — recent color photo, white background",
        },
        {
          id: "spain-nlv-photograph-2",
          label: "Passport-Size Photograph 2 — recent color photo, white background",
        },
        {
          id: "spain-nlv-refusals",
          label:
            "Immigration History: Any refusals from any country (provide the date, country, and reason)",
        },
        {
          id: "spain-nlv-schengen",
          label: "Immigration History: Copy of Schengen visas, including expired ones",
        },
        {
          id: "spain-nlv-accommodation-uae",
          label: "Accommodation proof in UAE (Utility Bills, Tenancy Contract)",
        },
        {
          id: "spain-nlv-bank-statements",
          label: "Proof of Financial Means: Bank statements (last 6–12 months)",
        },
        {
          id: "spain-nlv-income-proof",
          label:
            "Proof of Financial Means: Income proof, investments, pension, or savings",
        },
      ],
      sectionNote:
        "Financial documents must show: the full name and address of the bank or financial institution; the complete identification of the accounts; the opening or closing date of the accounts, or, if applicable, the dates when authorization was granted and revoked.",
    },
    {
      title: "Proof of Financial Means — Required minimum",
      items: [],
      sectionNote:
        "€2,400/month for the main applicant (~€28,800/year). €600/month per dependent (~€7,200/year per person). Amounts must be readily available in your name.",
    },
    {
      title: "8. Medical Certificate",
      items: [
        {
          id: "spain-nlv-medical-doctor",
          label: "Issued by a licensed medical doctor in the UAE",
        },
        {
          id: "spain-nlv-medical-letterhead",
          label:
            "On clinic or hospital letterhead, with doctor's stamp and signature",
        },
        {
          id: "spain-nlv-medical-dated",
          label: "Dated within 3 months of your visa application",
        },
        {
          id: "spain-nlv-medical-wording",
          label:
            "Contains this official wording (as required by Spanish authorities): This medical certificate confirms that Mr./Ms. [Full Name] does not suffer from any disease that could have serious public health repercussions in accordance with the 2005 International Health Regulations (IHR).",
        },
        {
          id: "spain-nlv-medical-mofa",
          label: "Attestation & Legalization: Attest it at UAE Ministry of Foreign Affairs (MOFA)",
        },
        {
          id: "spain-nlv-medical-embassy",
          label: "Attestation & Legalization: Legalize it at the Spanish Embassy/Consulate in the UAE",
        },
        {
          id: "spain-nlv-medical-translate",
          label: "Attestation & Legalization: May require translation to Spanish (check with embassy)",
        },
      ],
    },
    {
      title: "9. Private Health Insurance",
      sectionNote:
        "Must be with a provider authorized to operate in Spain. Must provide full coverage with no co-payments or waiting periods. Be from a private insurance provider (not travel insurance).",
      items: [
        {
          id: "spain-nlv-insurance-coverage",
          label:
            "Cover all medical expenses — including emergencies, hospitalization, and repatriation",
        },
        {
          id: "spain-nlv-insurance-copay",
          label: "Have zero co-pay/deductibles (100% coverage)",
        },
        {
          id: "spain-nlv-insurance-validity",
          label:
            "Be valid in Spain for the full duration of your visa (usually 1 year or more)",
        },
        {
          id: "spain-nlv-insurance-issued",
          label: "Be issued before applying for the visa",
        },
      ],
      guidance: {
        intro: "Some Spanish insurers that are popular with NLV applicants:",
        bullets: [
          "Adeslas (SegurCaixa)",
          "Sanitas",
          "ASISA",
          "DKV Seguros",
          "Axa Spain",
        ],
      },
    },
    {
      title: "Insurance certificate",
      items: [
        {
          id: "spain-nlv-insurance-cert",
          label: "Insurance certificate or policy letter (English or Spanish — must show: your name, policy number, duration, coverage in Spain, and 100% coverage)",
        },
      ],
    },
    {
      title: "10. Police Clearance Certificate",
      items: [
        { id: "spain-nlv-police-mofa", label: "Attested by MOFA" },
        {
          id: "spain-nlv-police-embassy",
          label: "Legalization from the Spanish Embassy",
        },
        {
          id: "spain-nlv-police-translate",
          label: "Translate to Spanish, if required",
        },
      ],
    },
    {
      title: "11. Proof of Accommodation in Spain",
      items: [
        {
          id: "spain-nlv-accommodation-spain",
          label:
            "Lease agreement, property deed, or a letter from a hotel/hostel",
        },
      ],
    },
  ],
  footerBlocks: [
    {
      type: "paragraph",
      text: "You can apply online or through an English-speaking agent. Plans start from around €40–€100/month depending on age and coverage.",
      italic: true,
    },
  ],
};
