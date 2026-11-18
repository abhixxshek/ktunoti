import type { AIExtractionData, PosterCanvasState, PosterElement, AspectRatioType } from "@/types/database"

export interface PosterTemplate {
  id: string
  name: string
  description: string
  category: "Academic" | "Modern" | "Minimal" | "Luxury"
  backgroundColor: string
  accentColor: string
  textColor: string
  cardBg: string
  cardBorder: string
  fontFamily: string
  tagline: string
  previewGradient: string
}

export const TEMPLATES: PosterTemplate[] = [
  {
    id: "minimal-academic",
    name: "Swiss Editorial",
    description: "Crisp white luxury typography, university crimson accents, and clean grid structure.",
    category: "Minimal",
    backgroundColor: "#FFFFFF",
    accentColor: "#E61E3D",
    textColor: "#0A0A0A",
    cardBg: "rgba(0, 0, 0, 0.025)",
    cardBorder: "rgba(0, 0, 0, 0.08)",
    fontFamily: "Inter, sans-serif",
    tagline: "OFFICIAL NOTIFICATION",
    previewGradient: "from-red-600 via-rose-500 to-pink-500",
  },
  {
    id: "obsidian-dark",
    name: "Obsidian Cyber",
    description: "Deep carbon black background, luminous cyan & electric crimson highlights.",
    category: "Modern",
    backgroundColor: "#08090D",
    accentColor: "#38BDF8",
    textColor: "#F8FAFC",
    cardBg: "rgba(255, 255, 255, 0.035)",
    cardBorder: "rgba(255, 255, 255, 0.1)",
    fontFamily: "Inter, sans-serif",
    tagline: "IMPORTANT ANNOUNCEMENT",
    previewGradient: "from-sky-500 via-indigo-500 to-purple-600",
  },
  {
    id: "royal-prestige",
    name: "Royal Prestige",
    description: "Deep collegiate navy with warm champagne gold borders and academic prestige.",
    category: "Luxury",
    backgroundColor: "#070E20",
    accentColor: "#E5A93C",
    textColor: "#FFFFFF",
    cardBg: "rgba(255, 255, 255, 0.04)",
    cardBorder: "rgba(229, 169, 60, 0.25)",
    fontFamily: "Georgia, serif",
    tagline: "UNIVERSITY CIRCULAR",
    previewGradient: "from-amber-400 via-yellow-500 to-amber-700",
  },
  {
    id: "sunset-aurora",
    name: "Sunset Aurora",
    description: "Dark plum gradient with sunset coral highlights for urgent, high-visibility notices.",
    category: "Modern",
    backgroundColor: "#0F0B1E",
    accentColor: "#FF4A75",
    textColor: "#FFFFFF",
    cardBg: "rgba(255, 255, 255, 0.04)",
    cardBorder: "rgba(255, 74, 117, 0.2)",
    fontFamily: "Inter, sans-serif",
    tagline: "CRITICAL DEADLINE",
    previewGradient: "from-rose-500 via-orange-500 to-amber-400",
  },
]

export const ASPECT_RATIOS: Record<
  AspectRatioType,
  { label: string; width: number; height: number; ratioClass: string }
> = {
  portrait: {
    label: "Portrait (4:5)",
    width: 1080,
    height: 1350,
    ratioClass: "aspect-[4/5]",
  },
  square: {
    label: "Square (1:1)",
    width: 1080,
    height: 1080,
    ratioClass: "aspect-square",
  },
  story: {
    label: "Story (9:16)",
    width: 1080,
    height: 1920,
    ratioClass: "aspect-[9/16]",
  },
}

/**
 * Intelligent auto-text sizing: prevents text overflow on canvas
 */
export function calculateFitFontSize(text: string, baseSize: number, maxChars = 38): number {
  if (!text) return baseSize
  if (text.length > maxChars * 2) return Math.round(baseSize * 0.72)
  if (text.length > maxChars) return Math.round(baseSize * 0.86)
  return baseSize
}

/**
 * Maps verified AI data into a clean, focused, uncluttered Canvas State.
 * NOTICE: Instructions / bullet text is omitted by default for pure, high-impact poster aesthetics.
 */
export function createPosterStateFromAI(
  aiData: AIExtractionData,
  templateId = "minimal-academic",
  aspectRatio: AspectRatioType = "portrait",
  customFooter = "@KTU_Updates",
  customBrand = "KTU Notify Studio"
): PosterCanvasState {
  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0]

  const elements: PosterElement[] = [
    {
      id: "el-university",
      type: "university",
      text: aiData.university || "APJ ABDUL KALAM TECHNOLOGICAL UNIVERSITY",
      fontSize: 12,
      fontWeight: "bold",
      fontFamily: template.fontFamily,
      color: template.accentColor,
      textAlign: "center",
      letterSpacing: 2.5,
    },
    {
      id: "el-badge",
      type: "badge",
      text: `${aiData.department_or_course || "B.Tech"} · ${aiData.semester || "All Semesters"}`,
      fontSize: 13,
      fontWeight: "semibold",
      fontFamily: template.fontFamily,
      color: template.textColor,
      textAlign: "center",
    },
    {
      id: "el-title",
      type: "title",
      text: aiData.main_title || "Official Examination Schedule Announcement",
      fontSize: calculateFitFontSize(aiData.main_title || "", 34, 32),
      fontWeight: "extrabold",
      fontFamily: template.fontFamily,
      color: template.textColor,
      textAlign: "center",
      lineHeight: 1.22,
    },
    {
      id: "el-dates",
      type: "dates",
      text: aiData.important_dates.length > 0
        ? aiData.important_dates.join("\n")
        : "15 April 2026 - Examination Commences\n24 April 2026 - Comprehensive Viva Voce\n30 April 2026 - Results Publication",
      fontSize: 14,
      fontWeight: "medium",
      fontFamily: template.fontFamily,
      color: template.textColor,
      textAlign: "left",
      lineHeight: 1.5,
    },
    {
      id: "el-deadlines",
      type: "deadlines",
      text: aiData.deadlines
        ? `Last Date: ${aiData.deadlines}`
        : "Submission Deadline: 28 April 2026",
      fontSize: 14,
      fontWeight: "extrabold",
      fontFamily: template.fontFamily,
      color: template.accentColor,
      textAlign: "center",
    },
    {
      id: "el-footer",
      type: "footer",
      text: `${customBrand} · ${customFooter}`,
      fontSize: 11,
      fontWeight: "medium",
      fontFamily: template.fontFamily,
      color: template.textColor,
      textAlign: "center",
      letterSpacing: 1.5,
    },
  ]

  return {
    templateId: template.id,
    aspectRatio,
    backgroundColor: template.backgroundColor,
    accentColor: template.accentColor,
    brandName: customBrand,
    footerText: customFooter,
    boxSpacing: 24,
    elements,
    aiData,
  }
}
