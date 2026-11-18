"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Palette, Library, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Notices",
    icon: Bell,
    exact: true,
  },
  {
    href: "/dashboard/studio",
    label: "Studio",
    icon: Palette,
    exact: false,
  },
  {
    href: "/dashboard/library",
    label: "Library",
    icon: Library,
    exact: false,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    exact: false,
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isItemActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-200"
    >
      <div className="flex items-center justify-around h-15 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isItemActive(item.href, item.exact)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-150 relative min-h-[48px]",
                active
                  ? "text-[#E94359]"
                  : "text-neutral-500 hover:text-neutral-900 active:scale-95"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-all",
                  active ? "bg-[#FDF2F4]" : "bg-transparent"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
              </div>
              <span
                className={cn(
                  "text-[10px] tracking-tight mt-0.5 leading-none",
                  active ? "font-bold text-[#E94359]" : "font-medium text-neutral-500"
                )}
              >
                {item.label}
              </span>

              {/* Active top dot/pill indicator */}
              {active && (
                <span className="absolute top-0.5 w-6 h-0.5 rounded-full bg-[#E94359]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

