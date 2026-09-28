import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusFix AI — Campus Issue Detection, Triage & Resolution",
  description:
    "AI-powered campus operations platform: natural-language issue reporting, automatic classification, duplicate detection, department routing, SLA tracking and resolution verification.",
  keywords: ["CampusFix AI", "Campus Operations", "AI Complaint Management", "Smart Campus", "Issue Resolution"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen bg-canvas text-ink-primary">{children}</body>
    </html>
  );
}
