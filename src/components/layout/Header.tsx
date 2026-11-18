"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Search, Plus, Menu, X, Sparkles } from "lucide-react"
import { useMobileNav } from "./MobileNavContext"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { toggleMobile } = useMobileNav()
  const [searchTerm, setSearchTerm] = useState("")
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(searchTerm.trim())}`)
      setMobileSearchOpen(false)
    }
  }

  // Breadcrumb / Mobile title
  const getPageTitle = () => {
    if (pathname.includes("/studio")) return "Poster Studio"
    if (pathname.includes("/library")) return "Poster Library"
    if (pathname.includes("/settings")) return "Brand Settings"
    return "Notifications"
  }

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E5E5E5] px-3 sm:px-6 md:px-8 flex items-center justify-between gap-2 sm:gap-4 transition-all">
      {/* ── EXPANDABLE MOBILE SEARCH OVERLAY ── */}
      {mobileSearchOpen ? (
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 flex items-center gap-2 animate-in fade-in duration-150"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              autoFocus
              placeholder="Search announcements, exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-8 text-sm text-[#242424] placeholder:text-neutral-400 bg-white border border-[#E5E5E5] rounded-[10px] focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 shadow-xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            className="h-10 px-3 text-xs font-semibold text-neutral-600 hover:text-neutral-900 rounded-[10px] hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          {/* Left: Mobile Toggle & Page Brand/Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={toggleMobile}
              className="size-9 inline-flex items-center justify-center -ml-1 text-neutral-600 hover:text-neutral-900 rounded-[10px] hover:bg-neutral-100 md:hidden transition-colors shrink-0"
              aria-label="Toggle navigation"
            >
              <Menu size={18} />
            </button>

            {/* Mobile Brand Mark & Page Title */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="md:hidden size-6 rounded-[6px] bg-[#E94359] text-white flex items-center justify-center shrink-0">
                <Sparkles size={13} />
              </div>

              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-[13px] min-w-0">
                <span className="text-neutral-400 hidden sm:inline font-normal">Workspace</span>
                <span className="text-neutral-300 hidden sm:inline">/</span>
                <span className="font-semibold text-[#242424] truncate">{getPageTitle()}</span>
              </nav>
            </div>
          </div>

          {/* Center: Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full max-w-sm hidden sm:block mx-2"
          >
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
          <div className="flex items-center gap-1.5 sm:gap-3 ml-auto shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="sm:hidden size-9 inline-flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-[10px] hover:bg-neutral-100 transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            {/* Source status badge (Desktop & Tablet) */}
            <div className="hidden md:flex items-center gap-1.5 h-7 px-3 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ktunotes.in live</span>
            </div>

            {/* Quick create poster action */}
            <Link
              href="/dashboard/studio"
              className="inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-3 sm:px-4 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-xs sm:text-[13px] font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus size={15} />
              <span className="hidden xs:inline sm:inline">Create</span>
              <span className="hidden sm:inline">poster</span>
            </Link>

            {/* User profile avatar */}
            <div className="size-8 sm:size-9 rounded-[10px] bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold shadow-xs shrink-0">
              KT
            </div>
          </div>
        </>
      )}
    </header>
  )
}
