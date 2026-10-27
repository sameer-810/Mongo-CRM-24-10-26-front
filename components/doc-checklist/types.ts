export type ChecklistItem = {
  id: string;
  label: string;
  /** Shown below the item in red */
  note?: string;
  /** Red italic text (e.g. *Please note...*) */
  noteItalic?: string;
  /** "PROCESS:" heading (red bold) + numbered steps (red) */
  processSteps?: string[];
};

export type ChecklistSection = {
  title: string;
  items: ChecklistItem[];
  /** Render section title with underline */
  titleUnderline?: boolean;
  /** Intro line + bullet list (e.g. FiveM guidance) */
  guidance?: { intro: string; bullets: string[] };
  /** Single line below section heading (e.g. bold + underlined instruction) */
  sectionNote?: string;
};

export type ChecklistFooterBlock =
  | { type: "process"; steps: string[] }
  | { type: "paragraph"; text: string; italic?: boolean }
  | { type: "bullets"; intro?: string; items: string[]; italic?: boolean }
  | { type: "note"; paragraphs: string[] };

export type ChecklistTemplate = {
  id: string;
  name: string;
  sections: ChecklistSection[];
  /** Rendered after sections (maintenance funds, NOTE, etc.) */
  footerBlocks?: ChecklistFooterBlock[];
};
