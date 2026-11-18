"use client"

import { useEffect, useState, use, Suspense } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Sparkles, 
  FileText, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Plus, 
  Trash2, 
  RefreshCw 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Notification, AIExtractionData } from "@/types/database"

interface Props {
  params: Promise<{ id: string }>
}

function NotificationDetailContent({ params }: Props) {
  const resolvedParams = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(true)
  const [extracting, setExtracting] = useState(false)
  const [aiData, setAiData] = useState<AIExtractionData>({
    main_title: "",
    university: "APJ Abdul Kalam Technological University",
    department_or_course: "B.Tech",
    semester: "Semester 6",
    important_dates: [],
    deadlines: "",
    instructions: [],
    requires_review: false,
  })

  // Load notification
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", resolvedParams.id)
        .single()

      if (data) {
        setNotification(data)
        runExtraction(data.title, data.description || "")
      } else {
        // Query /api/notifications to match by source_id or id
        try {
          const res = await fetch("/api/notifications")
          const json = await res.json()
          if (json.success && Array.isArray(json.notifications)) {
            const match = json.notifications.find(
              (n: any) => n.id === resolvedParams.id || n.source_id === resolvedParams.id
            )
            if (match) {
              setNotification(match)
              runExtraction(match.title, match.description || "")
            }
          }
        } catch (e) {
          console.warn("Could not load from live notifications:", e)
        }
      }
      setLoading(false)
    }

    loadData()
  }, [resolvedParams.id, supabase])

  const runExtraction = async (title: string, text: string) => {
    setExtracting(true)
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, text }),
      })
      const result = await res.json()
      if (result.success && result.data) {
        setAiData(result.data)
      }
    } catch (err) {
      console.error("AI Extraction failed:", err)
    } finally {
      setExtracting(false)
    }
  }

  const handleDateChange = (index: number, val: string) => {
    const updated = [...aiData.important_dates]
    updated[index] = val
    setAiData({ ...aiData, important_dates: updated })
  }

  const addDate = () => {
    setAiData({ ...aiData, important_dates: [...aiData.important_dates, ""] })
  }

  const removeDate = (index: number) => {
    setAiData({
      ...aiData,
      important_dates: aiData.important_dates.filter((_, i) => i !== index),
    })
  }

  const handleInstructionChange = (index: number, val: string) => {
    const updated = [...aiData.instructions]
    updated[index] = val
    setAiData({ ...aiData, instructions: updated })
  }

  const addInstruction = () => {
    if (aiData.instructions.length < 3) {
      setAiData({ ...aiData, instructions: [...aiData.instructions, ""] })
    }
  }

  const removeInstruction = (index: number) => {
    setAiData({
      ...aiData,
      instructions: aiData.instructions.filter((_, i) => i !== index),
    })
  }

  const handleProceedToStudio = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("poster_initial_data", JSON.stringify(aiData))
    }
    const cat = aiData.department_or_course || "Academic Notifications"
    const sem = aiData.semester || ""
    const deadline = aiData.deadlines || ""
    const title = aiData.main_title || (notification ? notification.title : "")
    router.push(
      `/dashboard/studio?notificationId=${resolvedParams.id}&title=${encodeURIComponent(
        title
      )}&category=${encodeURIComponent(cat)}&semester=${encodeURIComponent(
        sem
      )}&deadline=${encodeURIComponent(deadline)}`
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center text-white/60">
        <RefreshCw size={26} className="animate-spin mx-auto mb-3 text-[#FF3355]" />
        Loading notification intelligence...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/notifications"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to notifications
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => runExtraction(notification?.title || "", notification?.description || "")}
            disabled={extracting}
            className="h-9 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold gap-1.5 backdrop-blur-xl transition-all duration-300"
          >
            <RefreshCw size={13} className={extracting ? "animate-spin text-[#FF3355]" : ""} />
            Re-run AI Extract
          </Button>

          <Button
            onClick={handleProceedToStudio}
            size="sm"
            className="h-9 px-5 rounded-2xl bg-gradient-to-r from-[#FF2E4D] to-[#E00028] hover:from-[#FF4D68] hover:to-[#FF1F42] text-white text-xs gap-2 font-semibold shadow-xl shadow-rose-600/30 border border-white/20 active:scale-[0.98] transition-all duration-300"
          >
            <Layers size={14} />
            Generate Poster
          </Button>
        </div>
      </div>

      {/* 2-Column Glassmorphism Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scraped Notification Source */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-7 shadow-2xl space-y-5">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#FF3355]">
                Raw Scraped Feed
              </span>
              <h2 className="text-xl font-extrabold text-white mt-1.5 leading-snug">
                {notification?.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold">
                Status: {notification?.status || "ready"}
              </span>
              <span className="text-xs text-white/50 flex items-center gap-1.5 ml-1">
                <Calendar size={12} />
                Published: {notification?.published_date || "Recent"}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-200 mb-2">Original Content</p>
              <div className="text-xs text-slate-300 leading-relaxed p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] whitespace-pre-line backdrop-blur-md">
                {notification?.description || "No extended body text was scraped with this notification."}
              </div>
            </div>

            {/* Official Attachments */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2.5">
              {notification?.pdf_url && (
                <a
                  href={notification.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/15 text-xs font-semibold text-rose-300 border border-red-500/20 transition-all duration-300 active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={16} /> Official PDF Attachment
                  </span>
                  <ExternalLink size={14} />
                </a>
              )}

              {notification?.original_url && (
                <a
                  href={notification.original_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] text-xs font-semibold text-slate-200 border border-white/[0.06] hover:border-white/15 transition-all duration-300 active:scale-[0.98]"
                >
                  <span>View KTU Web Source</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Extraction & Verification Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-7 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={17} className="text-[#FF3355]" />
                  <h3 className="text-lg font-bold text-white">
                    AI Extraction & Poster Fields
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Fine-tune structured elements before rendering onto the live poster canvas.
                </p>
              </div>

              {aiData.requires_review ? (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold inline-flex items-center gap-1.5 w-fit">
                  <AlertTriangle size={13} /> Needs Review
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold inline-flex items-center gap-1.5 w-fit">
                  <CheckCircle2 size={13} /> AI Verified
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Poster Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Poster Main Title
                </label>
                <input
                  type="text"
                  value={aiData.main_title}
                  onChange={(e) => setAiData({ ...aiData, main_title: e.target.value })}
                  placeholder="Concise poster title..."
                  className="w-full px-4 py-2.5 text-xs text-white placeholder:text-white/40 bg-white/[0.03] focus:bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] focus:border-rose-500/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all duration-300"
                />
              </div>

              {/* Course & Semester row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Course / Branch
                  </label>
                  <input
                    type="text"
                    value={aiData.department_or_course}
                    onChange={(e) => setAiData({ ...aiData, department_or_course: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs text-white bg-white/[0.03] focus:bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] focus:border-rose-500/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-2">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={aiData.semester}
                    onChange={(e) => setAiData({ ...aiData, semester: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs text-white bg-white/[0.03] focus:bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] focus:border-rose-500/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Important Dates */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-200">
                    Important Dates
                  </label>
                  <button
                    type="button"
                    onClick={addDate}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <Plus size={12} /> Add Date
                  </button>
                </div>
                <div className="space-y-2.5">
                  {aiData.important_dates.map((date, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => handleDateChange(idx, e.target.value)}
                        placeholder="e.g. 24 April 2026 - First Examination"
                        className="flex-1 px-4 py-2 text-xs text-white bg-white/[0.03] focus:bg-white/[0.07] border border-white/[0.08] focus:border-rose-500/50 rounded-2xl focus:outline-none transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeDate(idx)}
                        className="p-2 text-white/40 hover:text-rose-400 rounded-xl hover:bg-white/[0.05] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {aiData.important_dates.length === 0 && (
                    <p className="text-xs text-white/40 italic">No dates detected. Click Add Date if needed.</p>
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Last Date / Submission Deadline
                </label>
                <input
                  type="text"
                  value={aiData.deadlines}
                  onChange={(e) => setAiData({ ...aiData, deadlines: e.target.value })}
                  placeholder="e.g. 28th November 2026"
                  className="w-full px-4 py-2.5 text-xs text-white bg-white/[0.03] focus:bg-white/[0.07] backdrop-blur-xl border border-white/[0.08] focus:border-rose-500/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all duration-300"
                />
              </div>

              {/* Action Button */}
              <div className="pt-5 border-t border-white/[0.08] flex justify-end">
                <Button
                  onClick={handleProceedToStudio}
                  className="h-11 px-6 rounded-2xl bg-gradient-to-r from-[#FF2E4D] to-[#E00028] hover:from-[#FF4D68] hover:to-[#FF1F42] text-white font-semibold shadow-xl shadow-rose-600/30 border border-white/20 text-xs gap-2 active:scale-[0.98] transition-all duration-300"
                >
                  <Layers size={16} />
                  Proceed to Poster Studio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NotificationDetailPage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-96 text-white/50 text-xs">
          <RefreshCw size={24} className="animate-spin text-[#FF3355] mr-2" />
          Loading notification intelligence...
        </div>
      }
    >
      <NotificationDetailContent {...props} />
    </Suspense>
  )
}
