"use client";

import ReminderList from "@/components/reminders/reminder-list";
import { getExpiryDocuments } from "@/lib/server-actions";
import { ExpiryDocumentWithLead } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export default function RemindersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expiryDocuments, setExpiryDocuments] = useState<
    ExpiryDocumentWithLead[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  // Debounce search to avoid too many API calls
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle search term change
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Fetch expiry documents from API
  const fetchExpiryDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      // For unified search: pass search term to both leadName and documentLabel
      // This allows searching in both fields (OR logic if backend supports it)
      // If documentLabel filter is set separately, use that instead
      const response = await getExpiryDocuments(searchTerm);

      if (response && response.success && response.data) {
        setExpiryDocuments(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch expiry documents",
          variant: "destructive",
        });
        setExpiryDocuments([]);
      }
    } catch (error) {
      console.error("Failed to fetch expiry documents:", error);
      setExpiryDocuments([]);
      toast({
        title: "Error",
        description: "Failed to fetch expiry documents",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  // Fetch data when search params change (with debounce for search term)
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the API call when search term changes (but not for documentLabel filter)
    // No debounce on initial load (when searchTerm is empty)
    const debounceDelay = searchTerm ? 300 : 0;

    const timeoutId = setTimeout(() => {
      fetchExpiryDocuments();
    }, debounceDelay);

    searchTimeoutRef.current = timeoutId;

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchTerm, fetchExpiryDocuments]);

  return (
    <ReminderList
      expiryDocuments={expiryDocuments}
      searchTerm={searchTerm}
      setSearchTerm={handleSearchTermChange}
      onRefresh={fetchExpiryDocuments}
      onClearSearch={handleClearSearch}
      isLoading={isLoading}
    />
  );
}
