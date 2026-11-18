"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Bell,
  Palette,
  Library,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobileNav } from "./MobileNavContext"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Live Notifications", icon: Bell },
  { href: "/dashboard/studio", label: "Poster Studio", icon: Palette },
  { href: "/dashboard/library", label: "Poster Library", icon: Library },
]

const BOTTOM_ITEMS = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { mobileOpen, setMobileOpen } = useMobileNav()

  const closeMobile = () => setMobileOpen(false)

  const isItemActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const renderNavList = (isMobile = false) => (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-2xl">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF2E4D] to-[#B00020] text-white shrink-0 shadow-lg shadow-rose-600/30 border border-white/20">
            <Sparkles size={19} />
          </div>
          {(!collapsed || isMobile) && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-sm font-extrabold tracking-tight text-white leading-tight">
                KTU Notify
              </p>
              <p className="text-[10px] font-bold text-[#FF5577] tracking-wider uppercase">
                ktunotes.in Sync
              </p>
            </div>
          )}
        </div>

        {isMobile && (
          <button
            onClick={closeMobile}
            className="p-1.5 text-white/60 hover:text-white rounded-xl hover:bg-white/[0.08] transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isItemActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? closeMobile : undefined}
              className={cn(
                "flex items-center h-11 rounded-2xl transition-all duration-200 active:scale-[0.98]",
                collapsed ? "justify-center w-full" : "gap-3 px-3.5",
                active
                  ? "bg-white/[0.1] backdrop-blur-xl border border-white/[0.18] text-white shadow-lg shadow-black/40"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05] border border-transparent"
              )}
            >
              <div
                className={cn(
                  "shrink-0 transition-colors",
                  active ? "text-[#FF3355]" : "group-hover:text-white"
                )}
              >
                <Icon size={18} />
              </div>
              {!collapsed && (
                <span className="text-xs font-semibold tracking-wide truncate">
                  {item.label}
                </span>
              )}
              {active && !collapsed && (
                <motion.div
                  layoutId="active-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF3355] shadow-[0_0_8px_#FF3355]"
                />
              )}
            </Link>
          )
        })}
      </div>

      {/* Live Source Status */}
      {(!collapsed || isMobile) && (
        <div className="px-4 py-3 mx-3 mb-2 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Source Feed</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ktunotes.in
            </span>
          </div>
          <a
            href="https://ktunotes.in/notifications"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <span>Direct Website Link</span>
            <ExternalLink size={10} />
          </a>
        </div>
      )}

      {/* Bottom Nav Settings */}
      <div className="p-3 border-t border-white/[0.07] space-y-1">
        {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isItemActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? closeMobile : undefined}
              className={cn(
                "flex items-center h-10 rounded-2xl transition-all duration-200 active:scale-[0.98]",
                collapsed ? "justify-center w-full" : "gap-3 px-3.5",
                active
                  ? "bg-white/[0.1] text-white border border-white/15"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <Icon size={17} />
              {!collapsed && (
                <span className="text-xs font-semibold">{item.label}</span>
              )}
            </Link>
          )
        })}

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center h-9 w-full rounded-xl text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors mt-1",
              collapsed ? "justify-center" : "gap-3 px-3"
            )}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={cn(
          "hidden md:block sticky top-0 h-screen shrink-0 border-r border-white/[0.08] transition-all duration-300 z-40",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {renderNavList(false)}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={closeMobile}
          />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {renderNavList(true)}
          </aside>
        </div>
      )}
    </>
  )
}
