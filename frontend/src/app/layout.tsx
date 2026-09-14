import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lenny Growth Assistant — AI Intelligence Engine",
  description: "Turn Lenny's Podcast transcripts into grounded Q&A, Ship 30 for 30 essays, and interactive growth strategy artifacts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-[#0a0d14] text-[#f8fafc] overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
