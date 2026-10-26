"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useAuth } from "./auth-context";
import { getRemindersByUserId, setRemindersStatus } from "@/lib/server-actions";
import { LeadReminderItem, ReminderStatus } from "@/lib/types";

interface ReminderContextType {
  reminders: LeadReminderItem[];
  pendingCount: number;
  activeReminder: LeadReminderItem | null;
  isLoading: boolean;
  setActiveReminder: (reminder: LeadReminderItem | null) => void;
  markAsComplete: (reminderId: number) => void;
  dismissReminder: (reminderId: number) => void;
  refreshReminders: () => Promise<void>;
}

const ReminderContext = createContext<ReminderContextType | undefined>(
  undefined
);

export function ReminderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<LeadReminderItem[]>([]);
  const [activeReminder, setActiveReminder] = useState<LeadReminderItem | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const notifiedReminderIdsRef = useRef<Set<number>>(new Set());

  const fetchReminders = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await getRemindersByUserId(user.id);

      if (response?.success && response.data) {
        // Filter only pending reminders for timers
        const pendingReminders = response.data.filter(
          (r) => r.status === "pending"
        );
        setReminders(response.data);

        // Clear existing timers
        timersRef.current.forEach((timer) => clearTimeout(timer));
        timersRef.current.clear();
        notifiedReminderIdsRef.current.clear();

        // Set up timers for each pending reminder
        pendingReminders.forEach((reminder) => {
          const reminderTime = new Date(reminder.reminderDateTime);
          const now = new Date();
          const timeUntilReminder = reminderTime.getTime() - now.getTime();

          // Only set timer if reminder is in the future
          if (timeUntilReminder > 0) {
            const timer = setTimeout(() => {
              // Check if reminder is still pending and not already notified
              setReminders((prev) => {
                const currentReminder = prev.find((r) => r.id === reminder.id);
                if (
                  currentReminder &&
                  currentReminder.status === "pending" &&
                  !notifiedReminderIdsRef.current.has(reminder.id)
                ) {
                  setActiveReminder(currentReminder);
                  notifiedReminderIdsRef.current.add(reminder.id);
                }
                return prev;
              });
              timersRef.current.delete(reminder.id);
            }, timeUntilReminder);

            timersRef.current.set(reminder.id, timer);
          } else if (
            timeUntilReminder <= 0 &&
            !notifiedReminderIdsRef.current.has(reminder.id)
          ) {
            // Reminder is already due, trigger immediately
            setActiveReminder(reminder);
            notifiedReminderIdsRef.current.add(reminder.id);
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const markAsComplete = useCallback(async (reminderId: number) => {
    try {
      // Convert number to string as API expects string
      const response = await setRemindersStatus(
        String(reminderId),
        ReminderStatus.COMPLETED
      );

      if (response?.success) {
        // Update local state
        setReminders((prev) =>
          prev.map((r) =>
            r.id === reminderId ? { ...r, status: ReminderStatus.COMPLETED } : r
          )
        );

        // Clear timer if exists
        const timer = timersRef.current.get(reminderId);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(reminderId);
        }

        // Remove from notified set
        notifiedReminderIdsRef.current.delete(reminderId);

        // Clear active reminder if it's the one being completed
        setActiveReminder((prev) => (prev?.id === reminderId ? null : prev));
      } else {
        console.error(
          "Failed to mark reminder as complete:",
          response?.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Failed to mark reminder as complete:", error);
      // Even if API call fails, we can still update UI optimistically
      // or show an error message to the user
    }
  }, []);

  const dismissReminder = useCallback(async (reminderId: number) => {
    try {
      // Convert number to string as API expects string
      const response = await setRemindersStatus(
        String(reminderId),
        ReminderStatus.DISMISSED
      );

      if (response?.success) {
        // Update local state
        setReminders((prev) =>
          prev.map((r) =>
            r.id === reminderId ? { ...r, status: ReminderStatus.DISMISSED } : r
          )
        );

        // Clear timer if exists
        const timer = timersRef.current.get(reminderId);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(reminderId);
        }

        // Remove from notified set
        notifiedReminderIdsRef.current.delete(reminderId);

        // Clear active reminder if it's the one being dismissed
        setActiveReminder((prev) => (prev?.id === reminderId ? null : prev));
      } else {
        console.error(
          "Failed to dismiss reminder:",
          response?.message || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Failed to dismiss reminder:", error);
      // Even if API call fails, we can still clear the active reminder
      setActiveReminder((prev) => (prev?.id === reminderId ? null : prev));
    }
  }, []);

  const pendingCount = reminders.filter((r) => r.status === "pending").length;

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        pendingCount,
        activeReminder,
        isLoading,
        setActiveReminder,
        markAsComplete,
        dismissReminder,
        refreshReminders: fetchReminders,
      }}
    >
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error("useReminders must be used within a ReminderProvider");
  }
  return context;
}
