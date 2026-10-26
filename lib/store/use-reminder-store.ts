"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Reuse types from original file for now, eventually move to a shared types file
export interface Reminder {
    id: number;
    leadId: string;
    actionType: string;
    note: string;
    reminderTime: string;
    color: { value: string; label: string; class: string };
    status: 'pending' | 'completed';
    notified: boolean;
    createdAt: string;
}

interface ReminderStore {
    reminders: Reminder[];
    addReminder: (reminder: Reminder) => void;
    deleteReminder: (id: number) => void;
    markAsComplete: (id: number) => void;
    markAsNotified: (id: number) => void;
    setReminders: (reminders: Reminder[]) => void;
}

export const useReminderStore = create<ReminderStore>()(
    persist(
        (set) => ({
            reminders: [],
            addReminder: (reminder) => set((state) => ({ reminders: [...state.reminders, reminder] })),
            deleteReminder: (id) => set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) })),
            markAsComplete: (id) => set((state) => ({
                reminders: state.reminders.map((r) =>
                    r.id === id ? { ...r, status: 'completed' } : r
                ),
            })),
            markAsNotified: (id) => set((state) => ({
                reminders: state.reminders.map((r) =>
                    r.id === id ? { ...r, notified: true } : r
                ),
            })),
            setReminders: (reminders) => set({ reminders }),
        }),
        {
            name: 'crm-reminder-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
