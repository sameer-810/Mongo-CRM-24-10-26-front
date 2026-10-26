"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { FileText, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  uploadDocumentAction,
  updateDocumentAction,
  getDocumentPresignedUrlAction,
  registerDocumentFromS3Action,
  updateDocumentFromS3Action,
} from "@/app/documents/actions";

export type ChecklistDoc = {
  id: number;
  documentLabel: string;
  url: string;
  expiryDate?: string;
};

interface ChecklistUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  documentLabelId: string;
  leadId: string;
  existingDoc: ChecklistDoc | null;
  onSuccess: () => void;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export function ChecklistUploadModal({
  open,
  onOpenChange,
  fieldName,
  documentLabelId,
  leadId,
  existingDoc,
  onSuccess,
}: ChecklistUploadModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && existingDoc?.expiryDate) {
      setExpiryDate(new Date(existingDoc.expiryDate));
    } else if (open && !existingDoc) {
      setExpiryDate(undefined);
    }
  }, [open, existingDoc]);

  useEffect(() => {
    if (!open) {
      setFile(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0];
      if (selected.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 15MB",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async () => {
    const isEdit = !!existingDoc;
    if (!isEdit && !file) {
      toast({
        title: "Validation Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    if (isEdit && !file && !expiryDate) {
      toast({
        title: "Validation Error",
        description: "Select a new file or set expiry date to update",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingDoc) {
        // --- UPDATE path ---
        if (file) {
          // Upload replacement file directly to S3
          const presigned = await getDocumentPresignedUrlAction(file.name, file.type);
          if (!(presigned as any)?.data) throw new Error("Failed to get upload URL");
          const { uploadUrl, s3Key } = (presigned as any).data;
          const s3Res = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
          });
          if (!s3Res.ok) throw new Error("Failed to upload file to storage");

          const formattedDate = expiryDate
            ? `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, "0")}-${String(expiryDate.getDate()).padStart(2, "0")}`
            : undefined;
          const response = await updateDocumentFromS3Action(existingDoc.id.toString(), {
            s3Key,
            ...(formattedDate ? { expiryDate: formattedDate } : {}),
          });
          if (response && (response as any).success) {
            toast({ title: "Success", description: "Document updated successfully" });
            onOpenChange(false);
            onSuccess();
          } else {
            throw new Error((response as any)?.message || "Update failed");
          }
        } else {
          // Only updating metadata (expiry date), no new file
          const formData = new FormData();
          if (expiryDate) {
            const y = expiryDate.getFullYear();
            const m = String(expiryDate.getMonth() + 1).padStart(2, "0");
            const d = String(expiryDate.getDate()).padStart(2, "0");
            formData.append("expiryDate", `${y}-${m}-${d}`);
          }
          const response = await updateDocumentAction(existingDoc.id.toString(), formData);
          if (response && (response as any).success) {
            toast({ title: "Success", description: "Document updated successfully" });
            onOpenChange(false);
            onSuccess();
          } else {
            throw new Error((response as any)?.message || "Update failed");
          }
        }
      } else {
        // --- UPLOAD path: send file directly to S3, then register metadata ---
        const presigned = await getDocumentPresignedUrlAction(file!.name, file!.type);
        if (!(presigned as any)?.data) throw new Error("Failed to get upload URL");
        const { uploadUrl, s3Key } = (presigned as any).data;

        // PUT directly to S3 — never touches Amplify/CloudFront
        const s3Res = await fetch(uploadUrl, {
          method: "PUT",
          body: file!,
          headers: { "Content-Type": file!.type },
        });
        if (!s3Res.ok) throw new Error("Failed to upload file to storage");

        const formattedDate = expiryDate
          ? `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, "0")}-${String(expiryDate.getDate()).padStart(2, "0")}`
          : undefined;

        const response = await registerDocumentFromS3Action({
          s3Key,
          leadId,
          documentLabel: documentLabelId,
          ...(formattedDate ? { expiryDate: formattedDate } : {}),
        });
        if (response && (response as any).success) {
          toast({ title: "Success", description: "Document uploaded successfully" });
          onOpenChange(false);
          onSuccess();
        } else {
          throw new Error((response as any)?.message || "Upload failed");
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle>
                {existingDoc ? "Edit Document" : "Upload Document"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {existingDoc
                  ? "Update the file or expiry date."
                  : "Select a file and optional expiry date."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Document</Label>
            <p className="text-sm text-muted-foreground rounded-md border bg-muted/30 px-3 py-2">
              {fieldName}
            </p>
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              {existingDoc ? "Replace File" : "File"}
              <span className="text-muted-foreground ml-1 text-xs">Max 15MB</span>
            </Label>
            {/* show the existing file name */}
            {existingDoc && (
              <p className="text-xs text-muted-foreground">
                Current file: {existingDoc.url}
              </p>
            )}
            <Input
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
            {existingDoc && !file && (
              <p className="text-xs text-muted-foreground">
                Leave empty to keep current file
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="text-sm font-medium">Expiry Date (optional)</Label>
            <DatePicker
              date={expiryDate}
              onDateChange={setExpiryDate}
              placeholder="Pick a date"
              title="Expiry Date"
              allowPastDates
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {existingDoc ? "Updating..." : "Uploading..."}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {existingDoc ? "Update" : "Upload"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}