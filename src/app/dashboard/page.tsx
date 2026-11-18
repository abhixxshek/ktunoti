"use client"

import { useEffect, useState, useCallback, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Bell,
  RefreshCw,
  Search,
  ExternalLink,
  ArrowRight,
  Calendar,
  FileText,
  FileDown,
  Sparkles,
  CheckSquare,
  Square,
} from "lucide-react"

interface NotificationItem {
  id?: string
  source_id: string
  title: string
  category?: string
  description?: string | null
  published_date?: string | null
  original_url: string
  pdf_url?: string | null
}

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "exam", label: "Examinations" },
  { id: "result", label: "Results" },
  { id: "timetable", label: "Timetables" },
  { id: "academic", label: "Academic" },
  { id: "general", label: "General" },
]

function DashboardFeedContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get("q") || ""

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState(initialQ)
  const [pdfOnly, setPdfOnly] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [postersCount, setPostersCount] = useState(0)

  // Load saved posters count from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("ktu_generated_posters") || "[]")
        setPostersCount(saved.length)
      } catch {}
    }
  }, [])

  const fetchNotifs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const url = isRefresh ? "/api/notifications?refresh=true" : "/api/notifications"
      const res = await fetch(url)
      const data = await res.json()

      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications)
      } else {
        throw new Error(data.error || "Failed to load notifications")
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch from ktunotes.in")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifs(false)
  }, [fetchNotifs])

  // Filtered list
  const filteredNotifs = useMemo(() => {
    return notifications.filter((item) => {
      // Category filter
      if (selectedCategory !== "all") {
        const itemCat = (item.category || "").toLowerCase()
        const titleLower = item.title.toLowerCase()
        if (selectedCategory === "exam" && !itemCat.includes("exam") && !titleLower.includes("exam")) return false
        if (selectedCategory === "result" && !itemCat.includes("result") && !titleLower.includes("result")) return false
        if (selectedCategory === "timetable" && !titleLower.includes("timetable") && !titleLower.includes("time table")) return false
        if (selectedCategory === "academic" && !itemCat.includes("academic") && !titleLower.includes("academic")) return false
        if (selectedCategory === "general" && !itemCat.includes("general")) return false
      }

      // PDF only filter
      if (pdfOnly && !item.pdf_url) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        )
      }

      return true
    })
  }, [notifications, selectedCategory, searchQuery, pdfOnly])

  // Group notifications by date
  const groupedNotifs = useMemo(() => {
    const groups: { [key: string]: NotificationItem[] } = {}

    filteredNotifs.forEach((item) => {
      let groupKey = "Earlier"
      const dateStr = item.published_date
      if (dateStr) {
        const itemDate = new Date(dateStr)
        const today = new Date()
        const diffDays = Math.floor(
          (today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (diffDays <= 1) groupKey = "Today & Yesterday"
        else if (diffDays <= 7) groupKey = "This Week"
        else groupKey = "Earlier"
      }
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(item)
    })

    return groups
  }, [filteredNotifs])

  // Selection toggle
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifs.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredNotifs.map((n) => n.source_id)))
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Page Header (Responsive Metrics & Actions) ── */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-6 md:p-7 shadow-xs space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="inline-flex items-center gap-1.5 h-5 sm:h-6 px-2 sm:px-2.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE SOURCE CONNECTED
              </span>
              <span className="text-xs text-neutral-300">·</span>
              <span className="text-xs text-neutral-500">ktunotes.in</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#242424] tracking-tight leading-tight">
              Stay ahead of every update.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-xl">
              Latest announcements & exam circulars from APJ Abdul Kalam Technological University.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => fetchNotifs(true)}
              disabled={refreshing || loading}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-10 px-3.5 sm:px-4 rounded-[10px] bg-neutral-100 hover:bg-neutral-200/80 text-[#242424] text-xs sm:text-[13px] font-semibold transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <RefreshCw
                size={14}
                className={refreshing ? "animate-spin text-[#E94359]" : ""}
              />
              <span>{refreshing ? "Syncing..." : "Sync updates"}</span>
            </button>

            <Link
              href="/dashboard/studio"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-10 px-3.5 sm:px-4 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-xs sm:text-[13px] font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              <Sparkles size={14} />
              <span>Poster Studio</span>
            </Link>
          </div>
        </div>

        {/* 3 Metric Summary Blocks - Compact grid on mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3.5 pt-4 sm:pt-5 border-t border-neutral-100">
          <div className="p-2.5 sm:p-4 rounded-[10px] bg-neutral-50/80 border border-neutral-200/60">
            <div className="text-lg sm:text-2xl font-bold text-[#242424] tracking-tight">
              {notifications.length}
            </div>
            <div className="text-[10px] sm:text-xs font-medium text-neutral-500 mt-0.5 truncate">
              Total updates
            </div>
          </div>

          <div className="p-2.5 sm:p-4 rounded-[10px] bg-neutral-50/80 border border-neutral-200/60">
            <div className="text-lg sm:text-2xl font-bold text-[#E94359] tracking-tight">
              {notifications.filter((n) => n.published_date).length}
            </div>
            <div className="text-[10px] sm:text-xs font-medium text-neutral-500 mt-0.5 truncate">
              Recent notices
            </div>
          </div>

          <div className="p-2.5 sm:p-4 rounded-[10px] bg-neutral-50/80 border border-neutral-200/60">
            <div className="text-lg sm:text-2xl font-bold text-[#242424] tracking-tight">
              {postersCount}
            </div>
            <div className="text-[10px] sm:text-xs font-medium text-neutral-500 mt-0.5 truncate">
              Posters created
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Toolbar (Fluid & Touch Friendly) ── */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Horizontal Category Pills with smooth swipe */}
        <div className="flex items-center gap-1 h-10 p-1 rounded-[10px] bg-white border border-[#E5E5E5] overflow-x-auto no-scrollbar shadow-xs shrink-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-8 px-3 sm:px-3.5 rounded-[8px] text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-[#E94359] text-white shadow-xs"
                  : "text-neutral-600 hover:text-[#242424] hover:bg-neutral-50"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right Search & PDF Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60 md:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Filter by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-white border border-[#E5E5E5] text-[13px] text-[#242424] placeholder:text-neutral-400 focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 shadow-xs transition-all"
            />
          </div>

          <button
            onClick={() => setPdfOnly(!pdfOnly)}
            className={`inline-flex items-center justify-center gap-1.5 h-10 px-3 sm:px-3.5 rounded-[10px] text-xs font-semibold border transition-all shrink-0 ${
              pdfOnly
                ? "bg-[#FDF2F4] text-[#E94359] border-[#F8C6CD]"
                : "bg-white text-neutral-600 border-[#E5E5E5] hover:bg-neutral-50"
            }`}
          >
            <FileDown size={14} />
            <span className="hidden xs:inline sm:inline">PDF only</span>
          </button>
        </div>
      </div>

      {/* ── Bulk Actions Bar (if selected) ── */}
      {selectedIds.size > 0 && (
        <div className="h-11 px-4 rounded-[10px] bg-neutral-900 text-white flex items-center justify-between shadow-md text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <span className="font-bold">{selectedIds.size}</span>
            <span className="text-neutral-300">selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="px-2.5 py-1 rounded-[6px] hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            >
              {selectedIds.size === filteredNotifs.length ? "Deselect" : "Select all"}
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1 rounded-[6px] hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Notifications Feed ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-white border border-[#E5E5E5] p-4 sm:p-5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-xl bg-white border border-[#E5E5E5] text-center space-y-3 shadow-xs">
          <Bell size={36} className="mx-auto text-neutral-300" />
          <h3 className="text-base font-semibold text-[#242424]">
            No Notifications Found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery
              ? "No announcements match your search. Try resetting filters."
              : "No live notifications retrieved. Click sync to load announcements from ktunotes.in."}
          </p>
          <button
            onClick={() => fetchNotifs(true)}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[10px] bg-[#E94359] text-white text-xs font-semibold hover:bg-[#D83248] transition-colors"
          >
            <RefreshCw size={13} />
            <span>Sync Live Notifications</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {Object.entries(groupedNotifs).map(([groupTitle, items]) => {
            if (items.length === 0) return null
            return (
              <div key={groupTitle} className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {groupTitle}
                  </h3>
                  <span className="text-[11px] text-neutral-400">
                    {items.length} {items.length === 1 ? "notice" : "notices"}
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-2.5">
                  {items.map((item, idx) => {
                    const isSelected = selectedIds.has(item.source_id)
                    const category = item.category || "Exam"
                    const dateStr = item.published_date || "Recent"

                    return (
                      <div
                        key={item.source_id || idx}
                        className={`bg-white rounded-xl border p-3.5 sm:p-5 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group ${
                          isSelected
                            ? "border-[#E94359] bg-[#FDF2F4]/20 shadow-sm"
                            : "border-[#E5E5E5] hover:border-neutral-300 hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Selection Checkbox */}
                          <button
                            onClick={() => toggleSelect(item.source_id)}
                            className="pt-1 text-neutral-400 hover:text-neutral-700 transition-colors shrink-0"
                            aria-label="Select notification"
                          >
                            {isSelected ? (
                              <CheckSquare size={18} className="text-[#E94359]" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>

                          {/* Info Column */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            {/* Top Badges Row */}
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[11px]">
                              <span className="px-2 py-0.5 rounded-[6px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-700 text-[10px] sm:text-[11px]">
                                {category}
                              </span>

                              <span className="px-2 py-0.5 rounded-[6px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 text-[10px] sm:text-[11px]">
                                NEW
                              </span>

                              {dateStr && (
                                <span className="text-neutral-400 flex items-center gap-1 font-mono text-[10px] sm:text-[11px]">
                                  <Calendar size={11} />
                                  {dateStr}
                                </span>
                              )}
                            </div>

                            {/* Headline */}
                            <h2 className="text-sm sm:text-[15px] font-semibold text-[#242424] group-hover:text-[#E94359] transition-colors leading-snug break-words">
                              {item.title}
                            </h2>

                            {/* Meta & Links */}
                            <div className="flex items-center gap-3 text-xs text-neutral-500 pt-0.5 flex-wrap">
                              {item.pdf_url && (
                                <span className="inline-flex items-center gap-1 text-neutral-600 font-medium text-[11px] sm:text-[12px]">
                                  <FileText size={13} className="text-neutral-400" />
                                  PDF available
                                </span>
                              )}

                              <a
                                href={item.original_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-neutral-500 hover:text-neutral-900 transition-colors text-[11px] sm:text-[12px]"
                              >
                                <span>Source</span>
                                <ExternalLink size={11} />
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Right Action Button - Touch friendly (Full width on small phones, inline on sm+) */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                          <Link
                            href={`/dashboard/studio?title=${encodeURIComponent(
                              item.title
                            )}&category=${encodeURIComponent(category)}`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-[10px] bg-neutral-50 hover:bg-[#E94359] text-neutral-700 hover:text-white border border-[#E5E5E5] hover:border-[#E94359] text-xs font-semibold transition-all group/btn shadow-xs active:scale-[0.98]"
                          >
                            <span>Design poster</span>
                            <ArrowRight
                              size={14}
                              className="group-hover/btn:translate-x-0.5 transition-transform"
                            />
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64 text-neutral-400 text-xs">
          <RefreshCw size={18} className="animate-spin text-[#E94359] mr-2" />
          Loading notifications...
        </div>
      }
    >
      <DashboardFeedContent />
    </Suspense>
  )
}
