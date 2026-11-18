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
  Palette,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
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

const CATEGORIES = ["All", "Exam", "Result", "Academic", "General"]

function DashboardFeedContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get("q") || ""

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState(initialQ)

  useEffect(() => {
    if (initialQ) setSearchQuery(initialQ)
  }, [initialQ])

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

  const filteredNotifs = useMemo(() => {
    return notifications.filter((item) => {
      // Category filter
      if (selectedCategory !== "All") {
        const itemCat = (item.category || "").toLowerCase()
        const target = selectedCategory.toLowerCase()
        if (!itemCat.includes(target) && !item.title.toLowerCase().includes(target)) {
          return false
        }
      }

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
  }, [notifications, selectedCategory, searchQuery])

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF3355] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF3355] animate-pulse" />
            <span>Live KTU Announcements Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            KTU Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sourced directly from{" "}
            <a
              href="https://ktunotes.in/notifications"
              target="_blank"
              rel="noreferrer"
              className="text-white underline hover:text-[#FF5577] transition-colors"
            >
              ktunotes.in/notifications
            </a>
            . 1-click to generate high-res social posters.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => fetchNotifs(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-[#FF3355]" : ""} />
            <span>{refreshing ? "Scraping ktunotes.in..." : "Sync from ktunotes.in"}</span>
          </button>

          <Link
            href="/dashboard/studio"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF2E4D] to-[#FF4565] text-white text-xs font-bold shadow-lg shadow-rose-600/30 hover:brightness-110 active:scale-95 transition-all"
          >
            <Palette size={15} />
            <span>Poster Studio</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/[0.08] overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#FF3355] text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/[0.08] text-white text-xs focus:outline-none focus:border-[#FF3355] transition-colors"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchNotifs(true)}
            className="font-bold underline hover:text-white"
          >
            Retry Fetch
          </button>
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse h-24"
            />
          ))}
        </div>
      ) : filteredNotifs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-black/30 backdrop-blur-xl border border-white/[0.08] text-center space-y-3">
          <Bell size={36} className="mx-auto text-slate-500 opacity-60" />
          <h3 className="text-base font-bold text-white">No Notifications Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No notifications matching your search query. Try clearing the filter."
              : "No announcements scraped yet. Click 'Sync from ktunotes.in' to fetch the latest updates."}
          </p>
          <button
            onClick={() => fetchNotifs(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF3355] text-white text-xs font-bold"
          >
            <RefreshCw size={14} />
            <span>Sync Live Notifications</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((item, idx) => {
            const category = item.category || "Exam"
            const dateStr = item.published_date || "Recent"

            return (
              <div
                key={item.source_id || idx}
                className="p-4 sm:p-5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-lg"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF3355]/20 text-[#FF5577] border border-[#FF3355]/30">
                      {category}
                    </span>

                    {dateStr && (
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {dateStr}
                      </span>
                    )}

                    {item.pdf_url && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        PDF Available
                      </span>
                    )}
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-rose-400 transition-colors leading-snug">
                    {item.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                  <a
                    href={item.original_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
                    title="View on ktunotes.in"
                  >
                    <ExternalLink size={14} />
                  </a>

                  <Link
                    href={`/dashboard/studio?title=${encodeURIComponent(
                      item.title
                    )}&category=${encodeURIComponent(category)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2E4D] to-[#FF4565] text-white text-xs font-bold shadow-md shadow-rose-600/25 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <span>Design Poster</span>
                    <ArrowRight size={13} />
                  </Link>
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
        <div className="flex items-center justify-center h-64 text-white/50 text-xs">
          <RefreshCw size={20} className="animate-spin text-[#FF3355] mr-2" />
          Loading announcements...
        </div>
      }
    >
      <DashboardFeedContent />
    </Suspense>
  )
}
