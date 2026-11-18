"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import jsPDF from "jspdf"
import {
  Download,
  Save,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Layers,
  Palette,
  Sliders,
  CheckCircle2,
  FileImage,
  Upload,
  RefreshCw,
  Eye,
  Settings2,
  Check,
} from "lucide-react"
import {
  BTECH_CATEGORIES,
  BTechCategory,
  PosterDesignState,
  PosterFormatKey,
  LogoPlacement,
} from "@/types/poster-studio"
import {
  TEMPLATE_LIBRARY,
  POSTER_FORMATS,
  CATEGORY_TEMPLATE_MAP,
} from "@/data/templates-and-seed"
import { renderPosterToDataUrl } from "@/utils/canvas-exporter"
import { PosterCanvasPreview } from "@/components/studio/PosterCanvasPreview"

function resolveKtuCategoryAndTemplate(
  rawCat?: string | null,
  title?: string | null
): { category: BTechCategory; templateId: string } {
  const catLower = (rawCat || "").toLowerCase()
  const titleLower = (title || "").toLowerCase()

  if (titleLower.includes("timetable") || titleLower.includes("time table")) {
    return { category: "Time Table", templateId: "examination-timetable" }
  }
  if (titleLower.includes("revaluation") || titleLower.includes("answer script")) {
    return { category: "Revaluation", templateId: "important-notification" }
  }
  if (titleLower.includes("result") || catLower.includes("result")) {
    return { category: "Examination Results", templateId: "results-announcement" }
  }
  if (titleLower.includes("registration") || catLower.includes("registration")) {
    return { category: "Registration", templateId: "registration-reminder" }
  }
  if (titleLower.includes("circular") || catLower.includes("circular")) {
    return { category: "Circulars", templateId: "academic-circular" }
  }
  if (titleLower.includes("calendar") || catLower.includes("calendar")) {
    return { category: "Academic Calendar", templateId: "minimal-academic" }
  }
  if (titleLower.includes("fee") || catLower.includes("fee")) {
    return { category: "Fee Notifications", templateId: "corporate-blue" }
  }
  if (catLower.includes("academic") || catLower.includes("admission")) {
    return { category: "Academic Notifications", templateId: "minimal-academic" }
  }

  return { category: "Examination Notifications", templateId: "bold-exam-alert" }
}

function PosterStudioInner() {
  const searchParams = useSearchParams()

  const paramTitle = searchParams.get("title") || ""
  const paramCat = searchParams.get("category")
  const paramSem = searchParams.get("semester") || ""
  const paramRef = searchParams.get("ref") || ""
  const paramMalayalam = searchParams.get("malayalam") || ""

  const resolved = resolveKtuCategoryAndTemplate(paramCat, paramTitle)

  const [selectedFormat, setSelectedFormat] =
    useState<PosterFormatKey>("instagram_portrait")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    searchParams.get("template") || resolved.templateId
  )
  const [zoom, setZoom] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<"content" | "templates" | "styling">("content")
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [exportNotice, setExportNotice] = useState<string | null>(null)

  // Design state initialized from URL query parameters
  const [design, setDesign] = useState<PosterDesignState>({
    title: paramTitle || "APJ Abdul Kalam Technological University Announcement",
    malayalamSubtitle: paramMalayalam,
    description: "",
    category: resolved.category,
    importantDate: "",
    deadline: "",
    examDate: "",
    semester: paramSem,
    academicYear: "",
    officialReference: paramRef,
    sourceText: "Official Notification • ktunotes.in",
    footerText: "APJ Abdul Kalam Technological University",
    fontSizeScale: 1.0,
    textAlign: "left",
    accentColorOverride: "",
    cardBgOverride: "",
    customBackgroundImage: null,
    logoPlacement: "top-right",
  })

  // Sync state whenever URL searchParams change
  useEffect(() => {
    const currentTitle = searchParams.get("title")
    if (currentTitle) {
      const { category, templateId } = resolveKtuCategoryAndTemplate(
        searchParams.get("category"),
        currentTitle
      )
      setDesign((prev) => ({
        ...prev,
        title: currentTitle,
        category: category,
        semester: searchParams.get("semester") || "",
        officialReference: searchParams.get("ref") || "",
        malayalamSubtitle: searchParams.get("malayalam") || "",
      }))
      setSelectedTemplateId(searchParams.get("template") || templateId)
    }
  }, [searchParams])

  // Selected template object
  const currentTemplate =
    TEMPLATE_LIBRARY.find((t) => t.id === selectedTemplateId) ||
    TEMPLATE_LIBRARY[0]

  // File upload handler for custom background
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setDesign((prev) => ({
            ...prev,
            customBackgroundImage: event.target!.result as string,
          }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Export as PNG / JPEG
  const handleExport = async (format: "png" | "jpeg") => {
    setIsExporting(true)
    setExportNotice(null)
    try {
      const dataUrl = await renderPosterToDataUrl({
        template: currentTemplate,
        formatKey: selectedFormat,
        design,
        exportFormat: format,
      })

      const link = document.createElement("a")
      link.download = `KTU-${design.category.replace(/\s+/g, "_")}-${Date.now()}.${format}`
      link.href = dataUrl
      link.click()

      // Also persist to local library cache
      saveToLocalLibrary(dataUrl, format)

      setExportNotice(`Successfully exported ${format.toUpperCase()}!`)
      setTimeout(() => setExportNotice(null), 3500)
    } catch (err: any) {
      alert("Export failed: " + (err.message || "Unknown error"))
    } finally {
      setIsExporting(false)
    }
  }

  // Export as PDF
  const handleExportPdf = async () => {
    setIsExporting(true)
    setExportNotice(null)
    try {
      const dataUrl = await renderPosterToDataUrl({
        template: currentTemplate,
        formatKey: selectedFormat,
        design,
        exportFormat: "png",
      })

      const spec = POSTER_FORMATS[selectedFormat]
      const pdf = new jsPDF({
        orientation: spec.width > spec.height ? "landscape" : "portrait",
        unit: "px",
        format: [spec.width, spec.height],
      })

      pdf.addImage(dataUrl, "PNG", 0, 0, spec.width, spec.height)
      pdf.save(`KTU-${design.category.replace(/\s+/g, "_")}-${Date.now()}.pdf`)

      setExportNotice("Successfully exported PDF!")
      setTimeout(() => setExportNotice(null), 3500)
    } catch (err: any) {
      alert("PDF export failed: " + (err.message || "Unknown error"))
    } finally {
      setIsExporting(false)
    }
  }

  // Save to local library
  const saveToLocalLibrary = (dataUrl: string, exportFormat: "png" | "jpeg") => {
    if (typeof window === "undefined") return
    try {
      const existing = JSON.parse(
        localStorage.getItem("ktu_generated_posters") || "[]"
      )
      const newItem = {
        id: "post-" + Date.now(),
        announcementId: Date.now(),
        title: design.title,
        category: design.category,
        templateId: currentTemplate.id,
        templateName: currentTemplate.name,
        formatKey: selectedFormat,
        dimensions: `${POSTER_FORMATS[selectedFormat].width}x${POSTER_FORMATS[selectedFormat].height}`,
        exportFormat,
        dataUrl,
        createdAt: new Date().toISOString(),
        mode: "Manual Studio",
      }
      localStorage.setItem(
        "ktu_generated_posters",
        JSON.stringify([newItem, ...existing.slice(0, 19)])
      )
    } catch (e) {
      console.warn("Could not save to localStorage", e)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-7xl mx-auto">
      {/* Top Studio Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/[0.08] mb-4 shrink-0 shadow-xl">
        {/* Aspect Ratio Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 overflow-x-auto">
          {(Object.keys(POSTER_FORMATS) as PosterFormatKey[]).map((fKey) => {
            const spec = POSTER_FORMATS[fKey]
            const active = selectedFormat === fKey
            return (
              <button
                key={fKey}
                onClick={() => setSelectedFormat(fKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? "bg-[#FF3355] text-white shadow-md shadow-rose-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {spec.shortLabel}
              </button>
            )
          })}
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1 text-slate-400 text-xs">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="w-12 text-center font-mono font-semibold">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 size={15} />
          </button>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center gap-2">
          {exportNotice && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 size={14} />
              {exportNotice}
            </span>
          )}

          <button
            onClick={() => handleExport("png")}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <FileImage size={14} />
            <span>PNG</span>
          </button>

          <button
            onClick={() => handleExport("jpeg")}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <FileImage size={14} />
            <span>JPEG</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FF2E4D] to-[#FF4565] text-white text-xs font-bold shadow-lg shadow-rose-600/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Canvas + Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Left Side: Canvas Preview Stage */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-8 rounded-3xl bg-black/30 backdrop-blur-2xl border border-white/[0.08] relative overflow-y-auto overflow-x-hidden shadow-2xl">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-white/[0.08] border border-white/15 text-slate-300">
              {currentTemplate.name}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {POSTER_FORMATS[selectedFormat].width} ×{" "}
              {POSTER_FORMATS[selectedFormat].height}
            </span>
          </div>

          <div className="my-auto w-full flex items-center justify-center py-6">
            <PosterCanvasPreview
              template={currentTemplate}
              formatKey={selectedFormat}
              design={design}
              scale={zoom}
            />
          </div>
        </div>

        {/* Right Side: Inspector Tabs & Controls */}
        <div className="lg:col-span-5 flex flex-col rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.08] bg-white/[0.02]">
            {[
              { id: "content", label: "Content", icon: Sliders },
              { id: "templates", label: "11 Templates", icon: Layers },
              { id: "styling", label: "Styling & Brand", icon: Palette },
            ].map((t) => {
              const Icon = t.icon
              const active = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 py-3 px-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                    active
                      ? "border-[#FF3355] text-white bg-white/[0.04]"
                      : "border-transparent text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={14} className={active ? "text-[#FF3355]" : ""} />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Panes */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 1. CONTENT TAB */}
            {activeTab === "content" && (
              <div className="space-y-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    B.Tech Category
                  </label>
                  <select
                    value={design.category}
                    onChange={(e) => {
                      const newCat = e.target.value as BTechCategory
                      const tplId = CATEGORY_TEMPLATE_MAP[newCat]
                      setDesign((d) => ({ ...d, category: newCat }))
                      if (tplId) setSelectedTemplateId(tplId)
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#FF3355]"
                  >
                    {BTECH_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Main Title */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Announcement Headline
                  </label>
                  <textarea
                    rows={3}
                    value={design.title}
                    onChange={(e) =>
                      setDesign((d) => ({ ...d, title: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs leading-relaxed focus:outline-none focus:border-[#FF3355]"
                    placeholder="Enter main headline..."
                  />
                </div>

                {/* Malayalam Subtitle */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Malayalam Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={design.malayalamSubtitle}
                    onChange={(e) =>
                      setDesign((d) => ({
                        ...d,
                        malayalamSubtitle: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#FF3355]"
                    placeholder="മലയാളം അടിക്കുറിപ്പ്..."
                  />
                </div>

                {/* Optional Metadata Badges */}
                <div className="pt-3 border-t border-white/[0.06] space-y-3">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Optional Reference Badges
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Semester (Optional)
                      </label>
                      <input
                        type="text"
                        value={design.semester}
                        onChange={(e) =>
                          setDesign((d) => ({ ...d, semester: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs"
                        placeholder="e.g. S6"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">
                        KTU Ref (Optional)
                      </label>
                      <input
                        type="text"
                        value={design.officialReference}
                        onChange={(e) =>
                          setDesign((d) => ({
                            ...d,
                            officialReference: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs font-mono"
                        placeholder="e.g. KTU/EX-II/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Footer and Source */}
                <div className="pt-3 border-t border-white/[0.06] space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Source Attribution
                    </label>
                    <input
                      type="text"
                      value={design.sourceText}
                      onChange={(e) =>
                        setDesign((d) => ({ ...d, sourceText: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      Footer Watermark
                    </label>
                    <input
                      type="text"
                      value={design.footerText}
                      onChange={(e) =>
                        setDesign((d) => ({ ...d, footerText: e.target.value }))
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. TEMPLATES TAB */}
            {activeTab === "templates" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Select from 11 purpose-built design systems designed for university announcements:
                </p>

                <div className="space-y-2.5">
                  {TEMPLATE_LIBRARY.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-white/[0.1] border-[#FF3355] shadow-lg shadow-rose-950/40"
                            : "bg-black/30 border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            style={{ background: tpl.bgGradient }}
                            className="w-9 h-9 rounded-xl border border-white/20 shrink-0 shadow"
                          />
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>{tpl.name}</span>
                              <span className="text-[10px] font-normal text-slate-400">
                                ({tpl.styleName})
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {tpl.description}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#FF3355] flex items-center justify-center text-white shrink-0">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. STYLING & BRAND TAB */}
            {activeTab === "styling" && (
              <div className="space-y-5">
                {/* Font Scaling */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                    <span>Title Font Size Scale</span>
                    <span className="font-mono">
                      {Math.round(design.fontSizeScale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.3"
                    step="0.05"
                    value={design.fontSizeScale}
                    onChange={(e) =>
                      setDesign((d) => ({
                        ...d,
                        fontSizeScale: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-[#FF3355] cursor-pointer"
                  />
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Text Alignment
                  </label>
                  <div className="flex gap-2">
                    {(["left", "center", "right"] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() =>
                          setDesign((d) => ({ ...d, textAlign: align }))
                        }
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize flex items-center justify-center gap-1.5 border transition-all ${
                          design.textAlign === align
                            ? "bg-[#FF3355] text-white border-[#FF3355]"
                            : "bg-black/40 text-slate-400 border-white/5 hover:text-white"
                        }`}
                      >
                        {align === "left" && <AlignLeft size={14} />}
                        {align === "center" && <AlignCenter size={14} />}
                        {align === "right" && <AlignRight size={14} />}
                        <span>{align}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Placement */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    KTU Crest Placement
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "top-right", label: "Top Right" },
                        { id: "top-left", label: "Top Left" },
                        { id: "bottom-right", label: "Bottom Badge" },
                        { id: "hidden", label: "Hidden" },
                      ] as const
                    ).map((p) => (
                      <button
                        key={p.id}
                        onClick={() =>
                          setDesign((d) => ({ ...d, logoPlacement: p.id }))
                        }
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                          design.logoPlacement === p.id
                            ? "bg-white/[0.12] text-white border-white/30 shadow-md"
                            : "bg-black/40 text-slate-400 border-white/5 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Background Image Upload */}
                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Custom Background Image
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black/60 border border-dashed border-white/20 text-xs font-semibold text-slate-300 hover:text-white hover:border-white/40 cursor-pointer transition-colors">
                      <Upload size={14} />
                      <span>Upload Texture / Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="hidden"
                      />
                    </label>

                    {design.customBackgroundImage && (
                      <button
                        onClick={() =>
                          setDesign((d) => ({
                            ...d,
                            customBackgroundImage: null,
                          }))
                        }
                        className="px-3 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PosterStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="animate-spin text-rose-500" size={32} />
        </div>
      }
    >
      <PosterStudioInner />
    </Suspense>
  )
}
