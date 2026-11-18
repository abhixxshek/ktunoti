import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { scrapeKtuNotifications } from "@/lib/scraper"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || url.includes("placeholder") || url.includes("your-supabase")) {
    return null
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const forceRefresh = searchParams.get("refresh") === "true"

  const supabase = getSupabase()

  // 1. If Supabase is available and not forcing refresh, attempt to read stored records
  if (supabase && !forceRefresh) {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("published_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(30)

      if (!error && data && data.length > 0) {
        return NextResponse.json({
          success: true,
          source: "database",
          notifications: data,
        })
      }
    } catch (e) {
      console.warn("Supabase query fallback to live scrape", e)
    }
  }

  // 2. Fetch live from https://ktunotes.in/notifications
  try {
    const liveNotifs = await scrapeKtuNotifications()

    // If Supabase is configured, upsert the live notifications in the background
    if (supabase && liveNotifs.length > 0) {
      try {
        const rows = liveNotifs.map((n) => ({
          source_id: n.source_id,
          title: n.title,
          description: n.description,
          published_date: n.published_date,
          pdf_url: n.pdf_url,
          original_url: n.original_url,
          content_hash: n.content_hash,
          status: "new",
        }))
        await supabase.from("notifications").upsert(rows, { onConflict: "source_id" })
      } catch (insertErr) {
        console.warn("Could not cache to Supabase", insertErr)
      }
    }

    return NextResponse.json({
      success: true,
      source: "live_ktunotes",
      notifications: liveNotifs,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch from ktunotes.in",
        notifications: [],
      },
      { status: 500 }
    )
  }
}

