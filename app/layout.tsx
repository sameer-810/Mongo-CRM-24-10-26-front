import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import { PageLayout } from "@/components/layouts/page-layout";
import { ReminderAlerts } from "@/components/reminders/reminder-alerts";
import { Toaster } from "@/components/ui/toaster";
import { SITE } from "@/lib/site";
import "./globals.css";

if (typeof window === "undefined") {
  // Polyfill localStorage for SSR if it's missing or broken
  const noop = () => { };
  const storageMock = {
    getItem: () => null,
    setItem: noop,
    removeItem: noop,
    clear: noop,
    length: 0,
    key: () => null,
  };

  if (typeof localStorage === "undefined") {
    (global as any).localStorage = storageMock;
  } else if (typeof localStorage.getItem !== "function") {
    // It's broken, fix it
    (global as any).localStorage = storageMock;
  }
}

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: SITE.name,
  description: "Professional CRM System with Role-Based Access Control",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <Providers>
          <PageLayout>{children}</PageLayout>
          <ReminderAlerts />
          <Toaster />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
