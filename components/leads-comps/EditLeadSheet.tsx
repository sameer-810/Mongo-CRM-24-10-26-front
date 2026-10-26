"use client";

import { useState, useEffect } from "react";
import { Lead } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES, VISA_CATEGORY_LABELS, STANDARD_LEAD_FIELDS, SYSTEM_FIELDS } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { isStandardKey } from "@/lib/utils";

import {
  User,
  Briefcase,
  Globe,
  DollarSign,
  FileText,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

interface EditLeadSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (leadId: string, leadData: any) => void;
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

export function EditLeadSheet({
  lead,
  isOpen,
  onClose,
  onUpdate,
}: EditLeadSheetProps) {
  const { toast } = useToast();
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
    formData: {} as Record<string, any>,
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        fullname: lead.fullname || "",
        phone: lead.phone || "",
        email: lead.email || "",
        whatsapp: lead.whatsapp || "",
        jobTitle: lead.jobTitle || "",
        leadSource: lead.leadSource || "",
        leadSubsource: lead.leadSubsource || "",
        monthlyIncome: lead.monthlyIncome?.toString() || "",
        country: lead.country || "",
        targetCountry: lead.targetCountry || "",
        visaCategory: lead.visaCategory || "",
        notes: "",
        formData: lead.formData || {},
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullname || !formData.phone || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Phone, Email)",
        variant: "destructive",
      });
      return;
    }

    const { formData: dynamicData, ...rest } = formData;

    onUpdate(String(lead?.id), {
      ...rest,
      ...dynamicData, // Flatten dynamic fields into top-level payload
      monthlyIncome: formData.monthlyIncome
        ? parseInt(formData.monthlyIncome)
        : undefined,
    });

    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[600px] p-0 flex flex-col h-full bg-background border-l border-border">
        <SheetHeader className="px-6 py-8 border-b border-border bg-card/50">
          <div className="flex items-center gap-2 text-primary mb-2">
            <User className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">
              Lead Management
            </span>
          </div>
          <SheetTitle className="text-2xl font-semibold tracking-tight">
            Edit Lead Profile
          </SheetTitle>
          <SheetDescription className="text-muted-foreground mt-1">
            Modify the records for <span className="text-foreground font-medium">{formData.fullname}</span>.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-10">
            {/* Section 1: Basic Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-2">
                  <Label htmlFor="edit-fullname" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      id="edit-fullname"
                      className="pl-10 h-11 bg-card/30 border-border focus:ring-primary/20 w-full"
                      placeholder="e.g. John Doe"
                      value={formData.fullname}
                      onChange={(e) =>
                        setFormData({ ...formData, fullname: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      id="edit-email"
                      type="email"
                      className="pl-10 h-11 bg-card/30 border-border w-full"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      id="edit-phone"
                      className="pl-10 h-11 bg-card/30 border-border w-full"
                      placeholder="+971..."
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-whatsapp" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    WhatsApp (Optional)
                  </Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      id="edit-whatsapp"
                      className="pl-10 h-11 bg-card/30 border-border w-full"
                      placeholder="+971..."
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Lead Details */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Lead Details
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-2">
                  <Label htmlFor="edit-country" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Current Residence
                  </Label>
                  <Select
                    value={formData.country}
                    onValueChange={(v) => setFormData({ ...formData, country: v })}
                  >
                    <SelectTrigger id="edit-country" className="h-11 bg-card/30 border-border w-full">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground/50" />
                        <SelectValue placeholder="Select country" />
                      </div>
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

                <div className="space-y-2">
                  <Label htmlFor="edit-visaCategory" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Visa Category
                  </Label>
                  <Select
                    value={formData.visaCategory}
                    onValueChange={(v) =>
                      setFormData({ ...formData, visaCategory: v })
                    }
                  >
                    <SelectTrigger id="edit-visaCategory" className="h-11 bg-card/30 border-border w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground/50" />
                        <SelectValue placeholder="Select visa category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(VISA_CATEGORY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-jobTitle" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Professional Title
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input
                      id="edit-jobTitle"
                      className="pl-10 h-11 bg-card/30 border-border w-full"
                      placeholder="e.g. Project Manager"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-monthlyIncome" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Monthly Income (AED)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50">AED</span>
                    <Input
                      id="edit-monthlyIncome"
                      type="number"
                      className="pl-16 h-11 bg-card/30 border-border w-full"
                      placeholder="e.g. 25000"
                      value={formData.monthlyIncome}
                      onChange={(e) =>
                        setFormData({ ...formData, monthlyIncome: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Source Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Source Information
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-2">
                  <Label htmlFor="edit-leadSource" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Acquisition Channel
                  </Label>
                  <Select
                    value={formData.leadSource}
                    onValueChange={(v) => setFormData({ ...formData, leadSource: v })}
                  >
                    <SelectTrigger id="edit-leadSource" className="h-11 bg-card/30 border-border w-full">
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
                <div className="space-y-2">
                  <Label htmlFor="edit-leadSubsource" className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Specific Subsource
                  </Label>
                  <Select
                    value={formData.leadSubsource}
                    onValueChange={(v) =>
                      setFormData({ ...formData, leadSubsource: v })
                    }
                  >
                    <SelectTrigger id="edit-leadSubsource" className="h-11 bg-card/30 border-border w-full">
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
              </div>
            </div>

            {/* Section 4: Dynamic Information */}
            {(() => {
              const filteredEntries = Object.entries(formData.formData).filter(([key]) => {
                const lowerKey = key.toLowerCase();
                // User wants raw_meta_data visible in edit sheet
                if (lowerKey === "raw_meta_data") return true;
                if (SYSTEM_FIELDS.includes(lowerKey)) return false;

                return !isStandardKey(key, STANDARD_LEAD_FIELDS);
              });

              if (filteredEntries.length === 0) return null;

              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Dynamic Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    {filteredEntries.map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label
                          htmlFor={`edit-dynamic-${key}`}
                          className="text-xs font-semibold uppercase text-muted-foreground tracking-wide"
                        >
                          {key.replace(/_/g, " ")}
                        </Label>
                        <Input
                          id={`edit-dynamic-${key}`}
                          className="h-11 bg-card/30 border-border w-full"
                          value={value || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              formData: {
                                ...formData.formData,
                                [key]: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </form>

        <SheetFooter className="p-6 border-t border-border bg-card/30 flex flex-row items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 font-semibold text-muted-foreground hover:bg-muted/50"
          >
            Discard Changes
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 h-12 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            Update Profile
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}