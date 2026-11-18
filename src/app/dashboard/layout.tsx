import { Suspense } from "react"
import Sidebar from "@/components/layout/Sidebar"
import Header from "@/components/layout/Header"
import BottomNav from "@/components/layout/BottomNav"
import { MobileNavProvider } from "@/components/layout/MobileNavContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MobileNavProvider>
      <div className="flex h-screen overflow-hidden bg-[#FAF9F6]">
        <Suspense
          fallback={
            <aside className="hidden md:block w-[240px] h-screen border-r border-neutral-200 bg-white shrink-0" />
          }
        >
          <Sidebar />
        </Suspense>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Suspense
            fallback={
              <header className="h-16 bg-[#FAF9F6] border-b border-neutral-200 shrink-0" />
            }
          >
            <Header />
          </Suspense>

          <main className="flex-1 overflow-y-auto relative z-10 scroll-smooth px-3 sm:px-6 md:px-8 py-4 sm:py-6 pb-20 md:pb-6">
            <div className="max-w-[1540px] mx-auto w-full">
              {children}
            </div>
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <Suspense fallback={<nav className="fixed bottom-0 inset-x-0 h-15 bg-white/95 md:hidden border-t border-[#E5E5E5]" />}>
            <BottomNav />
          </Suspense>
        </div>
      </div>
    </MobileNavProvider>
  )
}
