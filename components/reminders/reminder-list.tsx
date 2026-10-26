"use client";

import { useState } from "react";
import { Search, FileText, Edit, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpiryDocumentWithLead } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { UpdateDocumentModal } from "./update-document-modal";
import { LeadsSkeleton } from "../skeletons/leads-skeleton";

interface ReminderListProps {
  isLoading: boolean;
  expiryDocuments: ExpiryDocumentWithLead[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
  onClearSearch: () => void;
}

const ReminderList = ({
  isLoading,
  expiryDocuments,
  searchTerm,
  setSearchTerm,
  onRefresh,
  onClearSearch,
}: ReminderListProps) => {
  const [selectedDocument, setSelectedDocument] =
    useState<ExpiryDocumentWithLead | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  // Calculate days until expiry
  const getExpiryInDays = (expiryDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch {
      return dateStr;
    }
  };

  // Get expiry badge variant based on days
  const getExpiryBadgeVariant = (
    days: number
  ): "default" | "destructive" | "secondary" => {
    if (days < 0) return "destructive"; // Expired
    if (days <= 7) return "destructive"; // Expiring soon
    if (days <= 30) return "secondary"; // Warning
    return "default"; // OK
  };

  // Sort documents by expiry date (API handles filtering)
  const sortedDocuments = [...expiryDocuments].sort((a, b) => {
    const daysA = getExpiryInDays(a.expiryDate);
    const daysB = getExpiryInDays(b.expiryDate);
    return daysA - daysB; // Sort by expiry days (soonest first)
  });

  return (
    <div className="min-h-screen bg-muted/20 p-6 space-y-8">
      {/* Header Card */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Document Expiry Reminders
            </h1>
            <p className="text-muted-foreground mt-1">
              Track documents that are expiring soon.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by lead name or document label..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 h-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                onClick={() => {
                  onClearSearch();
                }}
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LeadsSkeleton />
      ) : sortedDocuments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-dashed text-muted-foreground">
          <div className="bg-muted/50 p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-lg font-medium">No expiry documents found</p>
          <p className="text-sm">
            Documents expiring within 7 days will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Document Label</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Expiry in Days</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDocuments.map((doc) => {
                const expiryDays = getExpiryInDays(doc.expiryDate);
                const leadName =
                  doc.lead?.fullname ||
                  doc.lead?.formData?.fullname ||
                  doc.lead?.email ||
                  doc.lead?.formData?.email ||
                  `Lead #${doc.leadId || "N/A"}`;

                return (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{leadName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span>{doc.documentLabel}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(doc.expiryDate)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getExpiryBadgeVariant(expiryDays)}
                        className="font-semibold"
                      >
                        {expiryDays < 0
                          ? `Expired ${Math.abs(expiryDays)} days ago`
                          : expiryDays === 0
                          ? "Expires today"
                          : `${expiryDays} day${expiryDays !== 1 ? "s" : ""}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setIsUpdateModalOpen(true);
                        }}
                        title="Edit document"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Update Document Modal */}
      <UpdateDocumentModal
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        document={selectedDocument}
        onSuccess={() => {
          onRefresh();
        }}
      />
    </div>
  );
};

export default ReminderList;
