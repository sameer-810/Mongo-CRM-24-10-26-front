"use client";

import { useState } from "react";
import type {
  ChecklistTemplate,
  ChecklistItem,
  ChecklistFooterBlock,
} from "./types";
import type { ChecklistDoc } from "./checklist-upload-modal";
import { ChecklistUploadModal } from "./checklist-upload-modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Upload, Pencil, Trash2, Calendar, Clock, Check, X, Eye, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  deleteDocumentAction,
  updateDocumentAction,
} from "@/app/documents/actions";

export type DocumentChecklistDoc = {
  id: number;
  documentLabel: string;
  url: string;
  expiryDate?: string;
  createdAt?: string;
};

interface DocumentChecklistViewProps {
  template: ChecklistTemplate;
  leadId: string;
  documents: DocumentChecklistDoc[];
  onRefresh: () => void;
}

function SectionGuidance({ guidance }: { guidance: { intro: string; bullets: string[] } }) {
  return (
    <div className="space-y-1.5 pl-0">
      <p className="text-sm text-foreground">{guidance.intro}</p>
      <ul className="list-disc pl-5 space-y-0.5 text-sm text-foreground">
        {guidance.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  );
}

function ItemNoteAndProcess({ item }: { item: ChecklistItem }) {
  const hasNote = item.note || item.noteItalic || (item.processSteps && item.processSteps.length > 0);
  if (!hasNote) return null;
  return (
    <div className="mt-2 space-y-1.5 pl-0">
      {item.note && (
        <p className="text-sm text-red-600 font-medium">{item.note}</p>
      )}
      {item.noteItalic && (
        <p className="text-sm text-red-600 italic">{item.noteItalic}</p>
      )}
      {item.processSteps && item.processSteps.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-bold text-red-600">PROCESS:</p>
          <ol className="list-decimal pl-5 space-y-0.5 text-sm text-red-600">
            {item.processSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function FooterBlocks({ blocks }: { blocks: ChecklistFooterBlock[] }) {
  return (
    <div className="space-y-4 pt-4 border-t">
      {blocks.map((block, idx) => {
        if (block.type === "process") {
          return (
            <div key={idx} className="space-y-1">
              <p className="text-sm font-bold text-red-600">PROCESS:</p>
              <ol className="list-decimal pl-5 space-y-0.5 text-sm text-red-600 italic">
                {block.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          );
        }
        if (block.type === "paragraph") {
          return (
            <p
              key={idx}
              className={cn(
                "text-sm text-foreground",
                block.italic && "italic"
              )}
            >
              {block.text}
            </p>
          );
        }
        if (block.type === "bullets") {
          return (
            <div key={idx} className="space-y-1">
              {block.intro && (
                <p
                  className={cn(
                    "text-sm text-foreground",
                    block.italic && "italic"
                  )}
                >
                  {block.intro}
                </p>
              )}
              <ul
                className={cn(
                  "list-disc pl-5 space-y-0.5 text-sm",
                  block.italic && "italic text-foreground"
                )}
              >
                {block.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          );
        }
        if (block.type === "note") {
          return (
            <div key={idx} className="space-y-1">
              <p className="text-sm font-bold text-foreground">NOTE:</p>
              <div className="space-y-0.5">
                {block.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm italic text-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export function DocumentChecklistView({
  template,
  leadId,
  documents,
  onRefresh,
}: DocumentChecklistViewProps) {
  const { toast } = useToast();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [existingDoc, setExistingDoc] = useState<ChecklistDoc | null>(null);
  const [editingExpiryDocId, setEditingExpiryDocId] = useState<number | null>(null);
  const [editExpiryDate, setEditExpiryDate] = useState<Date | undefined>(undefined);

  const openUpload = (itemId: string, itemLabel: string) => {
    const doc = documents.find((d) => d.documentLabel === itemId);
    setSelectedItem({ id: itemId, label: itemLabel });
    setExistingDoc(
      doc
        ? {
          id: doc.id,
          documentLabel: doc.documentLabel,
          url: doc.url,
          expiryDate: doc.expiryDate,
        }
        : null
    );
    setUploadModalOpen(true);
  };

  const closeUpload = () => {
    setUploadModalOpen(false);
    setSelectedItem(null);
    setExistingDoc(null);
  };

  const hasDoc = (itemId: string) =>
    documents.some((d) => d.documentLabel === itemId);

  const getDocForItem = (itemId: string) =>
    documents.find((d) => d.documentLabel === itemId) ?? null;

  const handleDeleteDoc = async (docId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const response = await deleteDocumentAction(String(docId));
      if ((response as any)?.success !== false) {
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
        onRefresh();
      } else {
        throw new Error((response as any)?.message || "Delete failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleSaveExpiry = async (docId: number) => {
    try {
      const formData = new FormData();
      if (editExpiryDate) {
        const y = editExpiryDate.getFullYear();
        const m = String(editExpiryDate.getMonth() + 1).padStart(2, "0");
        const d = String(editExpiryDate.getDate()).padStart(2, "0");
        formData.append("expiryDate", `${y}-${m}-${d}`);
      }
      const response = await updateDocumentAction(String(docId), formData);
      if ((response as any)?.success !== false) {
        toast({
          title: "Success",
          description: "Expiry date updated",
        });
        setEditingExpiryDocId(null);
        setEditExpiryDate(undefined);
        onRefresh();
      } else {
        throw new Error((response as any)?.message || "Update failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update document",
        variant: "destructive",
      });
    }
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  const handleDownload = async (url: string, suggestedName?: string) => {
    const cleanUrl = url.split("?")[0];
    const fileFromUrl = cleanUrl.split("/").pop() || "file";
    const filename = (suggestedName && suggestedName.trim()) || fileFromUrl;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to download file");
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to download file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-foreground text-center">
        {template.name}
      </h3>

      <div className="space-y-6">
        {template.sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-2">
            {section.title ? (
              <h4
                className={cn(
                  "text-sm font-bold text-foreground",
                  section.titleUnderline && "underline"
                )}
              >
                {section.title}
              </h4>
            ) : null}

            {section.sectionNote ? (
              <p className="text-sm font-bold text-foreground underline">
                {section.sectionNote}
              </p>
            ) : null}

            {section.guidance && section.items.length === 0 ? (
              <SectionGuidance guidance={section.guidance} />
            ) : null}

            {section.items.length > 0 ? (
              <div className="space-y-0 rounded-md border bg-card overflow-hidden">
                {section.items.map((item, itemIdx) => {
                  const uploaded = hasDoc(item.id);
                  const doc = uploaded ? getDocForItem(item.id) : null;
                  const hasExtra =
                    item.note || item.noteItalic || (item.processSteps && item.processSteps.length > 0);
                  const isEditingExpiry = doc && editingExpiryDocId === doc.id;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "border-b last:border-b-0",
                        uploaded && "bg-muted/30"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 min-h-[44px]",
                          hasExtra && "items-start"
                        )}
                      >
                        <Checkbox
                          checked={uploaded}
                          disabled
                          className="shrink-0 pointer-events-none mt-0.5"
                        />
                        <span className="flex-1 text-sm text-foreground min-w-0">
                          <span className="font-medium mr-1">
                            {itemIdx + 1}.
                          </span>
                          {item.label}
                        </span>
                        <Button
                          type="button"
                          variant={uploaded ? "outline" : "default"}
                          size="sm"
                          className="shrink-0"
                          onClick={() => openUpload(item.id, item.label)}
                        >
                          {uploaded ? (
                            <>
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5 mr-1" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                      {uploaded && doc && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 pb-2.5 pl-9 flex-wrap">
                          {isEditingExpiry ? (
                            <div className="flex items-center gap-2">
                              <DatePicker
                                date={editExpiryDate}
                                onDateChange={setEditExpiryDate}
                                placeholder="Pick expiry date"
                                title="Expiry date"
                                allowPastDates
                                buttonClassName="w-[180px] h-8 text-xs"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 shrink-0"
                                onClick={() => handleSaveExpiry(doc.id)}
                              >
                                <Check className="h-3.5 w-3.5 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 shrink-0"
                                onClick={() => {
                                  setEditingExpiryDocId(null);
                                  setEditExpiryDate(undefined);
                                }}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span
                                className="cursor-pointer hover:text-primary transition-colors inline-flex items-center gap-1 shrink-0"
                                onClick={() => {
                                  setEditingExpiryDocId(doc.id);
                                  setEditExpiryDate(
                                    doc.expiryDate
                                      ? new Date(doc.expiryDate)
                                      : undefined
                                  );
                                }}
                                title="Click to edit"
                              >
                                <Calendar className="w-3 h-3 shrink-0" />
                                {doc.expiryDate ? (
                                  <>
                                    Expires:{" "}
                                    {format(
                                      new Date(doc.expiryDate),
                                      "MMM d, yyyy"
                                    )}
                                  </>
                                ) : (
                                  "Add expiry date"
                                )}
                              </span>
                              {doc.createdAt && (
                                <>
                                  <span className="mx-1 shrink-0">•</span>
                                  <span className="inline-flex items-center gap-1 shrink-0">
                                    <Clock className="w-3 h-3" />
                                    {format(
                                      new Date(doc.createdAt),
                                      "MMM d, yyyy"
                                    )}
                                  </span>
                                </>
                              )}
                              <span className="mx-1 shrink-0">•</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 hover:text-primary hover:bg-primary/10"
                                onClick={() => handleView(doc.url)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 hover:text-primary hover:bg-primary/10"
                                onClick={() =>
                                  handleDownload(doc.url, doc.documentLabel || "image")
                                }
                              >
                                <Download className="h-3.5 w-3.5 mr-1" />
                                Download
                              </Button>
                              <span className="mx-1 shrink-0">•</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteDoc(doc.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      {hasExtra && (
                        <div className="px-3 pb-2.5 pl-9">
                          <ItemNoteAndProcess item={item} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {template.footerBlocks && template.footerBlocks.length > 0 && (
        <FooterBlocks blocks={template.footerBlocks} />
      )}

      {selectedItem && (
        <ChecklistUploadModal
          open={uploadModalOpen}
          onOpenChange={(open) => {
            if (!open) closeUpload();
          }}
          fieldName={selectedItem.label}
          documentLabelId={selectedItem.id}
          leadId={leadId}
          existingDoc={existingDoc}
          onSuccess={() => {
            onRefresh();
            closeUpload();
          }}
        />
      )}
    </div>
  );
}