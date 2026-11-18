import * as cheerio from "cheerio"
import { makeSourceId } from "@/lib/hash"

export interface ScrapedNotification {
  source_id: string
  title: string
  category: string
  description: string | null
  published_date: string | null   // ISO date string YYYY-MM-DD or null
  pdf_url: string | null
  original_url: string
  content_hash: string
}

const NOTIFICATIONS_URL = "https://ktunotes.in/notifications"

/**
 * Scrapes notifications directly from https://ktunotes.in/notifications
 * Parses the clean 'kn-notif-item' structure rendered by ktunotes.in.
 */
export async function scrapeKtuNotifications(): Promise<ScrapedNotification[]> {
  const response = await fetch(NOTIFICATIONS_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch from ktunotes.in: HTTP ${response.status} ${response.statusText}`
    )
  }

  const html = await response.text()
  const $ = cheerio.load(html)
  const notifications: ScrapedNotification[] = []

  // Primary selector on ktunotes.in
  const items = $("a.kn-notif-item")

  if (items.length > 0) {
    items.each((_, el) => {
      const element = $(el)

      // 1. Link & Original URL
      const href = element.attr("href") || ""
      const original_url = href.startsWith("http")
        ? href
        : `https://ktunotes.in${href.startsWith("/") ? "" : "/"}${href}`

      // 2. Title
      // It is in the first div child of the info block
      let title = element.find("div > div").first().text().trim()
      // Clean up extra whitespace/newlines
      title = title.replace(/\s+/g, " ")

      if (!title || title.length < 5) return

      // 3. Badges (Category, Date, PDF flag)
      const badges = element.find("span").map((_, s) => $(s).text().trim()).get()
      
      let category = "Exam"
      let published_date: string | null = null
      let hasPdf = false

      for (const badge of badges) {
        if (badge.includes("📅")) {
          const dateStr = badge.replace("📅", "").trim()
          published_date = parseDateFlexible(dateStr)
        } else if (badge.includes("PDF")) {
          hasPdf = true
        } else if (["Exam", "Result", "Admission", "Academic", "General"].includes(badge)) {
          category = badge
        }
      }

      // If category wasn't explicit, infer from title
      if (!category) {
        if (/result/i.test(title)) category = "Result"
        else if (/timetable|time table|schedule/i.test(title)) category = "Exam"
        else if (/academic|calendar/i.test(title)) category = "Academic"
        else category = "General"
      }

      // 4. Source ID & Content Hash
      const source_id = makeSourceId(original_url, title)
      const content_hash = makeSourceId(title, published_date || "")

      notifications.push({
        source_id,
        title,
        category,
        description: `Official KTU Notification published under ${category} on ktunotes.in.`,
        published_date,
        pdf_url: hasPdf ? original_url : null,
        original_url,
        content_hash,
      })
    })
  } else {
    // Fallback: search for any notification links
    $("a[href*='ktunotes.in/']").each((_, el) => {
      const element = $(el)
      const title = element.text().trim().replace(/\s+/g, " ")
      const href = element.attr("href") || ""

      if (
        title.length < 20 ||
        href.includes("/notifications") ||
        href.includes("/contact") ||
        href.includes("/about") ||
        href.includes("/privacy")
      ) {
        return
      }

      const source_id = makeSourceId(href, title)
      notifications.push({
        source_id,
        title,
        category: "Exam",
        description: "Official KTU Notification from ktunotes.in",
        published_date: null,
        pdf_url: null,
        original_url: href,
        content_hash: source_id,
      })
    })
  }

  // Deduplicate by source_id
  const seen = new Set<string>()
  return notifications.filter((n) => {
    if (seen.has(n.source_id)) return false
    seen.add(n.source_id)
    return true
  })
}

// ── Date parsing helper ────────────────────────────────────────────────
function parseDateFlexible(text: string): string | null {
  if (!text) return null
  const parsed = new Date(text)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0]
  }
  // Try DD/MM/YYYY or DD-MM-YYYY
  const match = text.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/)
  if (match) {
    const [, d, m, y] = match
    const year = y.length === 2 ? `20${y}` : y
    const date = new Date(`${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`)
    if (!isNaN(date.getTime())) return date.toISOString().split("T")[0]
  }
  return null
}
