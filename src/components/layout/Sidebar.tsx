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
    <div className="flex flex-col h-full bg-white border-r border-neutral-200/80">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#E94359] text-white shrink-0 shadow-sm">
            <Sparkles size={18} />
          </div>
          {(!collapsed || isMobile) && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold tracking-tight text-neutral-900 leading-tight">
                KTU Notify
              </p>
              <p className="text-[9px] font-semibold text-neutral-400 tracking-wider uppercase">
                Notifications. Reimagined.
              </p>
            </div>
          )}
        </Link>

        {isMobile && (
          <button
            onClick={closeMobile}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
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
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
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
                  "flex items-center h-10 rounded-xl transition-all duration-150",
                  collapsed ? "justify-center w-full" : "gap-3 px-3",
                  active
                    ? "bg-[#FDF2F4] text-[#E94359] font-semibold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={17}
                  className={cn("shrink-0", active ? "text-[#E94359]" : "text-neutral-500")}
                />
                {!collapsed && (
                  <span className="text-xs truncate flex-1">{item.label}</span>
                )}
                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
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
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
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
                  "flex items-center h-10 rounded-xl transition-all duration-150",
                  collapsed ? "justify-center w-full" : "gap-3 px-3",
                  active
                    ? "bg-[#FDF2F4] text-[#E94359] font-semibold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  size={17}
                  className={cn("shrink-0", active ? "text-[#E94359]" : "text-neutral-500")}
                />
                {!collapsed && <span className="text-xs truncate">{item.label}</span>}
              </Link>
            )
          })}

          <button
            onClick={() => alert("KTU Notify Studio • Need assistance? Reach out to @KTU_Updates or visit ktunotes.in.")}
            className={cn(
              "flex items-center h-10 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-150 w-full text-left",
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            )}
            title={collapsed ? "Help & Support" : undefined}
          >
            <HelpCircle size={17} className="text-neutral-500 shrink-0" />
            {!collapsed && <span className="text-xs truncate">Help & Support</span>}
          </button>
        </div>
      </div>

      {/* User / Workspace Footer */}
      <div className="p-3 border-t border-neutral-100 space-y-2">
        <div
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50 border border-neutral-100",
            collapsed && "justify-center"
          )}
        >
          <div className="w-7 h-7 rounded-lg bg-[#E94359]/10 text-[#E94359] flex items-center justify-center shrink-0">
            <User size={14} />
          </div>
          {(!collapsed || isMobile) && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-neutral-900 truncate">Workspace</p>
              <p className="text-[10px] text-neutral-500 truncate">Personal account</p>
            </div>
          )}
        </div>

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center h-8 w-full rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors text-xs",
              collapsed ? "justify-center" : "gap-2 px-2"
            )}
            aria-label="Collapse sidebar"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={cn(
          "hidden md:block sticky top-0 h-screen shrink-0 transition-all duration-200 z-40",
          collapsed ? "w-[76px]" : "w-[240px]"
        )}
      >
        {renderContent(false)}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={closeMobile}
          />
          <aside className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  )
}
