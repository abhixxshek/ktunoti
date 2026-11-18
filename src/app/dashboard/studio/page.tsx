"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import jsPDF from "jspdf"
import {
  Download,
  RotateCcw,
  RotateCw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers,
  Type,
  Palette,
  Sparkles,
  Sliders,
  CheckCircle2,
  Upload,
  FileImage,
  X,
  Check,
  Shapes,
  Image as ImageIcon,
  Wand2,
} from "lucide-react"
import {
  BTECH_CATEGORIES,
  BTechCategory,
  PosterDesignState,
  PosterFormatKey,
} from "@/types/poster-studio"
import {
  TEMPLATE_LIBRARY,
  POSTER_FORMATS,
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
  const [activeTool, setActiveTool] = useState<"templates" | "text" | "elements" | "colors" | "branding">("templates")
  const [activeTab, setActiveTab] = useState<"content" | "templates" | "styling">("content")
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [showExportModal, setShowExportModal] = useState<boolean>(false)
  const [savedStatus, setSavedStatus] = useState<boolean>(true)

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

  // History stack for Undo / Redo
  const [history, setHistory] = useState<PosterDesignState[]>([design])
  const [historyIndex, setHistoryIndex] = useState(0)

  const pushState = (newDesign: PosterDesignState) => {
    const updated = history.slice(0, historyIndex + 1)
    setHistory([...updated, newDesign])
    setHistoryIndex(updated.length)
    setDesign(newDesign)
    setSavedStatus(false)
    setTimeout(() => setSavedStatus(true), 800)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setDesign(history[historyIndex - 1])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setDesign(history[historyIndex + 1])
    }
  }

  // Synchronize when searchParams update
  useEffect(() => {
    const t = searchParams.get("title")
    if (t) {
      const c = searchParams.get("category")
      const r = resolveKtuCategoryAndTemplate(c, t)
      const newD: PosterDesignState = {
        title: t,
        malayalamSubtitle: searchParams.get("malayalam") || "",
        description: "",
        category: r.category,
        importantDate: "",
        deadline: "",
        examDate: "",
        semester: searchParams.get("semester") || "",
        academicYear: "",
        officialReference: searchParams.get("ref") || "",
        sourceText: "Official Notification • ktunotes.in",
        footerText: "APJ Abdul Kalam Technological University",
        fontSizeScale: 1.0,
        textAlign: "left",
        accentColorOverride: "",
        cardBgOverride: "",
        customBackgroundImage: null,
        logoPlacement: "top-right",
      }
      setDesign(newD)
      setSelectedTemplateId(searchParams.get("template") || r.templateId)
      setHistory([newD])
      setHistoryIndex(0)
    }
  }, [searchParams])

  const currentTemplate =
    TEMPLATE_LIBRARY.find((t) => t.id === selectedTemplateId) ||
    TEMPLATE_LIBRARY[0]

  // AI Improve Layout handler
  const handleAiImproveLayout = () => {
    let optimalScale = 1.0
    const charLen = design.title.length

    if (charLen > 180) optimalScale = 0.8
    else if (charLen > 120) optimalScale = 0.88
    else if (charLen > 70) optimalScale = 0.95
    else if (charLen < 40) optimalScale = 1.15

    let align: "left" | "center" = "left"
    if (currentTemplate.id === "bold-exam-alert" || currentTemplate.id === "results-announcement") {
      align = "center"
    }

    const updated: PosterDesignState = {
      ...design,
      fontSizeScale: optimalScale,
      textAlign: align,
      logoPlacement: align === "center" ? "top-right" : "top-right",
    }
    pushState(updated)
  }

  // Upload Custom Texture
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string
        pushState({ ...design, customBackgroundImage: result })
      }
      reader.readAsDataURL(file)
    }
  }

  // Export handlers
  const handleDownload = async (exportFormat: "png" | "jpeg") => {
    setIsExporting(true)
    try {
      const dataUrl = await renderPosterToDataUrl({
        template: currentTemplate,
        formatKey: selectedFormat,
        design,
        exportFormat,
      })

      const link = document.createElement("a")
      link.download = `KTU-${design.category.replace(/\s+/g, "_")}-${Date.now()}.${exportFormat}`
      link.href = dataUrl
      link.click()

      saveToLocalLibrary(dataUrl, exportFormat)
      setShowExportModal(false)
    } catch (err: any) {
      alert("Export failed: " + (err.message || "Unknown error"))
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadPdf = async () => {
    setIsExporting(true)
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

      saveToLocalLibrary(dataUrl, "png")
      setShowExportModal(false)
    } catch (err: any) {
      alert("PDF export failed: " + (err.message || "Unknown error"))
    } finally {
      setIsExporting(false)
    }
  }

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
        dimensions: `${POSTER_FORMATS[selectedFormat].width} × ${POSTER_FORMATS[selectedFormat].height}`,
        exportFormat,
        dataUrl,
        createdAt: new Date().toISOString(),
        mode: "Manual Studio",
      }
      localStorage.setItem(
        "ktu_generated_posters",
        JSON.stringify([newItem, ...existing.slice(0, 24)])
      )
    } catch (e) {
      console.warn("Could not save to localStorage", e)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] w-full">
      {/* ── TOP APPLICATION BAR (40px Standard Controls) ── */}
      <div className="flex items-center justify-between gap-3 px-5 py-2.5 rounded-xl bg-white border border-[#E5E5E5] mb-4 shrink-0 shadow-xs">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-[#242424] tracking-tight">
            KTU Notify Studio
          </span>
          <span className="text-neutral-300">|</span>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-neutral-700">
              {savedStatus ? "Saved" : "Saving..."}
            </span>
          </div>
        </div>

        {/* Center: Format Switcher (4:5 · 9:16 · 1:1 · 16:9) */}
        <div className="hidden md:flex items-center gap-1 h-10 p-1 rounded-[10px] bg-neutral-100 border border-neutral-200/60">
          {(Object.keys(POSTER_FORMATS) as PosterFormatKey[]).map((fKey) => {
            const spec = POSTER_FORMATS[fKey]
            const active = selectedFormat === fKey
            return (
              <button
                key={fKey}
                onClick={() => setSelectedFormat(fKey)}
                className={`h-8 px-3 rounded-[8px] text-xs font-semibold transition-all whitespace-nowrap ${
                  active
                    ? "bg-white text-[#242424] shadow-xs"
                    : "text-neutral-500 hover:text-[#242424]"
                }`}
              >
                {spec.shortLabel}
              </button>
            )
          })}
        </div>

        {/* Right: History & Primary Export Button */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 mr-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="size-8 inline-flex items-center justify-center rounded-[8px] text-neutral-500 hover:text-[#242424] hover:bg-neutral-100 disabled:opacity-30 transition-colors"
              title="Undo"
              aria-label="Undo"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="size-8 inline-flex items-center justify-center rounded-[8px] text-neutral-500 hover:text-[#242424] hover:bg-neutral-100 disabled:opacity-30 transition-colors"
              title="Redo"
              aria-label="Redo"
            >
              <RotateCw size={15} />
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-[13px] font-semibold shadow-xs transition-all active:scale-[0.98]"
          >
            <Download size={14} />
            <span>Export poster ↓</span>
          </button>
        </div>
      </div>

      {/* ── 3-PART CREATIVE WORKSPACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* 1. LEFT TOOLBAR RAIL */}
        <div className="hidden lg:flex lg:col-span-1 flex-col items-center py-4 bg-white rounded-xl border border-[#E5E5E5] shadow-xs space-y-3">
          {[
            { id: "templates", label: "Templates", icon: Layers, tab: "templates" },
            { id: "text", label: "Text", icon: Type, tab: "content" },
            { id: "elements", label: "Elements", icon: Shapes, tab: "content" },
            { id: "colors", label: "Colors", icon: Palette, tab: "styling" },
            { id: "branding", label: "Branding", icon: ImageIcon, tab: "styling" },
          ].map((tool) => {
            const Icon = tool.icon
            const active = activeTool === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id as any)
                  setActiveTab(tool.tab as any)
                }}
                className={`flex flex-col items-center justify-center w-14 h-13 rounded-[10px] border transition-all ${
                  active
                    ? "bg-[#FDF2F4] text-[#E94359] border-[#F8C6CD] font-semibold shadow-xs"
                    : "text-neutral-500 hover:text-[#242424] hover:bg-neutral-50 border-transparent font-medium"
                }`}
              >
                <Icon size={17} />
                <span className="text-[10px] mt-1">{tool.label}</span>
              </button>
            )
          })}
        </div>

        {/* 2. CENTER CANVAS */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 sm:p-8 rounded-xl bg-neutral-100/70 border border-[#E5E5E5] relative overflow-y-auto overflow-x-hidden shadow-xs studio-canvas-bg">
          {/* Top Canvas Bar */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-[8px] text-[10px] font-bold uppercase bg-white/95 backdrop-blur-xs border border-[#E5E5E5] text-neutral-700 shadow-xs">
              {currentTemplate.name}
            </span>
            <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
              {POSTER_FORMATS[selectedFormat].width} ×{" "}
              {POSTER_FORMATS[selectedFormat].height}
            </span>
          </div>

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-[8px] border border-[#E5E5E5] shadow-xs text-xs text-neutral-600">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 rounded hover:bg-neutral-100"
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="w-10 text-center font-mono font-semibold text-[11px]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1 rounded hover:bg-neutral-100"
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 rounded hover:bg-neutral-100"
              title="Fit"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          {/* Actual Live Rendered Poster */}
          <div className="my-auto w-full flex items-center justify-center py-6">
            <PosterCanvasPreview
              template={currentTemplate}
              formatKey={selectedFormat}
              design={design}
              scale={zoom}
            />
          </div>
        </div>

        {/* 3. RIGHT PROPERTIES INSPECTOR */}
        <div className="lg:col-span-4 flex flex-col rounded-xl bg-white border border-[#E5E5E5] shadow-xs overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-neutral-100 bg-neutral-50/50">
            {[
              { id: "content", label: "Content", icon: Sliders },
              { id: "templates", label: "Templates", icon: Layers },
              { id: "styling", label: "Styling & Brand", icon: Palette },
            ].map((t) => {
              const Icon = t.icon
              const active = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 h-11 px-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
                    active
                      ? "border-[#E94359] text-[#E94359] bg-white"
                      : "border-transparent text-neutral-500 hover:text-[#242424]"
                  }`}
                >
                  <Icon size={14} />
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
                {/* AI Improve Layout Button */}
                <button
                  onClick={handleAiImproveLayout}
                  className="w-full h-10 px-4 rounded-[10px] bg-[#FDF2F4] hover:bg-[#FCE7EB] text-[#E94359] text-[13px] font-semibold flex items-center justify-center gap-2 border border-[#F8C6CD] transition-colors active:scale-[0.98]"
                >
                  <Wand2 size={15} />
                  <span>AI Improve Layout</span>
                </button>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    B.Tech Category
                  </label>
                  <select
                    value={design.category}
                    onChange={(e) => {
                      const newCat = e.target.value as BTechCategory
                      pushState({ ...design, category: newCat })
                    }}
                    className="w-full h-10 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
                  >
                    {BTECH_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Headline Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Announcement Headline
                  </label>
                  <textarea
                    rows={3}
                    value={design.title}
                    onChange={(e) =>
                      setDesign((d) => ({ ...d, title: e.target.value }))
                    }
                    onBlur={() => pushState(design)}
                    className="w-full p-3 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] leading-relaxed focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
                    placeholder="Enter announcement headline..."
                  />
                </div>

                {/* Malayalam Subtitle */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
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
                    onBlur={() => pushState(design)}
                    className="w-full h-10 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
                    placeholder="മലയാളം അടിക്കുറിപ്പ്..."
                  />
                </div>

                {/* Semester & Reference */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                      Semester
                    </label>
                    <input
                      type="text"
                      value={design.semester}
                      onChange={(e) =>
                        setDesign((d) => ({ ...d, semester: e.target.value }))
                      }
                      onBlur={() => pushState(design)}
                      className="w-full h-10 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
                      placeholder="e.g. S6"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
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
                      onBlur={() => pushState(design)}
                      className="w-full h-10 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-mono focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
                      placeholder="e.g. KTU/EX-II/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. TEMPLATES TAB */}
            {activeTab === "templates" && (
              <div className="space-y-3">
                <div className="text-xs text-neutral-500 font-medium">
                  11 Calibrated KTU Design Presets
                </div>

                <div className="space-y-2">
                  {TEMPLATE_LIBRARY.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`p-3 rounded-[10px] border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-[#FDF2F4] border-[#E94359] shadow-xs"
                            : "bg-white border-[#E5E5E5] hover:border-neutral-300 hover:bg-neutral-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            style={{ background: tpl.bgGradient }}
                            className="size-8 rounded-[8px] border border-neutral-200 shrink-0 shadow-xs"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#242424] flex items-center gap-1.5">
                              <span>{tpl.name}</span>
                              <span className="text-[10px] font-normal text-neutral-400">
                                ({tpl.styleName})
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 line-clamp-1">
                              {tpl.description}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="size-5 rounded-full bg-[#E94359] flex items-center justify-center text-white shrink-0">
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
                  <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1.5">
                    <span>Title Font Size Scale</span>
                    <span className="font-mono text-neutral-500">
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
                    onMouseUp={() => pushState(design)}
                    className="w-full accent-[#E94359] cursor-pointer"
                  />
                </div>

                {/* Text Alignment */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Text Alignment
                  </label>
                  <div className="flex gap-2">
                    {(["left", "center", "right"] as const).map((align) => (
                      <button
                        key={align}
                        onClick={() =>
                          pushState({ ...design, textAlign: align })
                        }
                        className={`flex-1 h-9 rounded-[8px] text-xs font-semibold capitalize flex items-center justify-center gap-1.5 border transition-all ${
                          design.textAlign === align
                            ? "bg-[#E94359] text-white border-[#E94359]"
                            : "bg-white text-neutral-600 border-[#E5E5E5] hover:bg-neutral-50"
                        }`}
                      >
                        {align === "left" && <AlignLeft size={13} />}
                        {align === "center" && <AlignCenter size={13} />}
                        {align === "right" && <AlignRight size={13} />}
                        <span>{align}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Placement */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
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
                          pushState({ ...design, logoPlacement: p.id })
                        }
                        className={`h-9 px-3 rounded-[8px] text-xs font-semibold border transition-all text-center ${
                          design.logoPlacement === p.id
                            ? "bg-neutral-900 text-white border-neutral-900"
                            : "bg-white text-neutral-600 border-[#E5E5E5] hover:bg-neutral-50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Background Upload */}
                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Custom Texture / Background
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 h-10 px-3 rounded-[10px] bg-neutral-50 border border-dashed border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors">
                      <Upload size={14} />
                      <span>Upload Texture</span>
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
                          pushState({ ...design, customBackgroundImage: null })
                        }
                        className="h-10 px-3 rounded-[10px] bg-neutral-100 text-neutral-700 text-xs font-semibold hover:bg-neutral-200 transition-colors"
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

      {/* ── EXPORT MODAL ── */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs"
            onClick={() => setShowExportModal(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-[#242424]">
                  Export Poster Asset
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Select your desired file format for social sharing
                </p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="size-8 rounded-[8px] inline-flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => handleDownload("png")}
                disabled={isExporting}
                className="w-full p-3.5 rounded-[10px] border border-[#E5E5E5] hover:border-[#E94359] hover:bg-[#FDF2F4]/40 transition-all flex items-center justify-between text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-[#242424] group-hover:text-[#E94359]">
                    PNG — High Quality (Recommended)
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Lossless crisp typography for Instagram & WhatsApp
                  </div>
                </div>
                <FileImage size={18} className="text-neutral-400 group-hover:text-[#E94359]" />
              </button>

              <button
                onClick={() => handleDownload("jpeg")}
                disabled={isExporting}
                className="w-full p-3.5 rounded-[10px] border border-[#E5E5E5] hover:border-[#E94359] hover:bg-[#FDF2F4]/40 transition-all flex items-center justify-between text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-[#242424] group-hover:text-[#E94359]">
                    JPEG — Optimized
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Small file size for fast mobile messaging
                  </div>
                </div>
                <FileImage size={18} className="text-neutral-400 group-hover:text-[#E94359]" />
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isExporting}
                className="w-full p-3.5 rounded-[10px] border border-[#E5E5E5] hover:border-[#E94359] hover:bg-[#FDF2F4]/40 transition-all flex items-center justify-between text-left group"
              >
                <div>
                  <div className="text-xs font-bold text-[#242424] group-hover:text-[#E94359]">
                    PDF — Print Ready
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    High resolution document for physical notice boards
                  </div>
                </div>
                <Download size={18} className="text-neutral-400 group-hover:text-[#E94359]" />
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-neutral-400">
              Format: {POSTER_FORMATS[selectedFormat].label}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PosterStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96 text-neutral-400 text-xs">
          Loading Studio...
        </div>
      }
    >
      <PosterStudioInner />
    </Suspense>
  )
}
