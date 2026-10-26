"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  ArrowLeft,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  Eye,
  Plus,
  Check,
  ChevronsUpDown,
  Loader2,
  XCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AddDocumentModal } from "@/components/documents/add-document-modal";
import { formatDate } from "@/lib/format-utils";
import {
  getDocumentsByLeadIdAction,
  deleteDocumentAction,
  updateDocumentAction,
  getLeadsAction,
} from "./actions";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { GetDocumentsByLeadIdResponseType } from "@/lib/types";

interface Document {
  id: number;
  url: string;
  documentLabel: string;
  expiryDate?: string;
  leadId: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const initialLeadId = searchParams.get("leadId");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    initialLeadId || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [leadIds, setLeadIds] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editExpiryDateValue, setEditExpiryDateValue] = useState("");
  const [docToDelete, setDocToDelete] = useState<number | null>(null);

  // Fetch leads with debounce
  useEffect(() => {
    if (searchQuery) {
      const fetchLeads = async () => {
        setLoadingLeads(true);
        try {
          const response = await getLeadsAction(searchQuery);
          if (response && (response as any).success) {
            setLeadIds((response as any).data);
          }
        } catch (error) {
          console.error("Failed to fetch leads:", error);
          toast({
            title: "Error",
            description: "Failed to load leads",
            variant: "destructive",
          });
        } finally {
          setLoadingLeads(false);
        }
      };

      const timer = setTimeout(() => {
        fetchLeads();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, toast]);

  // Handle initial leadId from URL
  useEffect(() => {
    if (initialLeadId) {
      setSelectedLeadId(initialLeadId);
      setSearchQuery(initialLeadId);
      fetchDocuments(initialLeadId);

      const fetchLeadDetails = async () => {
        try {
          const response = await getLeadsAction(initialLeadId);
          if (response && (response as any).success) {
            setLeadIds((response as any).data);
          }
        } catch (error) {
          console.error("Failed to fetch initial lead details:", error);
        }
      };
      fetchLeadDetails();
    }
  }, [initialLeadId]);

  const fetchDocuments = async (leadId: string) => {
    if (!leadId) return;

    setIsLoading(true);
    try {
      const response = await getDocumentsByLeadIdAction(leadId);
      if (response && (response as GetDocumentsByLeadIdResponseType).success) {
        setDocuments((response as any).data || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch documents",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteDocumentAction(id.toString());
      if (response && (response as any).success) {
        toast({
          title: "Success",
          description: "Document deleted successfully",
          variant: "success",
        });
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setDocToDelete(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete document",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEditLabel = async (doc: Document) => {
    if (!editLabel.trim()) return;

    try {
      const formData = new FormData();
      formData.append("documentLabel", editLabel.trim());
      formData.append("expiryDate", editExpiryDateValue);

      const response = await updateDocumentAction(doc.id.toString(), formData);
      if (response && (response as any).success) {
        toast({
          title: "Success",
          description: "Document updated successfully",
          variant: "success",
        });
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === doc.id
              ? {
                  ...d,
                  documentLabel: editLabel,
                  expiryDate: editExpiryDateValue || d.expiryDate,
                }
              : d
          )
        );
        setEditingDoc(null);
        setEditLabel("");
        setEditExpiryDateValue("");
      } else {
        toast({
          title: "Error",
          description: "Failed to update document",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    window.open(url, "_blank");
  };

  const handleView = (url: string) => {
    window.open(url, "_blank");
  };

  if (isLoading && !selectedLeadId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto py-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          {selectedLeadId && (
            <p className="text-muted-foreground">
              Managing documents for Lead ID:{" "}
              <span className="font-medium text-foreground">
                {selectedLeadId}
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className={cn(
                    "w-full justify-between",
                    !selectedLeadId && "text-muted-foreground"
                  )}
                >
                  {selectedLeadId
                    ? leadIds.find((lead) => String(lead.id) === selectedLeadId)
                        ?.id || "Select lead..."
                    : "Select lead..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search leads..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {loadingLeads ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                        Loading leads...
                      </div>
                    ) : leadIds.length === 0 ? (
                      <CommandEmpty>No leads found.</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {leadIds.map((lead) => (
                          <CommandItem
                            className="!bg-transparent !text-primary cursor-pointer"
                            key={lead.id}
                            value={String(lead.name)}
                            onSelect={() => {
                              const id = String(lead.id);
                              setSelectedLeadId(id);
                              setOpenCombobox(false);
                              fetchDocuments(id);
                              // Update URL
                              router.push(`/documents?leadId=${id}`);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedLeadId === String(lead.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{lead.id}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!selectedLeadId}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Document
          </Button>
        </div>
      </div>

      {!selectedLeadId ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Lead Selected</h3>
              <p className="text-muted-foreground mb-4">
                Please select a lead from the dropdown above to view and manage
                their documents.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>File URL</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground"
                      >
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        No documents found for this lead.
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {editingDoc?.id === doc.id ? (
                            <Input
                              className="h-8 text-sm w-full"
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              placeholder="Document Label"
                              autoFocus
                            />
                          ) : (
                            doc.documentLabel
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {doc.url}
                          </a>
                        </TableCell>
                        <TableCell>
                          {editingDoc?.id === doc.id ? (
                            <Input
                              type="date"
                              className="h-8 text-sm w-full"
                              value={editExpiryDateValue}
                              onChange={(e) =>
                                setEditExpiryDateValue(e.target.value)
                              }
                              placeholder="Expiry Date (Optional)"
                            />
                          ) : doc.expiryDate ? (
                            formatDate(new Date(doc.expiryDate))
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>
                          {formatDate(new Date(doc.createdAt))}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingDoc?.id === doc.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                className="h-8"
                                onClick={() => handleEditLabel(doc)}
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8"
                                onClick={() => {
                                  setEditingDoc(null);
                                  setEditLabel("");
                                  setEditExpiryDateValue("");
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleView(doc.url)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDownload(
                                      doc.url,
                                      doc.documentLabel || "document"
                                    )
                                  }
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingDoc(doc);
                                    setEditLabel(doc.documentLabel);
                                    // Format expiry date for date input (YYYY-MM-DD)
                                    setEditExpiryDateValue(
                                      doc.expiryDate
                                        ? new Date(doc.expiryDate)
                                            .toISOString()
                                            .split("T")[0]
                                        : ""
                                    );
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDocToDelete(doc.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <AddDocumentModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        leadId={selectedLeadId || undefined}
        onSuccess={() => {
          if (selectedLeadId) {
            fetchDocuments(selectedLeadId);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!docToDelete}
        onOpenChange={() => setDocToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onClick={() => {
                if (docToDelete) {
                  handleDelete(docToDelete);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
