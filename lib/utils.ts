import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to get field value with formData priority
export const getField = (
  keys: string[],
  formData: Record<string, any>,
  fallback: any = null
) => {
  for (const key of keys) {
    if (
      formData[key] !== undefined &&
      formData[key] !== null &&
      formData[key] !== ""
    ) {
      return formData[key];
    }
  }
  return fallback;
};

/**
 * Normalizes a key (strips spaces, underscores, hyphens and lowercases)
 */
export const normalizeKey = (key: string): string => {
  return key.toLowerCase().replace(/[_\s-]/g, "");
};

/**
 * Checks if a key matches any of the provided standard fields after normalization
 * Includes fuzzy matching for common synonyms (phone/phone_number, name/fullname, etc.)
 */
export const isStandardKey = (key: string, standardFields: string[]): boolean => {
  const norm = normalizeKey(key);

  // 1. Check for exact normalized match
  if (standardFields.some(f => normalizeKey(f) === norm)) return true;

  // 2. Specific fix for synonyms and Meta variants
  const k = norm;
  if (k.includes("phone") || k.includes("whatsapp") || k === "name") {
    return standardFields.some(f => {
      const sf = f.toLowerCase();
      return (
        (k === "name" && sf === "fullname") ||
        (k.includes("phone") && sf === "phone") ||
        (k.includes("whatsapp") && sf === "whatsapp")
      );
    });
  }

  return false;
};

// Helper function to format status for CSS (e.g., "Payment Done" -> "payment_done")
export const formatStatusForCSS = (status: string): string => {
  if (!status) return "";
  return status
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-z0-9_]/g, ""); // Remove any non-alphanumeric characters except underscores
};