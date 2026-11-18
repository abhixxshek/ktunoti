import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster, ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "KTU Notify Studio",
  description: "Cinematic, AI-powered KTU university updates & social poster studio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#05060A] text-slate-100 min-h-screen relative selection:bg-rose-500/30 selection:text-white overflow-x-hidden">
        {/* Cinematic Background Mesh Environment (Fixed behind all content) */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          {/* Top-left Crimson / Rose Glow */}
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-rose-600/20 via-pink-600/10 to-transparent blur-[120px] transform-gpu" />

          {/* Top-right Indigo / Violet Glow */}
          <div className="absolute -top-40 -right-20 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-indigo-600/25 via-purple-700/15 to-transparent blur-[140px] transform-gpu" />

          {/* Center-bottom Cyan / Blue Subtle Ambient Lens */}
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-blue-700/15 via-cyan-600/10 to-transparent blur-[160px] transform-gpu" />

          {/* Bottom-right Crimson Accent Flare */}
          <div className="absolute -bottom-32 right-1/4 w-[550px] h-[550px] rounded-full bg-gradient-to-t from-rose-700/15 via-orange-600/10 to-transparent blur-[130px] transform-gpu" />

          {/* Subtle noise / vignette overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,6,10,0.6)_100%)]" />
        </div>

        {/* Core Application Layer */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <TooltipProvider delay={150}>
            <ToastProvider>
              {children}
              <Toaster />
            </ToastProvider>
          </TooltipProvider>
        </div>
      </body>
    </html>
  );
}
