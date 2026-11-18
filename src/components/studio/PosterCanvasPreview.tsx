"use client"

import React from "react"
import { POSTER_FORMATS } from "@/data/templates-and-seed"
import {
  PosterDesignState,
  PosterFormatKey,
  TemplateStyle,
} from "@/types/poster-studio"

interface PosterCanvasPreviewProps {
  template: TemplateStyle
  formatKey: PosterFormatKey
  design: PosterDesignState
  scale?: number
  className?: string
}

export const PosterCanvasPreview: React.FC<PosterCanvasPreviewProps> = ({
  template,
  formatKey,
  design,
  scale = 1,
  className = "",
}) => {
  const spec = POSTER_FORMATS[formatKey] || POSTER_FORMATS.instagram_portrait
  const accent = design.accentColorOverride || template.accentColor
  const cardBg = design.cardBgOverride || template.cardBg
  const activeLogo =
    design.customLogo !== undefined && design.customLogo !== null
      ? design.customLogo
      : "/logo.png"

  const titleSizeClass =
    formatKey === "landscape"
      ? "text-sm sm:text-base md:text-lg leading-snug"
      : design.title.length > 125
      ? "text-sm sm:text-base md:text-lg leading-snug"
      : design.title.length > 85
      ? "text-base sm:text-lg md:text-xl leading-snug"
      : "text-lg sm:text-xl md:text-2xl leading-tight"

  const activePills = [
    { label: "SEMESTER", value: design.semester, urgent: false },
    { label: "KTU REF", value: design.officialReference, urgent: false },
  ].filter((p) => p.value && p.value.trim().length > 0)

  return (
    <div
      style={{
        background: design.customBackgroundImage
          ? `linear-gradient(rgba(9, 13, 22, 0.65), rgba(9, 13, 22, 0.75)), url(${design.customBackgroundImage}) center/cover no-repeat`
          : template.bgGradient,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "center center",
      }}
      className={`w-full max-w-[360px] sm:max-w-[480px] lg:max-w-[520px] rounded-[20px] sm:rounded-[28px] p-3 sm:p-6 shadow-2xl border border-white/15 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${spec.aspectClass} ${className}`}
    >
      <div
        style={{
          backgroundColor: cardBg,
          color: template.primaryText,
          borderColor: template.borderColor,
          textAlign: design.textAlign,
        }}
        className="w-full h-full rounded-[16px] sm:rounded-[22px] p-3.5 sm:p-6 border flex flex-col justify-between shadow-xl relative overflow-hidden backdrop-blur-md"
      >
        {/* Top Header */}
        <div
          className={`flex items-center justify-between gap-2 ${
            design.logoPlacement === "top-left" ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span
            style={{
              backgroundColor: template.badgeBg,
              color: template.badgeText,
            }}
            className="px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider truncate max-w-[70%]"
          >
            {design.category}
          </span>

          {design.logoPlacement !== "hidden" &&
            design.logoPlacement !== "bottom-right" && (
              activeLogo ? (
                <div className="flex items-center shrink-0">
                  <img
                    src={activeLogo}
                    alt="Logo"
                    className="h-10 max-h-10 w-auto max-w-[130px] object-contain rounded"
                  />
                </div>
              ) : null
            )}
        </div>

        {/* Center Body - Vertically Centered */}
        <div className="flex-1 flex flex-col justify-center my-auto py-4 space-y-3 text-left">
          <div
            style={{ backgroundColor: accent }}
            className={`h-1.5 w-14 rounded-full ${
              design.textAlign === "center"
                ? "mx-auto"
                : design.textAlign === "right"
                ? "ml-auto"
                : "mr-auto"
            }`}
          />

          {design.malayalamSubtitle && design.malayalamSubtitle.trim() && (
            <div
              style={{ color: accent }}
              className="text-xs font-bold tracking-wide"
            >
              {design.malayalamSubtitle}
            </div>
          )}

          <h2
            style={{
              fontSize: `${Math.round(100 * design.fontSizeScale)}%`,
            }}
            className={`font-extrabold tracking-tight line-clamp-4 break-words ${titleSizeClass}`}
          >
            {design.title}
          </h2>

          {/* Fact-Only Metadata Pills */}
          {activePills.length > 0 && (
            <div
              className={`flex flex-wrap gap-2 pt-2 ${
                design.textAlign === "center"
                  ? "justify-center"
                  : design.textAlign === "right"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {activePills.map((pill) => (
                <div
                  key={pill.label}
                  style={{ borderLeftColor: accent }}
                  className={`px-2.5 py-1.5 rounded-lg border-l-4 text-left ${
                    pill.urgent
                      ? "bg-amber-500/15"
                      : "bg-slate-500/10"
                  }`}
                >
                  <div className="text-[8px] font-bold uppercase tracking-wider opacity-65">
                    {pill.label}
                  </div>
                  <div className="text-[11px] font-extrabold leading-tight mt-0.5">
                    {pill.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div
          style={{ color: template.secondaryText }}
          className="pt-2.5 border-t border-slate-500/20 flex items-center justify-between gap-2 text-[10px] font-semibold"
        >
          <span className="truncate">{design.sourceText}</span>
          {design.logoPlacement === "bottom-right" ? (
            <span
              style={{ backgroundColor: accent }}
              className="px-2 py-0.5 rounded text-white font-bold text-[10px]"
            >
              KTU B.Tech
            </span>
          ) : (
            <span className="truncate">{design.footerText}</span>
          )}
        </div>
      </div>
    </div>
  )
}

