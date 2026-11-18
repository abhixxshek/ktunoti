"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Download,
  Trash2,
  ArrowRight,
  FileImage,
  Search,
  Eye,
  X,
  Plus,
  Palette,
} from "lucide-react"
import { GeneratedPosterItem } from "@/types/poster-studio"

const FILTER_PILLS = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recent" },
  { id: "exported", label: "Exported" },
]

export default function PosterLibraryPage() {
  const router = useRouter()
  const [posters, setPosters] = useState<GeneratedPosterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alpha">("newest")
  const [previewPoster, setPreviewPoster] = useState<GeneratedPosterItem | null>(null)

  useEffect(() => {
    function loadLibrary() {
      setLoading(true)
      let items: GeneratedPosterItem[] = []

      if (typeof window !== "undefined") {
        const local = localStorage.getItem("ktu_generated_posters")
        if (local) {
          try {
            items = JSON.parse(local)
          } catch (e) {
            console.error(e)
          }
        }
      }

      setPosters(items)
      setLoading(false)
    }

    loadLibrary()
  }, [])

  const handleDelete = (id: string) => {
    const updated = posters.filter((p) => p.id !== id)
    setPosters(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("ktu_generated_posters", JSON.stringify(updated))
    }
    if (previewPoster?.id === id) setPreviewPoster(null)
  }

  const handleDownload = (poster: GeneratedPosterItem) => {
    if (!poster.dataUrl) {
      router.push(
        `/dashboard/studio?title=${encodeURIComponent(
          poster.title
        )}&category=${encodeURIComponent(poster.category)}&template=${poster.templateId}`
      )
      return
    }
    const link = document.createElement("a")
    link.download = `KTU_${poster.category.replace(/\s+/g, "_")}_${poster.id}.${poster.exportFormat}`
    link.href = poster.dataUrl
    link.click()
  }

  // Filtered and sorted posters
  const filteredPosters = useMemo(() => {
    let result = [...posters]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.templateName.toLowerCase().includes(q)
      )
    }

    if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortBy === "alpha") {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return result
  }, [posters, searchQuery, sortBy])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 sm:p-6 md:p-7 shadow-xs space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              YOUR CREATIVE WORKSPACE
            </div>
            <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#242424] tracking-tight leading-tight">
              Your designs, all in one place.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Every notification turned into a share-ready visual.
            </p>
          </div>

          <Link
            href="/dashboard/studio"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-xs sm:text-[13px] font-semibold shadow-xs transition-all self-start sm:self-auto active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>New poster</span>
          </Link>
        </div>

        {/* 3 Metric Summary Blocks - Compact grid on mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3.5 pt-4 sm:pt-5 border-t border-neutral-100">
          <div className="p-2.5 sm:p-4 rounded-[10px] bg-neutral-50/80 border border-neutral-200/60">
            <div className="text-lg sm:text-2xl font-bold text-[#242424] tracking-tight">
              {posters.length}
            </div>
            <div className="text-[10px] sm:text-xs font-medium text-neutral-500 mt-0.5 truncate">
              All designs
            </div>
          </div>

          <div className="p-2.5 sm:p-4 rounded-[10px] bg-neutral-50/80 border border-neutral-200/60">
            <div className="text-lg sm:text-2xl font-bold text-[#E94359] tracking-tight">
              {posters.filter((p) => p.dataUrl).length}
            </div>
            <div className="text-[10px] sm:text-xs font-medium text-neutral-500 mt-0.5 truncate">
              Exported
            </div>
          </div>

          <div className="p-2.5 sm:p-4 rounded-[10px] bg-neutral-50/80 border border-neutral-200/60">
            <div className="text-lg sm:text-2xl font-bold text-[#242424] tracking-tight">
              {posters.filter((p) => !p.dataUrl).length}
            </div>
            <div className="text-[10px] sm:text-xs font-medium text-neutral-500 mt-0.5 truncate">
              Drafts
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar & Filters (Fluid & Touch-friendly) ── */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 h-10 p-1 rounded-[10px] bg-white border border-[#E5E5E5] shadow-xs self-start sm:self-auto shrink-0">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedFilter(pill.id)}
              className={`h-8 px-3 sm:px-3.5 rounded-[8px] text-xs font-semibold transition-all whitespace-nowrap ${
                selectedFilter === pill.id
                  ? "bg-[#E94359] text-white shadow-xs"
                  : "text-neutral-600 hover:text-[#242424] hover:bg-neutral-50"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Right Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-white border border-[#E5E5E5] text-[13px] text-[#242424] placeholder:text-neutral-400 focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 shadow-xs transition-all"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-3 sm:px-3.5 rounded-[10px] bg-white border border-[#E5E5E5] text-xs font-medium text-neutral-700 shadow-xs focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 transition-all shrink-0"
          >
            <option value="newest">Recent</option>
            <option value="oldest">Oldest</option>
            <option value="alpha">A-Z</option>
          </select>
        </div>
      </div>

      {/* ── Responsive Poster Grid (2-column on mobile, 3 on tablet, 4 on desktop) ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-white border border-[#E5E5E5] p-4 animate-pulse"
            />
          ))}
        </div>
      ) : filteredPosters.length === 0 ? (
        <div className="p-10 sm:p-16 rounded-xl bg-white border border-[#E5E5E5] text-center space-y-3.5 shadow-xs">
          <FileImage size={40} className="mx-auto text-neutral-300" />
          <h3 className="text-base font-semibold text-[#242424]">
            No Saved Posters Yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Select any KTU announcement and click &quot;Design poster&quot; to render and export your first graphic.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[10px] bg-[#E94359] text-white text-[13px] font-semibold hover:bg-[#D83248] transition-colors shadow-xs"
          >
            <span>Browse Announcements</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 items-start">
          {filteredPosters.map((poster) => (
            <div
              key={poster.id}
              className="bg-white rounded-xl border border-[#E5E5E5] hover:border-neutral-300 hover:shadow-xs transition-all overflow-hidden flex flex-col group"
            >
              {/* Artwork Container (Tap to open preview modal) */}
              <div
                onClick={() => setPreviewPoster(poster)}
                className="bg-neutral-100/70 relative cursor-pointer overflow-hidden border-b border-[#E5E5E5] flex items-center justify-center p-2 sm:p-3 aspect-square"
              >
                {poster.dataUrl ? (
                  <img
                    src={poster.dataUrl}
                    alt={poster.title}
                    className="w-full h-full rounded-[6px] object-contain shadow-xs group-hover:scale-[1.02] transition-transform duration-200"
                  />
                ) : (
                  <div className="p-3 text-center space-y-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-neutral-200 text-neutral-700">
                      {poster.category}
                    </span>
                    <h4 className="text-[11px] font-semibold text-neutral-800 line-clamp-3">
                      {poster.title}
                    </h4>
                  </div>
                )}

                {/* Hover overlay for desktop */}
                <div className="hidden sm:flex absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2 p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewPoster(poster)
                    }}
                    className="size-9 rounded-[8px] bg-white text-[#242424] shadow-md hover:bg-neutral-50 inline-flex items-center justify-center transition-colors"
                    title="Preview"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(poster)
                    }}
                    className="size-9 rounded-[8px] bg-white text-[#242424] shadow-md hover:bg-neutral-50 inline-flex items-center justify-center transition-colors"
                    title="Download"
                  >
                    <Download size={15} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(poster.id)
                    }}
                    className="size-9 rounded-[8px] bg-white text-rose-600 shadow-md hover:bg-rose-50 inline-flex items-center justify-center transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Card Meta & Mobile Direct Actions */}
              <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                  <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[9px] sm:text-[10px] truncate max-w-[70%]">
                    {poster.category}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-[4px] text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    PNG
                  </span>
                </div>

                <h3
                  onClick={() => setPreviewPoster(poster)}
                  className="text-xs sm:text-[13px] font-semibold text-[#242424] line-clamp-2 hover:text-[#E94359] cursor-pointer transition-colors leading-snug"
                >
                  {poster.title}
                </h3>

                {/* Mobile direct tap actions */}
                <div className="pt-1.5 sm:pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-mono text-[10px] sm:text-[11px] truncate">
                    {poster.dimensions || "1080×1080"}
                  </span>

                  <div className="flex items-center gap-1 sm:hidden">
                    <button
                      onClick={() => handleDownload(poster)}
                      className="size-7 rounded-[6px] bg-neutral-100 text-neutral-700 flex items-center justify-center active:bg-neutral-200"
                      title="Download PNG"
                    >
                      <Download size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(poster.id)}
                      className="size-7 rounded-[6px] bg-rose-50 text-rose-600 flex items-center justify-center active:bg-rose-100"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <Link
                    href={`/dashboard/studio?title=${encodeURIComponent(
                      poster.title
                    )}&category=${encodeURIComponent(
                      poster.category
                    )}&template=${poster.templateId}`}
                    className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#E94359] hover:underline"
                  >
                    <span>Edit</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Responsive Touch-Friendly Preview Modal ── */}
      {previewPoster && (
        <div
          className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setPreviewPoster(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 border-b border-neutral-200 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  {previewPoster.category}
                </span>
                <h3 className="font-semibold text-xs sm:text-sm text-[#242424] truncate">
                  {previewPoster.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPoster(null)}
                className="size-8 rounded-[8px] hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 inline-flex items-center justify-center transition-colors shrink-0"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Image Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-100/60 flex items-center justify-center min-h-[260px]">
              {previewPoster.dataUrl ? (
                <img
                  src={previewPoster.dataUrl}
                  alt={previewPoster.title}
                  className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-xl shadow-lg"
                />
              ) : (
                <div className="p-8 text-center text-neutral-400 text-xs">
                  No preview graphic available.
                </div>
              )}
            </div>

            {/* Modal Footer Actions - Thumb friendly */}
            <div className="p-3.5 sm:p-4 border-t border-neutral-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="text-[11px] text-neutral-500 hidden sm:block">
                <span>{previewPoster.templateName}</span> ·{" "}
                <span className="font-mono">{previewPoster.dimensions}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(previewPoster.id)}
                  className="h-10 px-3.5 rounded-[10px] border border-neutral-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>

                <Link
                  href={`/dashboard/studio?title=${encodeURIComponent(
                    previewPoster.title
                  )}&category=${encodeURIComponent(
                    previewPoster.category
                  )}&template=${previewPoster.templateId}`}
                  className="h-10 px-3.5 rounded-[10px] border border-neutral-200 hover:bg-neutral-100 text-[#242424] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Palette size={14} />
                  <span>Edit in Studio</span>
                </Link>

                <button
                  onClick={() => handleDownload(previewPoster)}
                  className="flex-1 sm:flex-initial h-10 px-4 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
                >
                  <Download size={14} />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
