import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://deepcite.app"),
  title: "DeepCite — Multi-Agent Research with Citation & Self-Critique",
  description:
    "DeepCite is a multi-agent AI research harness that deconstructs questions, extracts verified citations, audits for hallucination, and synthesizes exhaustive reports with confidence scores.",
  openGraph: {
    title: "DeepCite — Multi-Agent Research with Citation & Self-Critique",
    description:
      "Four specialized AI agents — Planner, Researcher, Critic, Synthesizer — working in sequence to deliver investor-grade research reports.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
