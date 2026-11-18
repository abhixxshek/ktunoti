"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Library,
  Download,
  Trash2,
  Palette,
  ArrowRight,
  FileImage,
  Search,
  SlidersHorizontal,
  Eye,
  X,
  ExternalLink,
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
    <div className="space-y-7 pb-16">
      {/* ── Page Header (Page 8) ── */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
              YOUR CREATIVE WORKSPACE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Your designs, all in one place.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Every notification turned into a share-ready visual.
            </p>
          </div>

          <Link
            href="/dashboard/studio"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E94359] hover:bg-[#D83248] text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus size={15} />
            <span>New poster</span>
          </Link>
        </div>

        {/* 3 Metric Summary Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-neutral-100">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100/80">
            <div className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              {posters.length}
            </div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">
              All designs
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100/80">
            <div className="text-2xl font-extrabold text-[#E94359] tracking-tight">
              {posters.filter((p) => p.dataUrl).length}
            </div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">
              Exported
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100/80">
            <div className="text-2xl font-extrabold text-neutral-900 tracking-tight">
              {posters.filter((p) => !p.dataUrl).length}
            </div>
            <div className="text-xs font-medium text-neutral-500 mt-0.5">
              Drafts
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar & Filters (Page 9) ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-neutral-200/80 shadow-sm">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setSelectedFilter(pill.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedFilter === pill.id
                  ? "bg-[#E94359] text-white shadow-xs"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
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
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#E94359] shadow-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-xs font-medium text-neutral-700 shadow-sm focus:outline-none"
          >
            <option value="newest">Recently created</option>
            <option value="oldest">Oldest first</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* ── Poster Grid (Page 8: 3 cols on desktop, 4 on wide, maintains aspect ratio) ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-72 rounded-2xl bg-white border border-neutral-200/60 p-5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredPosters.length === 0 ? (
        <div className="p-16 rounded-2xl bg-white border border-neutral-200/80 text-center space-y-4 shadow-sm">
          <FileImage size={40} className="mx-auto text-neutral-300" />
          <h3 className="text-base font-bold text-neutral-900">
            No Saved Posters Yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Select any KTU announcement and click &quot;Design poster&quot; to render and export your first graphic.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E94359] text-white text-xs font-semibold shadow-xs"
          >
            <span>Browse Announcements</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-start">
          {filteredPosters.map((poster) => (
            <div
              key={poster.id}
              className="bg-white rounded-2xl border border-neutral-200/80 hover:border-neutral-300 hover:shadow-md transition-all overflow-hidden flex flex-col group"
            >
              {/* Artwork Container (Maintains natural aspect ratio, clickable for preview) */}
              <div
                onClick={() => setPreviewPoster(poster)}
                className="bg-neutral-100 relative cursor-pointer overflow-hidden border-b border-neutral-100 flex items-center justify-center p-3"
              >
                {poster.dataUrl ? (
                  <img
                    src={poster.dataUrl}
                    alt={poster.title}
                    className="w-full h-auto rounded-lg object-contain shadow-xs group-hover:scale-[1.02] transition-transform duration-300"
                  />
                ) : (
                  <div className="py-12 px-4 text-center space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-200 text-neutral-700">
                      {poster.category}
                    </span>
                    <h4 className="text-xs font-bold text-neutral-800 line-clamp-3">
                      {poster.title}
                    </h4>
                  </div>
                )}

                {/* Hover Action Overlay (Page 9) */}
                <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewPoster(poster)
                    }}
                    className="p-2 rounded-xl bg-white text-neutral-900 shadow-md hover:bg-neutral-100 transition-colors"
                    title="Preview"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(poster)
                    }}
                    className="p-2 rounded-xl bg-white text-neutral-900 shadow-md hover:bg-neutral-100 transition-colors"
                    title="Download"
                  >
                    <Download size={15} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(poster.id)
                    }}
                    className="p-2 rounded-xl bg-white text-rose-600 shadow-md hover:bg-rose-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Card Meta & Actions (Page 8 & 9) */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                    {poster.category}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Exported
                  </span>
                </div>

                <h3
                  onClick={() => setPreviewPoster(poster)}
                  className="text-xs font-bold text-neutral-900 line-clamp-2 hover:text-[#E94359] cursor-pointer transition-colors leading-snug"
                >
                  {poster.title}
                </h3>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>{poster.dimensions}</span>

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

      {/* ── Large Preview Modal (Page 9) ── */}
      {previewPoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
            onClick={() => setPreviewPoster(null)}
          />

          <div className="relative z-10 w-full max-w-2xl bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {previewPoster.category}
                </span>
                <h3 className="text-sm font-bold text-neutral-900 line-clamp-1">
                  {previewPoster.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewPoster(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700"
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
                  className="max-h-[55vh] w-auto object-contain rounded-lg shadow-sm"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold shadow-xs"
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
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E94359] hover:bg-[#D83248] text-white text-xs font-semibold shadow-xs"
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
