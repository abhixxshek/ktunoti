"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard caught error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-4">
      <div className="w-14 h-14 rounded-3xl bg-red-500/10 border border-red-500/20 text-rose-400 flex items-center justify-center shadow-2xl backdrop-blur-xl">
        <AlertTriangle size={24} />
      </div>
      <h2 className="text-xl font-extrabold text-white">Something went wrong</h2>
      <p className="text-xs text-slate-300 max-w-md leading-relaxed">
        {error.message || "An unexpected error occurred while loading this view. Your saved posters and settings remain intact."}
      </p>
      <Button
        onClick={() => reset()}
        className="h-10 px-5 rounded-2xl bg-gradient-to-r from-[#FF2E4D] to-[#E00028] hover:from-[#FF4D68] text-white text-xs font-semibold gap-2 shadow-xl shadow-rose-600/30 border border-white/20 active:scale-[0.98] transition-all"
      >
        <RefreshCw size={14} />
        Try Again
      </Button>
    </div>
  )
}

