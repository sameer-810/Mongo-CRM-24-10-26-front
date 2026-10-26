"use client";

import { useState } from "react";
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
import { Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  uploadDocumentAction,
  getDocumentPresignedUrlAction,
  registerDocumentFromS3Action,
} from "@/app/documents/actions";

interface AddDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId?: string;
  onSuccess?: () => void;
}

export function AddDocumentModal({
  open,
  onOpenChange,
  leadId,
  onSuccess,
}: AddDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

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

  const handleUpload = async () => {
    if (!file || !label || !leadId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and select a lead",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      // 1. Get a pre-signed PUT URL from the backend (tiny request, under any limit)
      const presigned = await getDocumentPresignedUrlAction(file.name, file.type);
      if (!(presigned as any)?.data) throw new Error("Failed to get upload URL");
      const { uploadUrl, s3Key } = (presigned as any).data;

      // 2. Upload file directly to S3 — bypasses Amplify/CloudFront entirely
      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!s3Res.ok) throw new Error("Failed to upload file to storage");

      // 3. Register the metadata with the backend (tiny JSON payload)
      const formattedDate = expiryDate
        ? `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, "0")}-${String(expiryDate.getDate()).padStart(2, "0")}`
        : undefined;

      const response = await registerDocumentFromS3Action({
        s3Key,
        leadId: leadId!,
        documentLabel: label,
        ...(formattedDate ? { expiryDate: formattedDate } : {}),
      });

      if (response && (response as any).success) {
        toast({
          title: "Document Uploaded",
          description: `Successfully uploaded ${file.name} as "${label}"`,
          variant: "success",
        });

        setFile(null);
        setLabel("");
        setExpiryDate(undefined);
        onOpenChange(false);
        onSuccess?.();
      } else {
        throw new Error((response as any)?.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload failed", error);
      toast({
        title: "Upload Failed",
        description:
          error?.message ||
          "There was an error uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form when modal closes
  const handleClose = (open: boolean) => {
    if (!open) {
      setFile(null);
      setLabel("");
      setExpiryDate(undefined);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Upload a new document for this lead. Maximum file size is 15MB.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="doc-label">
              Document Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="doc-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Income Proof, Address Proof"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doc-file">
              Select File <span className="text-destructive">*</span>
              <span className="text-xs text-muted-foreground ml-2">
                (Max 15MB)
              </span>
            </Label>
            <Input
              id="doc-file"
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="doc-expiry">Expiry Date (Optional)</Label>
            <DatePicker
              date={expiryDate}
              onDateChange={setExpiryDate}
              placeholder="Pick a date"
              title="Select Expiry Date"
              allowPastDates={false}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !label || !leadId || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}