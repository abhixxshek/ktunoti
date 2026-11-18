import type { Metadata } from "next"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster, ToastProvider } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "KTU Notify — Creative Workspace for University Announcements",
  description:
    "A refined workspace to discover KTU notifications and design high-impact posters for Kerala Technological University.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#FAF9F6] text-[#242424] min-h-screen relative selection:bg-[#E94359]/15 selection:text-[#E94359] overflow-x-hidden font-sans">
        <TooltipProvider delay={150}>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
