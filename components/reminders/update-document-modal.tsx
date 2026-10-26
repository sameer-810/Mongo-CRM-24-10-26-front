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
import {
  Loader2,
  FileText,
  Calendar as CalendarIcon,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentAction } from "@/app/documents/actions";
import { ExpiryDocumentWithLead } from "@/lib/types";

interface UpdateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: ExpiryDocumentWithLead | null;
  onSuccess?: () => void;
}

export function UpdateDocumentModal({
  open,
  onOpenChange,
  document,
  onSuccess,
}: UpdateDocumentModalProps) {
  const { toast } = useToast();
  const [documentLabel, setDocumentLabel] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

  // Initialize form when document changes
  useEffect(() => {
    if (document) {
      setDocumentLabel(document.documentLabel || "");
      // Set expiry date as Date object
      if (document.expiryDate) {
        setExpiryDate(new Date(document.expiryDate));
      } else {
        setExpiryDate(undefined);
      }
    }
  }, [document]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setDocumentLabel("");
      setExpiryDate(undefined);
      setFile(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 15MB",
          variant: "destructive",
        });
        e.target.value = ""; // Reset input
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpdate = async () => {
    if (!document) return;

    try {
      setIsUpdating(true);

      const formData = new FormData();

      // Only append expiryDate if it's provided
      if (expiryDate) {
        // Format date as YYYY-MM-DD for API
        const year = expiryDate.getFullYear();
        const month = String(expiryDate.getMonth() + 1).padStart(2, "0");
        const day = String(expiryDate.getDate()).padStart(2, "0");
        formData.append("expiryDate", `${year}-${month}-${day}`);
      }

      // Only append file if a new file is selected
      if (file) {
        formData.append("file", file);
      }

      const response = await updateDocumentAction(
        document.id.toString(),
        formData
      );

      if (response && (response as any).success) {
        toast({
          title: "Success",
          description: "Document updated successfully",
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error(
          (response as any)?.message || "Failed to update document"
        );
      }
    } catch (error: any) {
      console.error("Error updating document:", error);
      toast({
        title: "Error",
        description:
          error?.message || "Failed to update document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                Update Document
              </DialogTitle>
              <DialogDescription className="mt-1">
                Update the document label and expiry date.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="doc-label" className="text-sm font-medium">
              Document Label
            </Label>
            <Input
              id="doc-label"
              value={documentLabel}
              disabled
              className="h-10 bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Document label cannot be changed
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="doc-file" className="text-sm font-medium">
              <Upload className="w-4 h-4 inline mr-1" />
              Update File
              <span className="text-xs text-muted-foreground ml-2">
                (Max 15MB, Optional)
              </span>
            </Label>
            <Input
              id="doc-file"
              type="file"
              onChange={handleFileChange}
              className="h-10 cursor-pointer"
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                MB)
              </p>
            )}
            {!file && document.url && (
              <p className="text-xs text-muted-foreground">
                Current file will remain unchanged if no new file is selected
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="doc-expiry" className="text-sm font-medium">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Expiry Date
            </Label>
            <DatePicker
              date={expiryDate}
              onDateChange={setExpiryDate}
              placeholder="Pick a date"
              title="Select Expiry Date"
              allowPastDates={false}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
            className="h-10"
          >
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating} className="h-10">
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Document"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
