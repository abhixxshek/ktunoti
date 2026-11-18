"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Building2,
  LayoutTemplate,
  Bot,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Check,
} from "lucide-react"
import { TEMPLATE_LIBRARY, POSTER_FORMATS } from "@/data/templates-and-seed"
import { PosterFormatKey } from "@/types/poster-studio"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [globalLogo, setGlobalLogo] = useState<string | null>(null)

  const [settings, setSettings] = useState({
    organization_name: "APJ Abdul Kalam Technological University",
    channel_handle: "@KTU_Updates",
    default_template: "corporate-blue",
    default_format: "square_post" as PosterFormatKey,
    brand_color: "#E94359",
    ai_provider: "gemini",
    telegram_webhook: "",
    auto_notify: false,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ktu_app_settings")
      if (cached) {
        try {
          setSettings((prev) => ({ ...prev, ...JSON.parse(cached) }))
        } catch (e) {
          console.error(e)
        }
      }
      const savedLogo = localStorage.getItem("ktu_default_logo")
      if (savedLogo) {
        setGlobalLogo(savedLogo)
      }
    }
  }, [])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string
        setGlobalLogo(result)
        if (typeof window !== "undefined") {
          localStorage.setItem("ktu_default_logo", result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleResetLogo = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ktu_default_logo")
      setGlobalLogo("/logo.png")
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (typeof window !== "undefined") {
      localStorage.setItem("ktu_app_settings", JSON.stringify(settings))
    }

    setTimeout(() => {
      setSaving(false)
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3500)
    }, 600)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#E94359] uppercase tracking-wider mb-1">
          <Settings size={14} />
          <span>System & Brand Preferences</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-[28px] font-bold text-[#242424] tracking-tight leading-tight">
          Studio Brand Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Configure university attribution, default social media formats, AI extraction providers, and publication webhooks.
        </p>
      </div>

      {savedSuccess && (
        <div className="h-10 px-4 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Preferences successfully saved to local system!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
        {/* 1. University & Channel Branding */}
        <div className="p-4 sm:p-6 md:p-7 rounded-xl bg-white border border-[#E5E5E5] shadow-xs space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#242424] border-b border-neutral-100 pb-3">
            <Building2 size={17} className="text-[#E94359]" />
            <span>Identity & Channel Watermark</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                University / Organization Name
              </label>
              <input
                type="text"
                value={settings.organization_name}
                onChange={(e) =>
                  setSettings({ ...settings, organization_name: e.target.value })
                }
                className="w-full h-10 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Social Handle / Watermark
              </label>
              <input
                type="text"
                value={settings.channel_handle}
                onChange={(e) =>
                  setSettings({ ...settings, channel_handle: e.target.value })
                }
                className="w-full h-10 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
                placeholder="@KTU_Notices"
              />
            </div>
          </div>
        </div>

        {/* 2. Global University Logo (Applied to All Posters) */}
        <div className="p-4 sm:p-6 md:p-7 rounded-xl bg-white border border-[#E5E5E5] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#242424] border-b border-neutral-100 pb-3">
            <ImageIcon size={17} className="text-[#E94359]" />
            <span>Default Logo for All Posters</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <img
                src={globalLogo || "/logo.png"}
                alt="Default Logo"
                className="h-10 w-auto max-w-[120px] object-contain rounded bg-white p-1 border border-neutral-200"
              />
              <div>
                <div className="text-xs font-semibold text-[#242424]">
                  {globalLogo && globalLogo !== "/logo.png"
                    ? "Custom Emblem Configured"
                    : "KSU GECI (Default Emblem)"}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  This logo automatically applies to all generated posters
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <label className="h-9 px-3.5 rounded-[8px] bg-white border border-[#E5E5E5] hover:bg-neutral-50 text-neutral-700 text-xs font-semibold cursor-pointer inline-flex items-center justify-center transition-colors shadow-xs">
                <span>{globalLogo ? "Change" : "Upload logo"}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {globalLogo && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="h-9 px-3 rounded-[8px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-xs font-medium transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Poster Studio Defaults */}
        <div className="p-4 sm:p-6 md:p-7 rounded-xl bg-white border border-[#E5E5E5] shadow-xs space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#242424] border-b border-neutral-100 pb-3">
            <LayoutTemplate size={17} className="text-[#E94359]" />
            <span>Studio Defaults & Preset Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Default Poster Template
              </label>
              <select
                value={settings.default_template}
                onChange={(e) =>
                  setSettings({ ...settings, default_template: e.target.value })
                }
                className="w-full h-10 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
              >
                {TEMPLATE_LIBRARY.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.styleName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Default Aspect Ratio
              </label>
              <select
                value={settings.default_format}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_format: e.target.value as PosterFormatKey,
                  })
                }
                className="w-full h-10 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
              >
                {Object.values(POSTER_FORMATS).map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. AI Intelligence & Automated Webhooks */}
        <div className="p-6 sm:p-7 rounded-xl bg-white border border-[#E5E5E5] shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#242424] border-b border-neutral-100 pb-3">
            <Bot size={17} className="text-[#E94359]" />
            <span>AI Parser & Dispatch Webhooks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                AI Extraction Model Provider
              </label>
              <select
                value={settings.ai_provider}
                onChange={(e) =>
                  setSettings({ ...settings, ai_provider: e.target.value })
                }
                className="w-full h-10 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
              >
                <option value="gemini">
                  Google Gemini 1.5 Flash (Ultra Fast)
                </option>
                <option value="openai">
                  OpenAI GPT-4o-mini (Precision)
                </option>
                <option value="heuristic">
                  Heuristic Rule-Engine (Offline Fallback)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Telegram / Discord Webhook URL (Optional)
              </label>
              <input
                type="text"
                value={settings.telegram_webhook}
                onChange={(e) =>
                  setSettings({ ...settings, telegram_webhook: e.target.value })
                }
                className="w-full h-10 px-3.5 rounded-[10px] bg-neutral-50 border border-[#E5E5E5] text-[13px] text-[#242424] font-medium focus:outline-none focus:border-[#E94359] focus:ring-2 focus:ring-[#E94359]/20 focus:bg-white transition-all"
                placeholder="https://api.telegram.org/bot.../sendMessage"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-[10px] bg-[#E94359] hover:bg-[#D83248] text-white text-[13px] font-semibold shadow-xs active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
