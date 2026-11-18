"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
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
  Sliders,
  Upload,
  Check,
  Shapes,
  Image as ImageIcon,
  Wand2,
  ChevronDown,
  X,
  ArrowLeft,
  FileText,
  ExternalLink,
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

  let category: BTechCategory = "Examination Notifications"
  if (titleLower.includes("timetable") || titleLower.includes("time table")) {
    category = "Time Table"
  } else if (titleLower.includes("revaluation") || titleLower.includes("answer script")) {
    category = "Revaluation"
  } else if (titleLower.includes("result") || catLower.includes("result")) {
    category = "Examination Results"
  } else if (titleLower.includes("registration") || catLower.includes("registration")) {
    category = "Registration"
  } else if (titleLower.includes("circular") || catLower.includes("circular")) {
    category = "Circulars"
  } else if (titleLower.includes("calendar") || catLower.includes("calendar")) {
    category = "Academic Calendar"
  } else if (titleLower.includes("fee") || catLower.includes("fee")) {
    category = "Fee Notifications"
  } else if (catLower.includes("academic") || catLower.includes("admission")) {
    category = "Academic Notifications"
  }

  // Corporate Blue (Institutional Cobalt) is the default institutional template
  return { category, templateId: "corporate-blue" }
}

function PosterStudioInner() {
  const searchParams = useSearchParams()

  const paramTitle = searchParams.get("title") || ""
  const paramCat = searchParams.get("category")
  const paramSem = searchParams.get("semester") || ""
  const paramRef = searchParams.get("ref") || ""
  const paramMalayalam = searchParams.get("malayalam") || ""
  const paramWithoutFine =
    searchParams.get("withoutFine") ||
    searchParams.get("without_fine") ||
    searchParams.get("withoutFineDate") ||
    ""
  const paramPdfUrl =
    searchParams.get("pdfUrl") ||
    searchParams.get("pdf_url") ||
    searchParams.get("pdf") ||
    ""
  const paramSourceUrl =
    searchParams.get("sourceUrl") ||
    searchParams.get("source_url") ||
    searchParams.get("source") ||
    ""

  const [pdfUrl, setPdfUrl] = useState<string>(paramPdfUrl)
  const [sourceUrl, setSourceUrl] = useState<string>(paramSourceUrl)

  const resolved = resolveKtuCategoryAndTemplate(paramCat, paramTitle)

  // 1:1 Square Post as Default Format
  const [selectedFormat, setSelectedFormat] =
    useState<PosterFormatKey>("square_post")

  // Corporate Blue as Default Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    searchParams.get("template") || resolved.templateId || "corporate-blue"
  )

  const [zoom, setZoom] = useState<number>(1)
  const [activeTool, setActiveTool] = useState<"templates" | "text" | "elements" | "colors" | "branding">("templates")
  const [activeTab, setActiveTab] = useState<"content" | "templates" | "styling">("content")
  const [mobileSheetOpen, setMobileSheetOpen] = useState<boolean>(false)
  const [isExporting, setIsExporting] = useState<boolean>(false)
  const [savedStatus, setSavedStatus] = useState<boolean>(true)
  const [globalLogoSaved, setGlobalLogoSaved] = useState<boolean>(false)

  // Design state initialized from URL query parameters & localStorage
  const [design, setDesign] = useState<PosterDesignState>(() => {
    const savedLogo =
      typeof window !== "undefined"
        ? localStorage.getItem("ktu_default_logo")
        : null

    return {
      title: paramTitle || "APJ Abdul Kalam Technological University Announcement",
      malayalamSubtitle: paramMalayalam,
      description: "",
      category: resolved.category,
      withoutFineDate: paramWithoutFine || "",
      importantDate: "",
      deadline: "",
      examDate: "",
      semester: paramSem,
      academicYear: "",
      officialReference: paramRef,
      sourceText: "Official Notification",
      footerText: "APJ Abdul Kalam Technological University",
      fontSizeScale: 1.0,
      textAlign: "left", // Left-aligned headline
      accentColorOverride: "",
      cardBgOverride: "",
      customBackgroundImage: null,
      customLogo: savedLogo || "/logo.png",
      logoPlacement: "top-right",
      badgePlacement: "top-left",
    }
  })

  // Undo / Redo history stack
  const [history, setHistory] = useState<PosterDesignState[]>([design])
  const [historyIndex, setHistoryIndex] = useState(0)

  const pushState = (next: PosterDesignState) => {
    const updated = history.slice(0, historyIndex + 1)
    updated.push(next)
    setHistory(updated)
    setHistoryIndex(updated.length - 1)
    setDesign(next)
    setSavedStatus(false)
    setTimeout(() => setSavedStatus(true), 800)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1
      setHistoryIndex(prev)
      setDesign(history[prev])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1
      setHistoryIndex(next)
      setDesign(history[next])
    }
  }

  // Update design if query parameters change
  useEffect(() => {
    const t = searchParams.get("title")
    const c = searchParams.get("category")
    const s = searchParams.get("semester")
    const r = searchParams.get("ref")
    const m = searchParams.get("malayalam")
    const tpl = searchParams.get("template")
    const wf =
      searchParams.get("withoutFine") ||
      searchParams.get("without_fine") ||
      searchParams.get("withoutFineDate")
    const pUrl =
      searchParams.get("pdfUrl") ||
      searchParams.get("pdf_url") ||
      searchParams.get("pdf")
    const sUrl =
      searchParams.get("sourceUrl") ||
      searchParams.get("source_url") ||
      searchParams.get("source")

    if (pUrl) setPdfUrl(pUrl)
    if (sUrl) setSourceUrl(sUrl)

    if (t || c || s || r || m || tpl || wf) {
      const res = resolveKtuCategoryAndTemplate(c, t)
      setDesign((prev) => ({
        ...prev,
        title: t || prev.title,
        category: (c as BTechCategory) || res.category,
        semester: s || prev.semester,
        officialReference: r || prev.officialReference,
        malayalamSubtitle: m || prev.malayalamSubtitle,
        withoutFineDate: wf !== null && wf !== undefined ? wf : prev.withoutFineDate,
      }))
      if (tpl) setSelectedTemplateId(tpl)
    }
  }, [searchParams])

  const currentTemplate =
    TEMPLATE_LIBRARY.find((t) => t.id === selectedTemplateId) ||
    TEMPLATE_LIBRARY.find((t) => t.id === "corporate-blue") ||
    TEMPLATE_LIBRARY[0]

  // AI Improve Layout handler
  const handleAiImproveLayout = () => {
    let optimalScale = 1.0
    const charLen = design.title.length

    if (charLen > 180) optimalScale = 0.8
    else if (charLen > 120) optimalScale = 0.88
    else if (charLen > 70) optimalScale = 0.95
    else if (charLen < 40) optimalScale = 1.15

    const updated: PosterDesignState = {
      ...design,
      fontSizeScale: optimalScale,
      textAlign: "left",
      logoPlacement: "top-right",
    }
    pushState(updated)
  }

  // Custom Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string
        pushState({ ...design, customLogo: result })
      }
      reader.readAsDataURL(file)
    }
  }

  // Set Current Logo as Default For All Posters
  const handleSetLogoAsDefault = () => {
    if (typeof window !== "undefined" && design.customLogo) {
      localStorage.setItem("ktu_default_logo", design.customLogo)
      setGlobalLogoSaved(true)
      setTimeout(() => setGlobalLogoSaved(false), 3000)
    }
  }

  // Reset to default logo
  const handleResetLogo = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ktu_default_logo")
      pushState({ ...design, customLogo: "/logo.png" })
      setGlobalLogoSaved(false)
    }
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

  // Direct PNG Export (No modal or option picker needed)
  const handleExportPng = async () => {
    setIsExporting(true)
    try {
      const dataUrl = await renderPosterToDataUrl({
        template: currentTemplate,
        formatKey: selectedFormat,
        design,
        exportFormat: "png",
      })

      const link = document.createElement("a")
      link.download = `KTU-${design.category.replace(/\s+/g, "_")}-${Date.now()}.png`
      link.href = dataUrl
      link.click()

      saveToLocalLibrary(dataUrl, "png")
    } catch (err: any) {
      alert("Export failed: " + (err.message || "Unknown error"))
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

  // Shared inspector tab content for desktop panel and mobile bottom sheet
  const renderInspectorContent = () => (
    <div className="space-y-4">
      {/* 1. CONTENT TAB */}
      {activeTab === "content" && (
        <div className="space-y-4">
          {/* Poster Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700">
              Poster Format / Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(POSTER_FORMATS) as PosterFormatKey[]).map((fKey) => {
                const spec = POSTER_FORMATS[fKey]
                const active = selectedFormat === fKey
                return (
                  <button
                    key={fKey}
                    type="button"
                    onClick={() => setSelectedFormat(fKey)}
                    className={`h-9 px-2 rounded-[8px] text-xs font-semibold border flex items-center justify-center transition-all ${
                      active
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-xs font-bold"
                        : "bg-white text-neutral-600 border-[#E5E5E5] hover:bg-neutral-50"
                    }`}
                  >
                    <span>{spec.shortLabel}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* AI Improve Layout Button */}
          <button
            onClick={handleAiImproveLayout}
            className="w-full h-11 px-4 rounded-[10px] bg-[#FDF2F4] hover:bg-[#FCE7EB] text-[#E94359] text-[13px] font-bold flex items-center justify-center gap-2 border border-[#F8C6CD] transition-colors active:scale-[0.98] shadow-2xs"
          >
            <Wand2 size={16} />
            <span>AI Improve Layout & Font Scaling</span>
          </button>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700">
              Notification Category
            </label>
            <select
              value={design.category}
              onChange={(e) => {
                const newCat = e.target.value as BTechCategory
                pushState({ ...design, category: newCat })
              }}
              className="w-full h-11 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all shadow-2xs"
            >
              {BTECH_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Headline Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700">
              Announcement Headline
            </label>
            <textarea
              rows={4}
              value={design.title}
              onChange={(e) =>
                setDesign((d) => ({ ...d, title: e.target.value }))
              }
              onBlur={() => pushState(design)}
              className="w-full p-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] leading-relaxed focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all shadow-2xs"
              placeholder="Enter announcement headline..."
            />
          </div>

          {/* Malayalam Subtitle */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700">
              Malayalam Subtitle <span className="font-normal text-neutral-400">(Optional)</span>
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
              className="w-full h-11 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all shadow-2xs"
              placeholder="മലയാളം അടിക്കുറിപ്പ്..."
            />
          </div>

          {/* Semester & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                Semester
              </label>
              <input
                type="text"
                value={design.semester}
                onChange={(e) =>
                  setDesign((d) => ({ ...d, semester: e.target.value }))
                }
                onBlur={() => pushState(design)}
                className="w-full h-11 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all shadow-2xs"
                placeholder="e.g. S6"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                KTU Ref <span className="font-normal text-neutral-400">(Optional)</span>
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
                className="w-full h-11 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-mono focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all shadow-2xs"
                placeholder="e.g. KTU/EX-II/..."
              />
            </div>
          </div>

          {/* Registration Without Fine Date (Strictly for Exam Registration) */}
          {(design.category === "Registration" ||
            /registration/i.test(design.title) ||
            /registration/i.test(design.category) ||
            Boolean(design.withoutFineDate)) && (
            <div className="p-4 rounded-[12px] bg-rose-50/70 border border-rose-200 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E94359]" />
                  Registration Without Fine (Date)
                </label>

                {/* Option to view/check source PDF to confirm last date */}
                {pdfUrl ? (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white hover:bg-rose-100/60 border border-rose-200 text-[#E94359] text-[11px] font-bold shadow-2xs transition-colors shrink-0 active:scale-95"
                    title="Open official PDF in new tab to check and confirm date"
                  >
                    <FileText size={13} />
                    <span>Check PDF</span>
                    <ExternalLink size={10} />
                  </a>
                ) : sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white hover:bg-rose-100/60 border border-rose-200 text-[#E94359] text-[11px] font-bold shadow-2xs transition-colors shrink-0 active:scale-95"
                    title="Open notification source"
                  >
                    <FileText size={13} />
                    <span>Check Source</span>
                    <ExternalLink size={10} />
                  </a>
                ) : (
                  <span className="text-[10px] font-bold text-[#E94359] uppercase tracking-wider">
                    Accurate PDF Only
                  </span>
                )}
              </div>

              <input
                type="text"
                value={design.withoutFineDate || ""}
                onChange={(e) =>
                  setDesign((d) => ({
                    ...d,
                    withoutFineDate: e.target.value,
                  }))
                }
                onBlur={() => pushState(design)}
                className="w-full h-11 px-3.5 rounded-[10px] bg-white border border-rose-200 text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 transition-all shadow-2xs"
                placeholder="e.g. 24-11-2026 (Leave empty if not confirmed in PDF)"
              />

              <p className="text-[11px] text-rose-800/80 leading-relaxed">
                Tap <strong className="font-semibold text-[#E94359]">Check PDF</strong> above to inspect the circular table, then confirm the date.
              </p>
            </div>
          )}

          {/* Direct Export Poster Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileSheetOpen(false)
                handleExportPng()
              }}
              disabled={isExporting}
              className="w-full h-12 rounded-[12px] bg-[#E94359] hover:bg-[#D83248] text-white text-[13px] font-bold shadow-md inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Download size={16} className={isExporting ? "animate-bounce" : ""} />
              <span>{isExporting ? "Exporting PNG Poster..." : "Export Poster (PNG) ↓"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. TEMPLATES TAB */}
      {activeTab === "templates" && (
        <div className="space-y-3">
          <div className="text-xs text-neutral-500 font-medium">
            11 University Presets (Default: Corporate Blue)
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
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
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      style={{ background: tpl.bgGradient }}
                      className="size-8 rounded-[8px] border border-neutral-200 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#242424] flex items-center gap-1.5 truncate">
                        <span>{tpl.name}</span>
                        <span className="text-[10px] font-normal text-neutral-400">
                          ({tpl.styleName})
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {tpl.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="size-5 rounded-full bg-[#E94359] flex items-center justify-center text-white shrink-0 ml-2">
                      <Check size={12} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Direct Export in Templates Tab */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileSheetOpen(false)
                handleExportPng()
              }}
              disabled={isExporting}
              className="w-full h-11 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-[13px] font-bold shadow-xs inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Download size={15} className={isExporting ? "animate-bounce" : ""} />
              <span>{isExporting ? "Exporting PNG..." : "Export Poster (PNG) ↓"}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. STYLING & BRAND TAB */}
      {activeTab === "styling" && (
        <div className="space-y-4">
          {/* Dedicated Logo Management Section */}
          <div className="p-3.5 sm:p-4 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#242424]">
                  University / Channel Logo
                </h4>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Emblem displayed on poster
                </p>
              </div>
              {globalLogoSaved && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check size={12} /> Set for all
                </span>
              )}
            </div>

            {/* Logo Preview & Upload */}
            <div className="p-2.5 sm:p-3 rounded-[8px] bg-white border border-[#E5E5E5] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={design.customLogo || "/logo.png"}
                  alt="Current logo"
                  className="h-11 w-auto max-w-[90px] object-contain rounded bg-neutral-50 p-1 border border-neutral-200"
                />
                <div className="text-xs truncate">
                  <div className="font-semibold text-[#242424] truncate">
                    {design.customLogo && design.customLogo !== "/logo.png"
                      ? "Custom Uploaded Logo"
                      : "KSU GECI (Default Emblem)"}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Active emblem
                  </div>
                </div>
              </div>

              <label className="h-8 px-3 rounded-[8px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold cursor-pointer inline-flex items-center justify-center transition-colors shrink-0">
                <span>Change</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Global Persistence Buttons */}
            {design.customLogo && design.customLogo !== "/logo.png" && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSetLogoAsDefault}
                  className="flex-1 h-8 px-2.5 rounded-[8px] bg-[#FDF2F4] hover:bg-[#FCE7EB] text-[#E94359] border border-[#F8C6CD] text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors truncate"
                >
                  <Check size={12} />
                  <span>Set as logo for all posters</span>
                </button>

                <button
                  onClick={handleResetLogo}
                  className="h-8 px-3 rounded-[8px] bg-neutral-200/80 hover:bg-neutral-300 text-neutral-700 text-xs font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

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
              Logo Placement
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

          {/* Custom Background Texture */}
          <div className="pt-2 border-t border-neutral-100 space-y-2">
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

          {/* Direct Export in Styling Tab */}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileSheetOpen(false)
                handleExportPng()
              }}
              disabled={isExporting}
              className="w-full h-11 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-[13px] font-bold shadow-xs inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Download size={15} className={isExporting ? "animate-bounce" : ""} />
              <span>{isExporting ? "Exporting PNG..." : "Export Poster (PNG) ↓"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="flex flex-col min-h-full lg:h-[calc(100vh-5.5rem)] w-full pb-28 md:pb-0">
      {/* ── TOP APPLICATION BAR (Sticky & Responsive Standard Controls) ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#E5E5E5] mb-3 sm:mb-4 shrink-0 shadow-xs">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="md:hidden size-8 inline-flex items-center justify-center rounded-[8px] text-neutral-500 hover:bg-neutral-100 transition-colors"
            aria-label="Back to announcements"
          >
            <ArrowLeft size={16} />
          </Link>

          <span className="font-bold text-xs sm:text-sm text-[#242424] tracking-tight">
            KTU Studio
          </span>
          <span className="text-neutral-300 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-medium text-neutral-700">
              {savedStatus ? "Saved" : "Saving..."}
            </span>
          </div>
        </div>

        {/* Center: Format Switcher (Default: 1:1 Square) */}
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

        {/* Right: History & Direct PNG Export Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 sm:gap-1 mr-0.5 sm:mr-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="size-8 inline-flex items-center justify-center rounded-[8px] text-neutral-500 hover:text-[#242424] hover:bg-neutral-100 disabled:opacity-30 transition-colors"
              title="Undo"
              aria-label="Undo"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="size-8 inline-flex items-center justify-center rounded-[8px] text-neutral-500 hover:text-[#242424] hover:bg-neutral-100 disabled:opacity-30 transition-colors"
              title="Redo"
              aria-label="Redo"
            >
              <RotateCw size={14} />
            </button>
          </div>

          {/* 1-Click Direct PNG Export (Always accessible & prominent) */}
          <button
            onClick={handleExportPng}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-3.5 sm:px-4 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-xs sm:text-[13px] font-bold shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 shrink-0"
          >
            <Download size={14} className={isExporting ? "animate-bounce" : ""} />
            <span className="hidden sm:inline">{isExporting ? "Exporting PNG..." : "Export poster (PNG) ↓"}</span>
            <span className="sm:hidden">{isExporting ? "Exporting..." : "Export PNG"}</span>
          </button>
        </div>
      </div>

      {/* ── WORKSPACE ── */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-4 min-h-0 lg:overflow-hidden">
        {/* 1. LEFT TOOLBAR RAIL (Desktop Only) */}
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

        {/* 2. CENTER CANVAS (Fluid Scaling on Both Mobile & Desktop) */}
        <div className="flex-1 lg:col-span-7 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 rounded-xl bg-neutral-100/70 border border-[#E5E5E5] relative overflow-y-auto overflow-x-hidden shadow-xs studio-canvas-bg min-h-[300px]">
          {/* Top Canvas Bar */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-2">
            <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-[6px] sm:rounded-[8px] text-[9px] sm:text-[10px] font-bold uppercase bg-white/95 backdrop-blur-xs border border-[#E5E5E5] text-neutral-700 shadow-xs">
              {currentTemplate.name}
            </span>
            <span className="text-[10px] sm:text-[11px] text-neutral-500 font-mono hidden sm:inline">
              {POSTER_FORMATS[selectedFormat].width} ×{" "}
              {POSTER_FORMATS[selectedFormat].height}
            </span>
          </div>

          {/* Zoom controls */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-0.5 sm:gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-[8px] border border-[#E5E5E5] shadow-xs text-xs text-neutral-600">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 rounded hover:bg-neutral-100"
              title="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="w-8 sm:w-10 text-center font-mono font-semibold text-[10px] sm:text-[11px]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
              className="p-1 rounded hover:bg-neutral-100"
              title="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 rounded hover:bg-neutral-100"
              title="Fit"
            >
              <Maximize2 size={12} />
            </button>
          </div>

          {/* Actual Live Rendered Poster */}
          <div className="my-auto w-full flex items-center justify-center py-2 sm:py-6">
            <PosterCanvasPreview
              template={currentTemplate}
              formatKey={selectedFormat}
              design={design}
              scale={zoom}
            />
          </div>
        </div>

        {/* 3. RIGHT PROPERTIES INSPECTOR (Desktop Full Panel) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col rounded-xl bg-white border border-[#E5E5E5] shadow-xs overflow-hidden">
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

          {/* Desktop Tab Panes */}
          <div className="flex-1 overflow-y-auto p-5">
            {renderInspectorContent()}
          </div>
        </div>
      </div>

      {/* ── MOBILE EXPORT & TOOL ACTION BAR ── */}
      <div className="lg:hidden mt-3 space-y-2.5 shrink-0">
        {/* Big Primary Export Button on Mobile */}
        <button
          onClick={handleExportPng}
          disabled={isExporting}
          className="w-full h-12 rounded-[12px] bg-[#E94359] hover:bg-[#D83248] text-white text-[13px] font-bold shadow-md inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Download size={16} className={isExporting ? "animate-bounce" : ""} />
          <span>{isExporting ? "Exporting PNG Poster..." : "Export Poster (PNG) ↓"}</span>
        </button>

        {/* Tool Tabs Rail */}
        <div className="p-1 rounded-xl bg-white border border-[#E5E5E5] shadow-xs flex items-center justify-around">
          {[
            { id: "content", label: "Edit Content", icon: Sliders },
            { id: "templates", label: "Templates", icon: Layers },
            { id: "styling", label: "Styling & Brand", icon: Palette },
          ].map((tool) => {
            const Icon = tool.icon
            const active = activeTab === tool.id && mobileSheetOpen
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTab(tool.id as any)
                  setMobileSheetOpen(true)
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-[8px] text-xs font-semibold transition-all ${
                  active
                    ? "bg-neutral-900 text-white shadow-xs"
                    : "text-neutral-700 hover:text-[#242424] hover:bg-neutral-50"
                }`}
              >
                <Icon size={14} />
                <span>{tool.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── MOBILE SLIDE-UP BOTTOM SHEET DRAWER ── */}
      {mobileSheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-neutral-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full bg-white rounded-t-2xl border-t border-[#E5E5E5] shadow-2xl max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div className="pt-2.5 pb-2.5 px-4 border-b border-neutral-100 bg-white sticky top-0 z-20 flex flex-col gap-2.5">
              <div className="w-10 h-1 rounded-full bg-neutral-300 mx-auto" />

              <div className="flex items-center justify-between gap-2">
                {/* Clear prominent Back to Canvas button */}
                <button
                  onClick={() => setMobileSheetOpen(false)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] bg-neutral-100 hover:bg-neutral-200 text-[#242424] text-xs font-bold transition-all active:scale-95 shrink-0"
                  aria-label="Back to Canvas"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                {/* Center Title & Current Format */}
                <div className="flex flex-col items-center min-w-0">
                  <span className="font-bold text-sm text-[#242424] truncate">
                    {activeTab === "content"
                      ? "Edit Content"
                      : activeTab === "templates"
                      ? "Choose Template"
                      : "Styling & Brand"}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {POSTER_FORMATS[selectedFormat].label}
                  </span>
                </div>

                {/* Direct Export PNG button in Header */}
                <button
                  onClick={() => {
                    setMobileSheetOpen(false)
                    handleExportPng()
                  }}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[9px] bg-[#E94359] hover:bg-[#D83248] text-white text-xs font-bold shadow-2xs transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  <Download size={13} className={isExporting ? "animate-bounce" : ""} />
                  <span>Export PNG</span>
                </button>
              </div>

              {/* Sub-tabs inside sheet */}
              <div className="flex gap-1.5 bg-neutral-100 p-1 rounded-[10px]">
                {[
                  { id: "content", label: "Content", icon: Sliders },
                  { id: "templates", label: "Templates", icon: Layers },
                  { id: "styling", label: "Styling", icon: Palette },
                ].map((t) => {
                  const Icon = t.icon
                  const active = activeTab === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`flex-1 h-8 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        active
                          ? "bg-white text-[#242424] shadow-xs font-bold"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      <Icon size={13} />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sheet Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 pb-6">
              {renderInspectorContent()}
            </div>

            {/* Sheet Footer Actions with direct Export button */}
            <div className="p-3 border-t border-neutral-100 bg-neutral-50/90 flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="flex-1 h-11 rounded-[10px] bg-white border border-[#E5E5E5] text-[#242424] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-neutral-50 active:scale-[0.98]"
              >
                <ArrowLeft size={14} />
                <span>Back to Canvas</span>
              </button>

              <button
                onClick={() => {
                  setMobileSheetOpen(false)
                  handleExportPng()
                }}
                disabled={isExporting}
                className="flex-1 h-11 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Download size={15} className={isExporting ? "animate-bounce" : ""} />
                <span>{isExporting ? "Exporting..." : "Export PNG ↓"}</span>
              </button>
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
