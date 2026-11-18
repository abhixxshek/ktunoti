"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Bell, Layers, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobileNav } from "./MobileNavContext"

export default function Header() {
  const router = useRouter()
  const { toggleMobile } = useMobileNav()
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-black/40 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-8 flex items-center justify-between shrink-0 gap-4 transition-all duration-300">
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMobile}
        className="p-2 -ml-2 text-white/70 hover:text-white rounded-2xl hover:bg-white/[0.08] md:hidden transition-colors active:scale-[0.96]"
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      {/* Cinematic Glass Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md group">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-[#FF3355] transition-colors"
        />
        <input
          type="text"
          placeholder="Search notifications, timetables, circulars..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/40 bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.09] backdrop-blur-xl border border-white/[0.08] focus:border-rose-500/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-inner transition-all duration-300"
        />
      </form>

      {/* Right Quick Nav with Fluid Micro-Interactions */}
      <div className="flex items-center gap-3 ml-auto shrink-0">
        <Link href="/dashboard/notifications">
          <button
            type="button"
            className="p-2.5 rounded-2xl text-white/70 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/15 backdrop-blur-md transition-all duration-300 active:scale-[0.96]"
            title="University notifications"
          >
            <Bell size={16} />
          </button>
        </Link>

        <Link href="/dashboard/studio">
          <Button
            size="sm"
            className="h-9 px-4 rounded-2xl bg-gradient-to-r from-[#FF2E4D] to-[#E00028] hover:from-[#FF4D68] hover:to-[#FF1F42] text-white text-xs gap-2 font-semibold shadow-lg shadow-rose-600/25 border border-white/20 transition-all duration-300 active:scale-[0.98]"
          >
            <Layers size={14} />
            <span className="hidden sm:inline">Poster Studio</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
