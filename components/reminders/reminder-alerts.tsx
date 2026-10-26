"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Phone,
  Mail,
  MessageSquare,
  Calendar as CalendarIcon,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReminders } from "@/contexts/reminder-context";
import { LeadDetailData } from "@/lib/types";
import { getRestDetailsByLeadId } from "@/lib/server-actions";

export function ReminderAlerts() {
  const { activeReminder, setActiveReminder, markAsComplete, dismissReminder } =
    useReminders();
  const [lead, setLead] = useState<LeadDetailData | null>(null);
  const audioRef = useRef<{ play: () => void; context: AudioContext } | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch lead details when active reminder changes
  useEffect(() => {
    const fetchLead = async () => {
      if (!activeReminder?.leadId) {
        setLead(null);
        return;
      }
      try {
        const response = await getRestDetailsByLeadId(
          activeReminder.leadId.toString()
        );
        if (response && response.data) {
          setLead(response.data);
        }
      } catch (error) {
        setLead(null);
      }
    };
    fetchLead();
  }, [activeReminder?.leadId]);

  // Initialize audio with looping notification sound
  useEffect(() => {
    const AudioContextStr =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextStr) return;
    const audioContext = new AudioContextStr();

    const playNotificationSound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };

    audioRef.current = { play: playNotificationSound, context: audioContext };
  }, []);

  // Play sound in loop when active reminder exists
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeReminder && audioRef.current) {
      setIsPlaying(true);
      // Play immediately
      audioRef.current.play();
      // Then play every 2 seconds
      interval = setInterval(() => {
        if (audioRef.current) audioRef.current.play();
      }, 2000);
    } else {
      setIsPlaying(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeReminder]);

  // Request notification permission
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Trigger browser notification when active reminder changes
  useEffect(() => {
    if (activeReminder && lead) {
      const leadName = lead.fullname || lead.email || "Unknown Lead";
      const reminderText =
        activeReminder.description || activeReminder.title || "No description";

      if (Notification.permission === "granted") {
        new Notification("🔔 Reminder Alert!", {
          body: `Follow up with ${leadName}\n${reminderText}`,
          requireInteraction: true,
        });
      }
    }
  }, [activeReminder, lead]);

  const handleMarkAsComplete = () => {
    if (!activeReminder) return;
    markAsComplete(activeReminder.id);
  };

  const handleDismiss = () => {
    if (!activeReminder) return;
    dismissReminder(activeReminder.id);
  };

  if (!activeReminder || !mounted || typeof document === "undefined")
    return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border animate-in zoom-in-95 duration-300">
        <div className="bg-linear-to-br from-background to-muted p-8 text-center border-b relative overflow-hidden">
          {/* Background Decorative Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

          <div className="relative mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto ring-8 ring-primary/5">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg relative">
                <Bell className="w-7 h-7 text-primary-foreground" />
                {isPlaying && (
                  <>
                    <span className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full z-10" />
                  </>
                )}
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold">Reminder Alert!</h2>
          <p className="text-muted-foreground mt-1">Time to follow up.</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary"
                )}
              >
                {React.createElement(CalendarIcon, { className: "w-5 h-5" })}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {lead?.fullname || lead?.email || ""}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lead?.email || "No email"}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium">{activeReminder.title}</p>
              {activeReminder.description && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-all text-muted-foreground">
                  {activeReminder.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" size="lg" onClick={handleDismiss}>
              Dismiss
            </Button>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleMarkAsComplete}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark Done
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
