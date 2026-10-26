import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lead } from '@/lib/types';

export interface AttemptLog {
    id: string;
    leadId: number;
    type: "call" | "whatsapp" | "email";
    status: string;
    date: string; // ISO string for persistence
    notes?: string;
}

interface LeadState {
    leads: Lead[];
    logs: AttemptLog[];
    totalLeads: number;
    setTotalLeads: (total: number) => void;
    updateLead: (id: number, updates: Partial<Lead>) => void;
    addAttemptLog: (log: Omit<AttemptLog, 'id' | 'date'>) => void;
    updateAttemptLog: (id: string, updates: Partial<AttemptLog>) => void;
    deleteAttemptLog: (id: string) => void;
}

export const useLeadStore = create<LeadState>()(
    persist(
        (set) => ({
            leads: [], // Initialize with empty array - data comes from API
            logs: [],
            totalLeads: 0,
            setTotalLeads: (total) => set({ totalLeads: total }),
            updateLead: (id, updates) =>
                set((state) => ({
                    leads: state.leads.map((lead) =>
                        lead.id === id ? { ...lead, ...updates } : lead
                    ),
                })),
            addAttemptLog: (log) =>
                set((state) => {
                    const newLog = {
                        ...log,
                        id: Math.random().toString(36).substr(2, 9),
                        date: new Date().toISOString(),
                    };

                    // Also update the lead stats
                    const updatedLeads = state.leads.map(lead => {
                        if (lead.id === log.leadId) {
                            return {
                                ...lead,
                                callAttempts: (lead.callAttempts || 0) + 1,
                                lastContactedAt: new Date()
                            };
                        }
                        return lead;
                    });

                    return {
                        logs: [newLog, ...state.logs],
                        leads: updatedLeads
                    };
                }),
            updateAttemptLog: (id, updates) =>
                set((state) => ({
                    logs: state.logs.map((log) =>
                        log.id === id ? { ...log, ...updates } : log
                    ),
                })),
            deleteAttemptLog: (id) =>
                set((state) => ({
                    logs: state.logs.filter((log) => log.id !== id),
                })),
        }),
        {
            name: 'crm-lead-storage',
        }
    )
);
