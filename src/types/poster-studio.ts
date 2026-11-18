export const BTECH_CATEGORIES = [
  "Examination Notifications",
  "Examination Results",
  "Registration",
  "Academic Notifications",
  "Time Table",
  "Examination Schedule",
  "Revaluation",
  "Supplementary Examinations",
  "Circulars",
  "Fee Notifications",
  "Student Services",
  "College Notifications",
  "Academic Calendar",
  "Other Notifications",
] as const

export type BTechCategory = (typeof BTECH_CATEGORIES)[number]

export type NavigationTabId =
  | "dashboard"
  | "all-announcements"
  | "new-notifications"
  | "categories"
  | "poster-studio"
  | "template-library"
  | "scheduled-fetching"
  | "generated-posters"
  | "settings"
  | "logs"

export type PosterFormatKey =
  | "instagram_portrait"
  | "instagram_story"
  | "square_post"
  | "landscape"

export interface PosterFormatSpec {
  key: PosterFormatKey
  label: string
  shortLabel: string
  width: number
  height: number
  aspectClass: string
}

export type LogoPlacement = "top-right" | "top-left" | "bottom-right" | "hidden"

export interface TemplateStyle {
  id: string
  name: string
  styleName: string
  description: string
  defaultCategories: BTechCategory[]
  bgGradient: string
  bgSolidFallback: [string, string]
  cardBg: string
  primaryText: string
  secondaryText: string
  accentColor: string
  badgeBg: string
  badgeText: string
  borderColor: string
  layoutVariant: "editorial" | "urgent" | "centered" | "split"
}

export interface KtuAnnouncementRecord {
  id: number
  externalKtuId: string
  title: string
  shortDescription: string
  fullDescription: string
  category: BTechCategory
  publishedDate: string
  academicYear: string | null
  semester: string | null
  scheme: string | null
  registrationDeadline: string | null
  examinationDate: string | null
  officialReference: string | null
  importantInstructions: string[]
  sourceUrl: string
  originalPdfUrl: string | null
  detectedAt: string
  processingStatus: "completed" | "pending" | "failed" | "archived"
  posterStatus: "generated" | "pending_approval" | "not_generated"
  suggestedTemplateId: string
}

export interface PosterDesignState {
  title: string
  malayalamSubtitle: string
  description: string
  category: BTechCategory
  semester: string
  officialReference: string
  sourceText: string
  footerText: string
  fontSizeScale: number
  textAlign: "left" | "center" | "right"
  accentColorOverride: string
  cardBgOverride: string
  customBackgroundImage: string | null
  customLogo?: string | null
  logoPlacement: LogoPlacement
  importantDate?: string
  deadline?: string
  examDate?: string
  academicYear?: string
}

export interface GeneratedPosterItem {
  id: string
  announcementId: number
  title: string
  category: BTechCategory
  templateId: string
  templateName: string
  formatKey: PosterFormatKey
  dimensions: string
  exportFormat: "png" | "jpeg"
  dataUrl: string
  createdAt: string
  mode: "Manual Studio" | "Auto Mode B"
}

export interface SyncLogEntry {
  id: string
  timestamp: string
  source: string
  status: "SUCCESS" | "PARTIAL" | "FAILED"
  fetchedCount: number
  newBtechCount: number
  postersTriggered: number
  durationMs: number
  message: string
}

