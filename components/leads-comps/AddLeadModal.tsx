import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  FileSpreadsheet,
  User,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { COUNTRIES, VISA_CATEGORY_LABELS } from "@/lib/mock-data";
import { getAssignableUsersAction, bulkUploadLeadsAction } from "@/app/leads/actions";
import { BulkUploadResponseType, CreateLeadType } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
// import * as XLSX from 'xlsx';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (lead: any) => void;
  onBulkAdd?: (leads: any[]) => void;
  onUploaded?: () => void;
}

const leadSources = [
  "Website",
  "Referral",
  "Social Media",
  "Advertisement",
  "Cold Call",
  "Event",
];
const leadSubsources = [
  "Facebook",
  "LinkedIn",
  "Google Ads",
  "Partner",
  "Trade Show",
  "Direct",
];

export function AddLeadModal({
  isOpen,
  onClose,
  onAdd,
  onBulkAdd,
  onUploaded,
}: AddLeadModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("single");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<any[]>([]);
  const [bulkAssignedTo, setBulkAssignedTo] = useState<string>("");
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsUsersLoading(true);
      getAssignableUsersAction()
        .then((res) => {
          // getAssignableUsersAction returns a plain array of { id, name, role, email, avatar }
          setAssignableUsers(Array.isArray(res) ? res : []);
        })
        .catch((err) => console.error("Error fetching users:", err))
        .finally(() => setIsUsersLoading(false));
    }
  }, [isOpen]);

  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    email: "",
    whatsapp: "",
    jobTitle: "",
    leadSource: "",
    leadSubsource: "",
    monthlyIncome: "",
    country: "",
    targetCountry: "",
    visaCategory: "",
    notes: "",
    assignedTo: "",
  });

  const resetForm = () => {
    setFormData({
      fullname: "",
      phone: "",
      email: "",
      whatsapp: "",
      jobTitle: "",
      leadSource: "",
      leadSubsource: "",
      monthlyIncome: "",
      country: "",
      targetCountry: "",
      visaCategory: "",
      notes: "",
      assignedTo: "",
    });
    setUploadedFile(null);
    setParseError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setIsUploadSuccess(false);
    setSummary(null);
    setUploadError(null);
    setBulkAssignedTo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullname || !formData.phone || !formData.email) {
      toast({
        title: "Error",
        description:
          "Please fill in all required fields (Name, Phone, Email)",
        variant: "destructive",
      });
      return;
    }

    const submissionData: CreateLeadType = {
      fullname: formData.fullname,
      phone: formData.phone,
      email: formData.email,
      whatsapp: formData.whatsapp || undefined,
      jobTitle: formData.jobTitle || undefined,
      leadSource: formData.leadSource || undefined,
      leadSubsource: formData.leadSubsource || undefined,
      monthlyIncome: formData.monthlyIncome
        ? parseInt(formData.monthlyIncome)
        : undefined,
      country: formData.country || undefined,
      targetCountry: formData.targetCountry || undefined,
      visaCategory: formData.visaCategory || undefined,
      notes: formData.notes ? [formData.notes] : [],
      assignedTo: formData.assignedTo
        ? parseInt(formData.assignedTo)
        : undefined,
    };

    setIsUploading(true);
    const success = await (onAdd(submissionData) as any);
    setIsUploading(false);

    if (success) {
      resetForm();
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setParseError(null);
    setSummary(null);
    setIsUploadSuccess(false);
  };


  const handleBulkUpload = async () => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setSummary(null);
    setUploadProgress(0);
    setIsUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", uploadedFile);
    if (bulkAssignedTo) {
      formData.append("assignedTo", bulkAssignedTo);
    }

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const result = (await bulkUploadLeadsAction(
        formData
      )) as BulkUploadResponseType;

      clearInterval(progressInterval);

      if (result?.success) {
        const details = result.data ?? {};
        setSummary(details);
        setUploadProgress(100);
        setIsUploadSuccess(true);
        toast({
          title: "Bulk Upload Complete",
          description:
            result.message || `Imported ${details.processed ?? 0} leads.`,
        });

        if (onUploaded) onUploaded();

        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      } else {
        const errorMessage =
          result?.message || "Bulk upload failed. Please try again.";
        setUploadError(errorMessage);
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";
      setUploadError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    /* const template = [
      {
        'Lead Name': 'John Doe',
        'Phone': '+919876543210',
        'Email': 'john@example.com',
        'WhatsApp Number': '+919876543210',
        'Job Title': 'Software Engineer',
        'Country': 'India',
        'Target Country': 'Canada',
        'Visa Category': 'work_visa',
        'Monthly Income': '75000',
        'Current Position': 'Senior Developer',
        'Lead Source': 'Website',
        'Lead Subsource': 'Google Ads',
      },
    ];
  
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads Template');
    XLSX.writeFile(wb, 'lead_upload_template.xlsx'); */
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogClose className="absolute right-4 top-4 rounded-full p-2 bg-muted hover:bg-destructive/10 hover:text-destructive transition-all duration-200 opacity-100 z-50">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader className="pb-4 border-b sticky top-0 bg-background z-10 text-left!">
          <DialogTitle className="text-2xl font-bold text-primary text-left!">
            Add New Lead
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-muted/50 dark:bg-muted/30">
              <TabsTrigger value="single" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <User className="w-4 h-4" />
                Single Lead
              </TabsTrigger>
              <TabsTrigger value="bulk" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <FileSpreadsheet className="w-4 h-4" />
                Bulk Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="mt-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b">
                    <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary to-primary/60"></div>
                    <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="fullname" className="text-sm font-medium">
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="fullname"
                        value={formData.fullname}
                        onChange={(e) =>
                          setFormData({ ...formData, fullname: e.target.value })
                        }
                        placeholder="John Doe"
                        className="h-11 transition-all hover:bg-accent/50 w-full"
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Phone <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+971 50 123 4567"
                        className="h-11 transition-all hover:bg-accent/50 w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="john@example.com"
                        className="h-11 transition-all hover:bg-accent/50 w-full"
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) =>
                          setFormData({ ...formData, whatsapp: e.target.value })
                        }
                        placeholder="+971 50 123 4567"
                        className="h-11 transition-all hover:bg-accent/50 w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b">
                    <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary to-primary/60"></div>
                    <h3 className="text-sm font-semibold text-foreground">Location & Visa Details</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="country" className="text-sm font-medium">Current Country</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(v) =>
                          setFormData({ ...formData, country: v })
                        }
                      >
                        <SelectTrigger className="h-11 hover:bg-accent/50 transition-colors w-full">
                          <SelectValue placeholder="Select current country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="targetCountry" className="text-sm font-medium">Target Country</Label>
                      <Select
                        value={formData.targetCountry}
                        onValueChange={(v) =>
                          setFormData({ ...formData, targetCountry: v })
                        }
                      >
                        <SelectTrigger className="h-11 hover:bg-accent/50 transition-colors w-full">
                          <SelectValue placeholder="Select target country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="visaCategory" className="text-sm font-medium">Visa Category</Label>
                      <Select
                        value={formData.visaCategory}
                        onValueChange={(v) =>
                          setFormData({ ...formData, visaCategory: v })
                        }
                      >
                        <SelectTrigger className="h-11 hover:bg-accent/50 transition-colors w-full">
                          <SelectValue placeholder="Select visa category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(VISA_CATEGORY_LABELS).map(
                            ([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="jobTitle" className="text-sm font-medium">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) =>
                          setFormData({ ...formData, jobTitle: e.target.value })
                        }
                        placeholder="e.g., Software Engineer"
                        className="h-11 transition-all hover:bg-accent/50 w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b">
                    <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary to-primary/60"></div>
                    <h3 className="text-sm font-semibold text-foreground">Financial & Source Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="monthlyIncome" className="text-sm font-medium">Monthly Income (AED)</Label>
                      <Input
                        id="monthlyIncome"
                        type="number"
                        value={formData.monthlyIncome}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyIncome: e.target.value,
                          })
                        }
                        placeholder="e.g., 75000"
                        className="h-11 transition-all hover:bg-accent/50 w-full"
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="leadSource" className="text-sm font-medium">Lead Source</Label>
                      <Select
                        value={formData.leadSource}
                        onValueChange={(v) =>
                          setFormData({ ...formData, leadSource: v })
                        }
                      >
                        <SelectTrigger className="h-11 hover:bg-accent/50 transition-colors w-full">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {leadSources.map((source) => (
                            <SelectItem key={source} value={source}>
                              {source}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="leadSubsource" className="text-sm font-medium">Lead Subsource</Label>
                      <Select
                        value={formData.leadSubsource}
                        onValueChange={(v) =>
                          setFormData({ ...formData, leadSubsource: v })
                        }
                      >
                        <SelectTrigger className="h-11 hover:bg-accent/50 transition-colors w-full">
                          <SelectValue placeholder="Select subsource" />
                        </SelectTrigger>
                        <SelectContent>
                          {leadSubsources.map((subsource) => (
                            <SelectItem key={subsource} value={subsource}>
                              {subsource}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="assignedTo" className="text-sm font-medium">Assign Lead</Label>
                      <Select
                        value={formData.assignedTo}
                        onValueChange={(v) =>
                          setFormData({ ...formData, assignedTo: v })
                        }
                        disabled={isUsersLoading}
                      >
                        <SelectTrigger className="h-11 hover:bg-accent/50 transition-colors w-full">
                          <SelectValue placeholder={isUsersLoading ? "Loading users..." : "Select user to assign"} />
                        </SelectTrigger>
                        <SelectContent>
                          {assignableUsers.map((user) => (
                            <SelectItem key={user.id} value={String(user.id)}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-4 border-t mt-6">
                  <Button type="button" variant="outline" onClick={onClose} className="h-10 px-6">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUploading} className="h-10 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                    {isUploading ? "Adding..." : "Add Lead"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="bulk" className="mt-0 space-y-5">
              <div className="bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 border-2 border-dashed border-primary/30 dark:border-primary/20 rounded-xl p-10 text-center transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!uploadedFile ? (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-primary/5 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Upload Excel or CSV File
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      Select a file to upload multiple leads at once. Supports .xlsx, .xls, and .csv formats.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-10 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Browse Files
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-primary/5 flex items-center justify-center">
                      <FileSpreadsheet className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      {uploadedFile.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      File size: {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10 px-6"
                    >
                      Change File
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b">
                  <div className="h-6 w-1 rounded-full bg-gradient-to-b from-primary to-primary/60"></div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Assign Uploaded Leads
                  </h3>
                </div>
                <div className="space-y-2 w-full">
                  <Label
                    htmlFor="bulkAssignedTo"
                    className="text-sm font-medium"
                  >
                    Assign Lead
                  </Label>
                  <Select
                    value={bulkAssignedTo}
                    onValueChange={setBulkAssignedTo}
                    disabled={isUsersLoading}
                  >
                    <SelectTrigger className="h-11 hover:bg-accent/50 transition-colors w-full">
                      <SelectValue
                        placeholder={
                          isUsersLoading
                            ? "Loading users..."
                            : "Select user to assign uploaded leads"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {assignableUsers.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    If selected, all successfully imported leads will be
                    assigned to this user instead of auto-assignment.
                  </p>
                </div>
              </div>

              {parseError && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-5 flex items-start gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-destructive mb-1">Upload Error</p>
                    <p className="text-sm text-muted-foreground">{parseError}</p>
                  </div>
                </div>
              )}

              {(isUploading || uploadProgress > 0) && (
                <div className="space-y-3 p-5 bg-primary/5 dark:bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-foreground">Uploading leads...</span>
                    <span className="font-semibold text-primary">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {summary && (
                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-5 border shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground">Upload Summary</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-background/50 border">
                      <p className="text-xs text-muted-foreground mb-1">Total Processed</p>
                      <p className="text-2xl font-bold text-foreground">{summary.total || summary.processed || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-muted-foreground mb-1">Successful</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-500">{summary.success || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <p className="text-xs text-muted-foreground mb-1">Failed</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-500">{summary.failed || 0}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <p className="text-xs text-muted-foreground mb-1">Duplicates</p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-500">{summary.duplicates || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose} className="h-10 px-6">
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkUpload}
                  disabled={isUploading || !uploadedFile}
                  className="h-10 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isUploading ? "Uploading..." : `Upload ${uploadedFile ? 'File' : 'Leads'}`}
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
