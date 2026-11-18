import { POSTER_FORMATS } from "@/data/templates-and-seed"
import {
  PosterDesignState,
  PosterFormatKey,
  TemplateStyle,
} from "@/types/poster-studio"

export async function renderPosterToDataUrl(params: {
  template: TemplateStyle
  formatKey: PosterFormatKey
  design: PosterDesignState
  exportFormat: "png" | "jpeg"
}): Promise<string> {
  const { template, formatKey, design, exportFormat } = params
  const spec = POSTER_FORMATS[formatKey]

  const canvas = document.createElement("canvas")
  canvas.width = spec.width
  canvas.height = spec.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context unavailable")

  const accent = design.accentColorOverride || template.accentColor
  const cardBg = design.cardBgOverride || template.cardBg

  // 1. Render Background Gradient or Custom Uploaded Image
  const grad = ctx.createLinearGradient(0, 0, spec.width, spec.height)
  grad.addColorStop(0, template.bgSolidFallback[0])
  grad.addColorStop(1, template.bgSolidFallback[1])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, spec.width, spec.height)

  if (design.customBackgroundImage) {
    try {
      const bgImg = await loadImage(design.customBackgroundImage)
      ctx.save()
      ctx.globalAlpha = 0.35
      ctx.drawImage(bgImg, 0, 0, spec.width, spec.height)
      ctx.restore()
    } catch {
      // Fallback to gradient if image load fails
    }
  }

  // 2. Main Poster Card Container
  const outerPad = formatKey === "landscape" ? 42 : 64
  const cardW = spec.width - outerPad * 2
  const cardH = spec.height - outerPad * 2

  ctx.save()
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)"
  ctx.shadowBlur = 45
  ctx.shadowOffsetY = 18
  ctx.fillStyle = cardBg
  ctx.beginPath()
  ctx.roundRect(outerPad, outerPad, cardW, cardH, 36)
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = template.borderColor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(outerPad, outerPad, cardW, cardH, 36)
  ctx.stroke()

  // 3. Header Bar: Category Badge & KTU Official Crest
  const contentX = outerPad + 56
  const contentRight = outerPad + cardW - 56
  const maxTextW = cardW - 112
  let cursorY = outerPad + 60

  ctx.font = "800 20px 'Plus Jakarta Sans', Inter, sans-serif"
  const catText = design.category.toUpperCase()
  const badgeW = Math.min(maxTextW * 0.68, ctx.measureText(catText).width + 48)

  ctx.fillStyle = template.badgeBg
  ctx.beginPath()
  ctx.roundRect(contentX, cursorY, badgeW, 50, 25)
  ctx.fill()

  ctx.fillStyle = template.badgeText
  ctx.textAlign = "left"
  ctx.fillText(catText, contentX + 24, cursorY + 32)

  const activeLogo =
    design.customLogo !== undefined && design.customLogo !== null
      ? design.customLogo
      : "/logo.png"

  if (design.logoPlacement !== "hidden" && activeLogo) {
    const logoY =
      design.logoPlacement === "bottom-right"
        ? outerPad + cardH - 140
        : cursorY

    try {
      const logoImg = await loadImage(activeLogo)
      const maxLogoH = 110
      const maxLogoW = 200
      const aspect = logoImg.width / logoImg.height
      let drawW = maxLogoH * aspect
      let drawH = maxLogoH
      if (drawW > maxLogoW) {
        drawW = maxLogoW
        drawH = drawW / aspect
      }
      const logoX =
        design.logoPlacement === "top-left"
          ? contentX
          : contentRight - drawW

      ctx.drawImage(logoImg, logoX, logoY, drawW, drawH)
    } catch {
      const logoX =
        design.logoPlacement === "top-left"
          ? contentX
          : contentRight - 90
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.roundRect(logoX, logoY, 90, 80, 16)
      ctx.fill()

      ctx.fillStyle = "#FFFFFF"
      ctx.font = "800 24px 'Plus Jakarta Sans', sans-serif"
      ctx.fillText("KTU", logoX + 18, logoY + 48)
    }
  }

  // 4. Calculate Vertical Centering for Title Block
  const footerY = outerPad + cardH - 42
  const topLimitY = outerPad + 185
  const bottomLimitY = footerY - 45
  const availableH = bottomLimitY - topLimitY

  const baseFontSize =
    formatKey === "landscape"
      ? 34
      : design.title.length > 130
      ? 40
      : design.title.length > 90
      ? 46
      : 54
  const titleFontSize = Math.round(baseFontSize * design.fontSizeScale)

  ctx.font = `800 ${titleFontSize}px 'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif`
  const maxTitleLines = formatKey === "landscape" ? 3 : 5
  const titleLines = wrapCanvasText(ctx, design.title, maxTextW, maxTitleLines)

  const hasSubtitle = Boolean(design.malayalamSubtitle && design.malayalamSubtitle.trim())
  const isRegistration =
    design.category === "Registration" ||
    /registration/i.test(design.title) ||
    /registration/i.test(design.category)

  const pills: Array<{ label: string; value: string; urgent?: boolean }> = []
  if (design.semester && design.semester.trim())
    pills.push({ label: "SEMESTER", value: design.semester.trim(), urgent: false })
  if (design.officialReference && design.officialReference.trim())
    pills.push({ label: "KTU REF", value: design.officialReference.trim(), urgent: false })
  if (isRegistration && design.withoutFineDate && design.withoutFineDate.trim())
    pills.push({ label: "WITHOUT FINE", value: design.withoutFineDate.trim(), urgent: true })

  const contentBlockH =
    40 +
    (hasSubtitle ? 48 : 0) +
    (titleLines.length * titleFontSize * 1.25) +
    (pills.length > 0 ? 98 : 0)

  // Vertically centered cursorY inside available area
  cursorY = topLimitY + Math.max(16, Math.floor((availableH - contentBlockH) / 2))

  const alignX =
    design.textAlign === "center"
      ? outerPad + cardW / 2
      : design.textAlign === "right"
      ? contentRight
      : contentX

  // Accent Divider
  ctx.fillStyle = accent
  const barX =
    design.textAlign === "center"
      ? alignX - 44
      : design.textAlign === "right"
      ? contentRight - 88
      : contentX
  ctx.beginPath()
  ctx.roundRect(barX, cursorY, 88, 8, 4)
  ctx.fill()
  cursorY += 40

  // Malayalam Subtitle (if any)
  ctx.textAlign = design.textAlign
  if (hasSubtitle) {
    ctx.fillStyle = accent
    ctx.font = "700 24px 'Noto Sans Malayalam', Inter, sans-serif"
    ctx.fillText(design.malayalamSubtitle.trim(), alignX, cursorY)
    cursorY += 48
  }

  // Adaptive Multi-Line Title
  ctx.fillStyle = template.primaryText
  ctx.font = `800 ${titleFontSize}px 'Plus Jakarta Sans', 'Noto Sans Malayalam', sans-serif`
  for (const l of titleLines) {
    ctx.fillText(l, alignX, cursorY)
    cursorY += titleFontSize * 1.25
  }

  // 7. Fact-Only Metadata Grid
  ctx.textAlign = "left"
  if (pills.length > 0) {
    cursorY += 24
    let pillX = contentX
    for (const pill of pills) {
      ctx.font = "700 21px Inter, sans-serif"
      const valW = ctx.measureText(pill.value).width
      const pillW = Math.max(195, valW + 44)

      if (pillX + pillW > contentRight) {
        pillX = contentX
        cursorY += 88
      }

      if (cursorY + 80 < outerPad + cardH - 70) {
        ctx.fillStyle = pill.urgent ? "rgba(233, 67, 89, 0.22)" : "rgba(148, 163, 184, 0.14)"
        ctx.beginPath()
        ctx.roundRect(pillX, cursorY, pillW, 74, 16)
        ctx.fill()

        ctx.fillStyle = pill.urgent ? "#E94359" : accent
        ctx.beginPath()
        ctx.roundRect(pillX, cursorY, 6, 74, 3)
        ctx.fill()

        ctx.fillStyle = pill.urgent ? "#E94359" : template.secondaryText
        ctx.font = pill.urgent ? "800 13px Inter, sans-serif" : "700 13px Inter, sans-serif"
        ctx.fillText(pill.label, pillX + 20, cursorY + 26)

        ctx.fillStyle = template.primaryText
        ctx.font = "800 20px Inter, sans-serif"
        ctx.fillText(pill.value, pillX + 20, cursorY + 54)

        pillX += pillW + 16
      }
    }
  }

  // 8. Official Source Footer Bar
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(contentX, footerY - 32)
  ctx.lineTo(contentRight, footerY - 32)
  ctx.stroke()

  ctx.fillStyle = template.secondaryText
  ctx.font = "600 17px Inter, sans-serif"
  ctx.textAlign = "left"
  ctx.fillText(design.sourceText, contentX, footerY)

  ctx.textAlign = "right"
  ctx.fillText(design.footerText, contentRight, footerY)

  const mime = exportFormat === "jpeg" ? "image/jpeg" : "image/png"
  return canvas.toDataURL(mime, 0.96)
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth) {
      if (current) lines.push(current)
      current = word
      if (lines.length >= maxLines - 1) break
    } else {
      current = candidate
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current)
  }
  return lines
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

