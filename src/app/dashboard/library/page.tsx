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
} from "lucide-react"
import { GeneratedPosterItem } from "@/types/poster-studio"

const FILTER_PILLS = [
  { id: "all", label: "All designs" },
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
    <div className="space-y-6 pb-16">
      {/* ── Page Header ── */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              YOUR CREATIVE WORKSPACE
            </div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#242424] tracking-tight leading-tight">
              Your designs, all in one place.
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Every notification turned into a share-ready visual.
            </p>
          </div>

          <Link
            href="/dashboard/studio"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-[13px] font-semibold shadow-xs transition-all self-start sm:self-auto active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>New poster</span>
          </Link>
        </div>

        {/* 3 Metric Summary Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5 border-t border-neutral-100">
          <div className="p-4 rounded-[10px] bg-neutral-50/80 border border-neutral-200/60">
            <div className="text-2xl font-bold text-[#242424] tracking-tight">
              {posters.length}
            </div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">
              All designs
            </div>
          </div>

          <div className="p-4 rounded-[10px] bg-neutral-50/80 border border-neutral-200/60">
            <div className="text-2xl font-bold text-[#E94359] tracking-tight">
              {posters.filter((p) => p.dataUrl).length}
            </div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">
              Exported
            </div>
          </div>

          <div className="p-4 rounded-[10px] bg-neutral-50/80 border border-neutral-200/60">
            <div className="text-2xl font-bold text-[#242424] tracking-tight">
              {posters.filter((p) => !p.dataUrl).length}
            </div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">
              Drafts
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar & Filters (40px Standard Controls) ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 h-10 p-1 rounded-[10px] bg-white border border-[#E5E5E5] shadow-xs">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedFilter(pill.id)}
              className={`h-8 px-3.5 rounded-[8px] text-xs font-semibold transition-all whitespace-nowrap ${
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
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:w-60">
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
            className="h-10 px-3.5 rounded-[10px] bg-white border border-[#E5E5E5] text-xs font-medium text-neutral-700 shadow-xs focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 transition-all"
          >
            <option value="newest">Recently created</option>
            <option value="oldest">Oldest first</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* ── Poster Grid (Maintains natural aspect ratio) ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-72 rounded-xl bg-white border border-[#E5E5E5] p-5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredPosters.length === 0 ? (
        <div className="p-16 rounded-xl bg-white border border-[#E5E5E5] text-center space-y-3.5 shadow-xs">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
          {filteredPosters.map((poster) => (
            <div
              key={poster.id}
              className="bg-white rounded-xl border border-[#E5E5E5] hover:border-neutral-300 hover:shadow-xs transition-all overflow-hidden flex flex-col group"
            >
              {/* Artwork Container (Clickable for preview) */}
              <div
                onClick={() => setPreviewPoster(poster)}
                className="bg-neutral-100/70 relative cursor-pointer overflow-hidden border-b border-[#E5E5E5] flex items-center justify-center p-3"
              >
                {poster.dataUrl ? (
                  <img
                    src={poster.dataUrl}
                    alt={poster.title}
                    className="w-full h-auto rounded-[6px] object-contain shadow-xs group-hover:scale-[1.01] transition-transform duration-200"
                  />
                ) : (
                  <div className="py-12 px-4 text-center space-y-2">
                    <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase bg-neutral-200 text-neutral-700">
                      {poster.category}
                    </span>
                    <h4 className="text-xs font-semibold text-neutral-800 line-clamp-3">
                      {poster.title}
                    </h4>
                  </div>
                )}

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewPoster(poster)
                    }}
                    className="size-9 rounded-[8px] bg-white text-[#242424] shadow-md hover:bg-neutral-50 inline-flex items-center justify-center transition-colors"
                    title="Preview"
                    aria-label="Preview"
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
                    aria-label="Download"
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
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                    {poster.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                    Exported
                  </span>
                </div>

                <h3
                  onClick={() => setPreviewPoster(poster)}
                  className="text-[13px] font-semibold text-[#242424] line-clamp-2 hover:text-[#E94359] cursor-pointer transition-colors leading-snug"
                >
                  {poster.title}
                </h3>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-mono text-[11px]">{poster.dimensions}</span>

                  <Link
                    href={`/dashboard/studio?title=${encodeURIComponent(
                      poster.title
                    )}&category=${encodeURIComponent(
                      poster.category
                    )}&template=${poster.templateId}`}
                    className="text-xs font-semibold text-[#E94359] hover:underline flex items-center gap-1"
                  >
                    <span>Edit</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Large Preview Modal ── */}
      {previewPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
            onClick={() => setPreviewPoster(null)}
          />

          <div className="relative z-10 w-full max-w-2xl bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {previewPoster.category}
                </span>
                <h3 className="text-sm font-bold text-[#242424] line-clamp-1">
                  {previewPoster.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPoster(null)}
                className="size-8 rounded-[8px] inline-flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Large Artwork */}
            <div className="bg-neutral-100 rounded-xl p-4 flex items-center justify-center max-h-[60vh] overflow-hidden">
              {previewPoster.dataUrl ? (
                <img
                  src={previewPoster.dataUrl}
                  alt={previewPoster.title}
                  className="max-h-[55vh] w-auto object-contain rounded-lg shadow-xs"
                />
              ) : (
                <div className="py-12 text-center text-xs text-neutral-500">
                  Artwork available in studio editor.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-neutral-500 font-mono">
                {previewPoster.dimensions} · {previewPoster.exportFormat.toUpperCase()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(previewPoster)}
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-[10px] bg-neutral-900 hover:bg-neutral-800 text-white text-[13px] font-semibold shadow-xs transition-colors"
                >
                  <Download size={14} />
                  <span>Download file</span>
                </button>

                <Link
                  href={`/dashboard/studio?title=${encodeURIComponent(
                    previewPoster.title
                  )}&category=${encodeURIComponent(
                    previewPoster.category
                  )}&template=${previewPoster.templateId}`}
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-[13px] font-semibold shadow-xs transition-colors"
                >
                  <span>Edit in Studio</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
