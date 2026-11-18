"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Settings,
  Palette,
  Building2,
  AtSign,
  Type,
  Check,
  Save,
  Image as ImageIcon,
  LayoutTemplate,
  Ratio,
  Bot,
  Send,
  CheckCircle2,
  Sliders,
} from "lucide-react"
import { TEMPLATE_LIBRARY, POSTER_FORMATS } from "@/data/templates-and-seed"
import { PosterFormatKey } from "@/types/poster-studio"

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const [settings, setSettings] = useState({
    organization_name: "APJ Abdul Kalam Technological University",
    channel_handle: "@KTU_Updates",
    default_template: "minimal-academic",
    default_format: "instagram_portrait" as PosterFormatKey,
    brand_color: "#FF2E4D",
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
    }
  }, [])

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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#FF3355] uppercase tracking-wider mb-1">
          <Settings size={15} />
          <span>System & Brand Preferences</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Studio Brand Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure university attribution, default social media formats, AI extraction providers, and publication webhooks.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>Preferences successfully saved to local system!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. University & Channel Branding */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/[0.06] pb-3">
            <Building2 size={17} className="text-[#FF3355]" />
            <span>Identity & Channel Watermark</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                University / Organization Name
              </label>
              <input
                type="text"
                value={settings.organization_name}
                onChange={(e) =>
                  setSettings({ ...settings, organization_name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#FF3355]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Social Handle / Watermark
              </label>
              <input
                type="text"
                value={settings.channel_handle}
                onChange={(e) =>
                  setSettings({ ...settings, channel_handle: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#FF3355]"
                placeholder="@KTU_Notices"
              />
            </div>
          </div>
        </div>

        {/* 2. Poster Studio Defaults */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/[0.06] pb-3">
            <LayoutTemplate size={17} className="text-[#FF3355]" />
            <span>Studio Defaults & Preset Preferences</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default Poster Template
              </label>
              <select
                value={settings.default_template}
                onChange={(e) =>
                  setSettings({ ...settings, default_template: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#FF3355]"
              >
                {TEMPLATE_LIBRARY.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name} ({t.styleName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#FF3355]"
              >
                {Object.values(POSTER_FORMATS).map((f) => (
                  <option key={f.key} value={f.key} className="bg-slate-900 text-white">
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. AI Intelligence & Automated Webhooks */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/[0.06] pb-3">
            <Bot size={17} className="text-[#FF3355]" />
            <span>AI Parser & Dispatch Webhooks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                AI Extraction Model Provider
              </label>
              <select
                value={settings.ai_provider}
                onChange={(e) =>
                  setSettings({ ...settings, ai_provider: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#FF3355]"
              >
                <option value="gemini" className="bg-slate-900 text-white">
                  Google Gemini 1.5 Flash (Ultra Fast)
                </option>
                <option value="openai" className="bg-slate-900 text-white">
                  OpenAI GPT-4o-mini (Precision)
                </option>
                <option value="heuristic" className="bg-slate-900 text-white">
                  Heuristic Rule-Engine (Offline Fallback)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telegram / Discord Webhook URL (Optional)
              </label>
              <input
                type="text"
                value={settings.telegram_webhook}
                onChange={(e) =>
                  setSettings({ ...settings, telegram_webhook: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-[#FF3355]"
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
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF2E4D] to-[#FF4565] text-white text-xs font-bold shadow-lg shadow-rose-600/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
