"use client";

import type { ChecklistTemplate } from "./types";

export const SPAIN_DNV_CHECKLIST: ChecklistTemplate = {
  id: "spain-dnv",
  name: "Documents required for the Spain Digital Nomad Visa",
  sections: [
    {
      title: "Passport",
      items: [
        {
          id: "spain-dnv-passport",
          label: "Passport with at least 6 months' validity",
        },
      ],
    },
    {
      title: "UAE Residency",
      items: [
        {
          id: "spain-dnv-uae-residency",
          label:
            "Valid UAE residency visa + Emirates ID at least 6 months' validity at the time of the application",
        },
      ],
    },
    {
      title: "Clean criminal record from UAE (translated + legalized)",
      items: [
        { id: "spain-dnv-criminal-mofa", label: "Criminal Record: Attested by MOFA" },
        {
          id: "spain-dnv-criminal-embassy",
          label: "Criminal Record: Legalization from Spanish Embassy",
        },
        {
          id: "spain-dnv-criminal-translate",
          label: "Criminal Record: Translate to Spanish (if required)",
        },
      ],
    },
    {
      title: "Medical certificate from UAE (translated + legalized)",
      items: [
        {
          id: "spain-dnv-medical-doctor",
          label: "Medical Certificate: Issued by a licensed medical doctor in the UAE",
        },
        {
          id: "spain-dnv-medical-letterhead",
          label:
            "Medical Certificate: On clinic or hospital letterhead, with doctor's stamp and signature",
        },
        {
          id: "spain-dnv-medical-dated",
          label: "Medical Certificate: Dated within 3 months of your visa application",
        },
        {
          id: "spain-dnv-medical-wording",
          label:
            "Medical Certificate: Contains official wording (IHR) — confirms that Mr./Ms. [Full Name] does not suffer from any disease that could have serious public health repercussions in accordance with the 2005 International Health Regulations",
        },
        {
          id: "spain-dnv-medical-mofa",
          label: "Medical Certificate Attestation: UAE Ministry of Foreign Affairs (MOFA)",
        },
        {
          id: "spain-dnv-medical-embassy",
          label:
            "Medical Certificate Attestation: Spanish Embassy/Consulate in the UAE",
        },
        {
          id: "spain-dnv-medical-translate",
          label:
            "Medical Certificate Attestation: Translate to Spanish (check with embassy)",
        },
      ],
    },
    {
      title: "Private health insurance covering Spain",
      sectionNote:
        "Be from a private insurance provider (not travel insurance)",
      items: [
        {
          id: "spain-dnv-insurance-coverage",
          label:
            "Covers all medical expenses — including emergencies, hospitalization, and repatriation",
        },
        {
          id: "spain-dnv-insurance-copay",
          label: "Zero co-pay/deductibles (100% coverage)",
        },
        {
          id: "spain-dnv-insurance-validity",
          label:
            "Valid in Spain for the full duration of your visa (usually 1 year or more)",
        },
        {
          id: "spain-dnv-insurance-issued",
          label: "Issued before applying for the visa",
        },
      ],
      guidance: {
        intro: "Some Spanish insurers that are popular with DNV applicants:",
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
          id: "spain-dnv-insurance-cert",
          label: "Insurance certificate or policy letter (English or Spanish — must show: name, policy number, duration, coverage in Spain, 100% coverage)",
        },
      ],
    },
    {
      title: "Proof of remote work for non-Spanish clients/company",
      sectionNote:
        "Employment/freelance history (3+ months). Degree or 3 years' relevant experience. The company must be operating for 1+ years.",
      items: [
        { id: "spain-dnv-remote-payslips", label: "Payslips or invoices from clients" },
        {
          id: "spain-dnv-remote-contract",
          label: "Employment contract or freelance contract",
        },
        {
          id: "spain-dnv-remote-tax",
          label: "Tax returns or proof of business registration (for freelancers/self-employed)",
        },
        {
          id: "spain-dnv-remote-letter",
          label: "Letter from your employer confirming remote work and salary",
        },
      ],
    },
    {
      title: "Financial and supporting documents",
      items: [
        {
          id: "spain-dnv-bank-statements",
          label: "Bank statements — Last 6 months (original with bank stamp)",
        },
        {
          id: "spain-dnv-income-proof",
          label: "Income proof (payslips/contracts) — Last 3 months or ongoing",
        },
        {
          id: "spain-dnv-savings",
          label:
            "Savings — Show at least €7,000–€15,000 as backup funds (optional but helpful)",
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
    {
      type: "paragraph",
      text: "Sufficient Financial Means — DNV: ~€2,650/month (plus more for dependents).",
      italic: true,
    },
    {
      type: "bullets",
      intro: "In addition:",
      items: ["Spouse: €993 (75%)", "Children (each): €331 (25%)"],
      italic: true,
    },
    {
      type: "note",
      paragraphs: [
        "All documents must be in Spanish, translated by a certified translator.",
        "Application Process (UAE): 1) Prepare all documents (translated + legalized). 2) Book an appointment at the BLS Spain Visa Center (Dubai or Abu Dhabi). 3) Attend appointment with originals + copies. 4) Wait 1–2 months for processing. 5) Collect a visa and travel to Spain. 6) Apply for NIE + TIE card in Spain.",
      ],
    },
  ],
};
