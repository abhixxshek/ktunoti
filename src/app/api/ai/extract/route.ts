import { extractNotificationData } from "@/lib/ai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title = "", text = "" } = body

    if (!title && !text) {
      return Response.json(
        { error: "Provide notification 'title' or 'text' for extraction" },
        { status: 400 }
      )
    }

    const structuredData = await extractNotificationData(title, text)
    return Response.json({
      success: true,
      data: structuredData,
    })
  } catch (error) {
    console.error("Extraction API error:", error)
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal extraction error" },
      { status: 500 }
    )
  }
}

