import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { SkillProvider } from "@/lib/SkillContext";
import { ChatProvider } from "@/lib/ChatContext";
import { ToastProvider } from "@/lib/ToastContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cognizance — AI Neural Mastery Platform",
  description: "Advanced cognitive learning engine with real-time retention tracking, AI-powered situational simulations, and cloud-synced mastery blueprints.",
  keywords: ["AI Learning", "Neural Retention", "Cognitive Profile", "Study Buddy", "Architecture Mastery"],
  authors: [{ name: "Cognizance Team" }],
  openGraph: {
    title: "Cognizance AI",
    description: "Architect your mastery with neural telemetry.",
    type: "website",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased flex min-h-screen bg-black text-white font-[family-name:var(--font-inter)]" suppressHydrationWarning>
        {/* Global SaaS Futuristic Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen" />
        </div>

        <ToastProvider>
        <SkillProvider>
          <ChatProvider>
            <div className="flex w-full h-screen overflow-hidden relative z-0">
              <Sidebar />
              <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-0">
                {children}
              </main>
            </div>
          </ChatProvider>
        </SkillProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
