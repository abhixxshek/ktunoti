export type NotificationStatus = 'new' | 'processing' | 'ready' | 'published' | 'failed'

export interface Notification {
  id: string
  source_id: string
  title: string
  description: string | null
  published_date: string | null
  pdf_url: string | null
  original_url: string | null
  content_hash: string | null
  status: NotificationStatus
  created_at: string
  updated_at: string
}

export interface BrandSettings {
  id?: string
  user_id?: string
  organization_name: string
  custom_footer: string
  brand_color: string
  default_font: string
  logo_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface AIExtractionData {
  main_title: string
  university: string
  department_or_course: string
  semester: string
  important_dates: string[]
  deadlines: string
  without_fine_date?: string
  instructions: string[]
  requires_review: boolean
}

export type AspectRatioType = 'portrait' | 'square' | 'story'

export interface PosterElement {
  id: string
  type: 'title' | 'university' | 'tag' | 'meta' | 'dates' | 'deadlines' | 'instructions' | 'footer' | 'badge'
  text: string
  fontSize: number
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  fontFamily: string
  color: string
  textAlign: 'left' | 'center' | 'right'
  letterSpacing?: number
  lineHeight?: number
}

export interface PosterCanvasState {
  id?: string
  templateId: string
  aspectRatio: AspectRatioType
  backgroundColor: string
  accentColor: string
  brandName: string
  footerText: string
  boxSpacing?: number
  elements: PosterElement[]
  aiData?: AIExtractionData
}

export interface GeneratedPoster {
  id: string
  notification_id: string | null
  user_id?: string
  canvas_state_json: PosterCanvasState | Record<string, unknown> | null
  thumbnail_url: string | null
  title?: string
  created_at: string
  updated_at?: string
}
