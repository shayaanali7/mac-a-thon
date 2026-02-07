import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediScribe - Medical Transcription Made Simple",
  description: "Record doctor-patient conversations, get instant transcriptions, and generate comprehensive medical summaries with AI-powered accuracy.",
  keywords: ["medical transcription", "healthcare", "doctor", "patient", "AI transcription"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}