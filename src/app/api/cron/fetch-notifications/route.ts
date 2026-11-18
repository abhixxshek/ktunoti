import { createClient } from "@supabase/supabase-js"
import { scrapeKtuNotifications } from "@/lib/scraper"

// Use service-role key so we can bypass RLS for server-side inserts
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars")
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(request: Request) {
  // Optional: protect the cron endpoint with a secret header
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = getAdminClient()

    // 1. Scrape notifications from KTU
    const scraped = await scrapeKtuNotifications()

    if (scraped.length === 0) {
      return Response.json({ message: "No notifications found on the page", inserted: 0, skipped: 0 })
    }

    // 2. Fetch all existing source_ids in one query for deduplication
    const { data: existing, error: fetchError } = await supabase
      .from("notifications")
      .select("source_id")

    if (fetchError) {
      throw new Error(`Supabase fetch error: ${fetchError.message}`)
    }

    const existingIds = new Set((existing ?? []).map((r: { source_id: string }) => r.source_id))

    // 3. Filter only genuinely new notifications
    const toInsert = scraped.filter((n) => !existingIds.has(n.source_id))

    let inserted = 0
    let skipped = scraped.length - toInsert.length

    if (toInsert.length > 0) {
      const rows = toInsert.map((n) => ({
        source_id: n.source_id,
        title: n.title,
        description: n.description,
        published_date: n.published_date,
        pdf_url: n.pdf_url,
        original_url: n.original_url,
        content_hash: n.content_hash,
        status: "new" as const,
      }))

      const { error: insertError } = await supabase
        .from("notifications")
        .insert(rows)

      if (insertError) {
        throw new Error(`Supabase insert error: ${insertError.message}`)
      }

      inserted = toInsert.length
    }

    return Response.json({
      message: "Sync complete",
      scraped: scraped.length,
      inserted,
      skipped,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[fetch-notifications]", message)
    return Response.json({ error: message }, { status: 500 })
  }
}

