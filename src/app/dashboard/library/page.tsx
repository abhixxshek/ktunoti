"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Library,
  Download,
  Trash2,
  Palette,
  ArrowRight,
  FileImage,
} from "lucide-react"
import { GeneratedPosterItem } from "@/types/poster-studio"

export default function PosterLibraryPage() {
  const router = useRouter()
  const [posters, setPosters] = useState<GeneratedPosterItem[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#FF3355] uppercase tracking-wider mb-1">
            <Library size={15} />
            <span>Saved Graphics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Poster Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your exported posters ready to share across WhatsApp groups and Instagram.
          </p>
        </div>

        <Link
          href="/dashboard/studio"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF2E4D] to-[#FF4565] text-white text-xs font-bold shadow-lg shadow-rose-600/30 hover:brightness-110 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Palette size={16} />
          <span>New Studio Poster</span>
        </Link>
      </div>

      {/* Grid of Posters */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/[0.02] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : posters.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-black/30 backdrop-blur-xl border border-white/[0.08] text-center space-y-4">
          <FileImage size={44} className="mx-auto text-slate-500 opacity-60" />
          <h3 className="text-lg font-bold text-white">No Saved Posters Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Choose any KTU announcement from the live feed and click &quot;Design Poster&quot; to export your first graphic in PNG, JPEG, or PDF.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF2E4D] to-[#FF4565] text-white text-xs font-bold shadow-lg shadow-rose-600/30"
          >
            <span>View Live Feed</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className="relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-xl border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-xl"
            >
              {/* Card Thumbnail */}
              <div className="h-60 bg-gradient-to-br from-slate-900 to-black p-4 flex flex-col justify-between border-b border-white/[0.06] relative overflow-hidden">
                {poster.dataUrl ? (
                  <img
                    src={poster.dataUrl}
                    alt={poster.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="my-auto text-center space-y-2 relative z-10 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#FF3355]/20 text-[#FF5577] border border-[#FF3355]/30">
                      {poster.category}
                    </span>
                    <h4 className="text-sm font-extrabold text-white line-clamp-2">
                      {poster.title}
                    </h4>
                  </div>
                )}

                {/* Overlaid Format Tag */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/20">
                    {poster.dimensions}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF3355] text-white">
                    {poster.exportFormat.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-5 space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {poster.templateName}
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-rose-400 transition-colors leading-snug">
                    {poster.title}
                  </h3>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDelete(poster.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Poster"
                  >
                    <Trash2 size={15} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(poster)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold border border-white/10 transition-all"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>

                    <Link
                      href={`/dashboard/studio?title=${encodeURIComponent(
                        poster.title
                      )}&category=${encodeURIComponent(
                        poster.category
                      )}&template=${poster.templateId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2E4D] to-[#FF4565] text-white text-xs font-bold shadow-md shadow-rose-600/20 hover:brightness-110 active:scale-95 transition-all"
                    >
                      <span>Edit</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
