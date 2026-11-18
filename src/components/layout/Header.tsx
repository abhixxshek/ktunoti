"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Menu, Radio, ExternalLink } from "lucide-react"
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
    <header className="sticky top-0 z-40 h-16 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-8 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobile}
          className="p-2 -ml-2 text-neutral-600 hover:text-neutral-900 rounded-xl hover:bg-neutral-200/60 md:hidden transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500 hidden sm:inline">Workspace</span>
          <span className="text-neutral-300 hidden sm:inline">/</span>
          <span className="font-semibold text-neutral-900">{getPageTitle()}</span>
        </div>
      </div>

      {/* Center: Search */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm hidden sm:block">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          placeholder="Search announcements, exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 text-xs text-neutral-800 placeholder:text-neutral-400 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-[#E94359] focus:ring-1 focus:ring-[#E94359]/20 transition-all shadow-sm"
        />
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        {/* Source status badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ktunotes.in live</span>
        </div>

        {/* Quick create poster action */}
        <Link
          href="/dashboard/studio"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E94359] hover:bg-[#D83248] text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus size={14} />
          <span>Create poster</span>
        </Link>

        {/* User profile avatar */}
        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-bold shadow-sm">
          KT
        </div>
      </div>
    </header>
  )
}
