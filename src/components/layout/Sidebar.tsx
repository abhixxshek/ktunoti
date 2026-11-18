"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  Palette,
  Library,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  X,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobileNav } from "./MobileNavContext"

const WORKSPACE_NAV = [
  { href: "/dashboard", label: "Live Notifications", icon: Bell, badge: "Live" },
  { href: "/dashboard/studio", label: "Poster Studio", icon: Palette },
  { href: "/dashboard/library", label: "Poster Library", icon: Library },
]

const PREFERENCES_NAV = [
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

  const renderContent = (isMobile = false) => (
    <div className="flex flex-col h-full bg-white border-r border-[#E5E5E5]">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-9 rounded-[10px] bg-[#E94359] text-white shrink-0 shadow-xs">
            <Sparkles size={18} />
          </div>
          {(!collapsed || isMobile) && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold tracking-tight text-[#242424] leading-tight">
                KTU Notify
              </p>
              <p className="text-[10px] font-semibold text-neutral-400 tracking-wider uppercase">
                Notifications. Reimagined.
              </p>
            </div>
          )}
        </Link>

        {isMobile && (
          <button
            onClick={closeMobile}
            className="size-8 inline-flex items-center justify-center text-neutral-500 hover:text-neutral-900 rounded-[8px] hover:bg-neutral-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Workspace Section */}
        <div className="space-y-1">
          {(!collapsed || isMobile) && (
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Workspace
            </div>
          )}
          {WORKSPACE_NAV.map((item) => {
            const Icon = item.icon
            const active = isItemActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? closeMobile : undefined}
                className={cn(
                  "flex items-center h-10 rounded-[10px] border transition-all duration-150 text-[13px]",
                  collapsed ? "justify-center w-full" : "gap-3 px-3",
                  active
                    ? "bg-[#FDF2F4] text-[#E94359] border-[#F8C6CD] font-semibold shadow-xs"
                    : "text-neutral-600 hover:text-[#242424] hover:bg-neutral-50 border-transparent font-medium"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={17}
                  className={cn("shrink-0", active ? "text-[#E94359]" : "text-neutral-500")}
                />
                {!collapsed && (
                  <span className="truncate flex-1">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Preferences Section */}
        <div className="space-y-1">
          {(!collapsed || isMobile) && (
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              Preferences
            </div>
          )}
          {PREFERENCES_NAV.map((item) => {
            const Icon = item.icon
            const active = isItemActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? closeMobile : undefined}
                className={cn(
                  "flex items-center h-10 rounded-[10px] border transition-all duration-150 text-[13px]",
                  collapsed ? "justify-center w-full" : "gap-3 px-3",
                  active
                    ? "bg-[#FDF2F4] text-[#E94359] border-[#F8C6CD] font-semibold shadow-xs"
                    : "text-neutral-600 hover:text-[#242424] hover:bg-neutral-50 border-transparent font-medium"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={17}
                  className={cn("shrink-0", active ? "text-[#E94359]" : "text-neutral-500")}
                />
                {!collapsed && <span className="truncate flex-1">{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Footer Profile & Collapse Toggle */}
      <div className="p-3 border-t border-neutral-100 space-y-2">
        {/* User Card */}
        <div
          className={cn(
            "flex items-center rounded-[10px] bg-neutral-50 p-2 border border-neutral-200/60",
            collapsed ? "justify-center" : "gap-2.5"
          )}
        >
          <div className="size-8 rounded-[8px] bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
            KT
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#242424] truncate">Workspace</p>
              <p className="text-[11px] text-neutral-400 truncate">Personal account</p>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-[8px] transition-colors text-xs font-medium"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:block shrink-0 sticky top-0 h-screen transition-[width] duration-200 z-30",
          collapsed ? "w-[72px]" : "w-60"
        )}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={closeMobile}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-in-out md:hidden shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {renderContent(true)}
      </div>
    </>
  )
}
