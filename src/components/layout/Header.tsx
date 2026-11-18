"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Menu } from "lucide-react"
import { useMobileNav } from "./MobileNavContext"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { toggleMobile } = useMobileNav()
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  // Breadcrumb title
  const getPageTitle = () => {
    if (pathname.includes("/studio")) return "Poster Studio"
    if (pathname.includes("/library")) return "Poster Library"
    if (pathname.includes("/settings")) return "Brand Settings"
    return "Live Notifications"
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E5E5E5] px-4 sm:px-8 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          className="size-9 inline-flex items-center justify-center -ml-1 text-neutral-600 hover:text-neutral-900 rounded-[10px] hover:bg-neutral-100 md:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px]">
          <span className="text-neutral-400 hidden sm:inline font-normal">Workspace</span>
          <span className="text-neutral-300 hidden sm:inline">/</span>
          <span className="font-semibold text-[#242424]">{getPageTitle()}</span>
        </nav>
      </div>

      {/* Center: Search */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm hidden sm:block">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search announcements, exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 pl-10 pr-4 text-[13px] text-[#242424] placeholder:text-neutral-400 bg-white border border-[#E5E5E5] rounded-[10px] focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 transition-all shadow-xs"
        />
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {/* Source status badge */}
        <div className="hidden lg:flex items-center gap-1.5 h-7 px-3 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ktunotes.in live</span>
        </div>

        {/* Quick create poster action */}
        <Link
          href="/dashboard/studio"
          className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-[13px] font-semibold shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Create poster</span>
        </Link>

        {/* User profile avatar */}
        <div className="size-9 rounded-[10px] bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
          KT
        </div>
      </div>
    </header>
  )
}
