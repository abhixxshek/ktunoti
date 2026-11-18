import { Suspense } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import { MobileNavProvider } from "@/components/layout/MobileNavContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MobileNavProvider>
      <div className="flex h-screen overflow-hidden bg-transparent">
        <Suspense
          fallback={
            <aside className="hidden md:block w-64 h-screen border-r border-white/5 bg-black/40 shrink-0" />
          }
        >
          <Sidebar />
        </Suspense>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Suspense
            fallback={
              <header className="h-16 bg-black/40 border-b border-white/5 shrink-0" />
            }
          >
            <Header />
          </Suspense>

          <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </MobileNavProvider>
  )
}
