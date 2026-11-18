import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"
import type { AIExtractionData } from "@/types/database"

const SYSTEM_PROMPT = `
You are an expert AI data extractor for university notifications from APJ Abdul Kalam Technological University (KTU).
Analyze the given notification text and extract concise, structured information for creating an academic poster.

CRITICAL RULES:
1. Return strictly valid JSON matching the exact schema below.
2. NEVER invent dates, course names, or deadlines not mentioned in the text.
3. If important dates or deadlines are not explicitly provided, leave them as empty array [] or empty string "".
4. EXAM REGISTRATION ACCURACY RULE:
   - For Exam Registration notices ONLY: if an exact date for registration "without fine" (or "without late fee") is explicitly and accurately mentioned in the notification/PDF text, extract it into "without_fine_date".
   - If the notice is NOT for exam registration, or if the "without fine" date is not explicitly and accurately found, leave "without_fine_date": "". NEVER invent or assume a date.
5. If dates or requirements are ambiguous or need human confirmation, set "requires_review": true.
6. Provide maximum 3 short, actionable bullet points for "instructions".
7. Keep "main_title" clean, punchy and optimized for a poster header (e.g., "B.Tech S6 Exam Registration").

JSON SCHEMA:
{
  "main_title": "string",
  "university": "APJ Abdul Kalam Technological University",
  "department_or_course": "string",
  "semester": "string",
  "important_dates": ["string"],
  "deadlines": "string",
  "without_fine_date": "string",
  "instructions": ["string"],
  "requires_review": boolean
}
`

/**
 * Extracts structured poster data using Gemini, OpenAI, or intelligent fallback.
 */
export async function extractNotificationData(
  title: string,
  content: string
): Promise<AIExtractionData> {
  const combinedText = `TITLE: ${title}\n\nDETAILS: ${content}`

  // 1. Try Google Gemini API if key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      })

      const prompt = `${SYSTEM_PROMPT}\n\nNOTIFICATION CONTENT:\n${combinedText}`
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      const parsed = JSON.parse(responseText) as AIExtractionData

      return validateAndCleanExtractedData(parsed, title)
    } catch (err) {
      console.warn("Gemini extraction error, checking fallback:", err)
    }
  }

  // 2. Try OpenAI API if key is present
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: combinedText },
        ],
        temperature: 0.1,
      })

      const contentResponse = completion.choices[0]?.message?.content
      if (contentResponse) {
        const parsed = JSON.parse(contentResponse) as AIExtractionData
        return validateAndCleanExtractedData(parsed, title)
      }
    } catch (err) {
      console.warn("OpenAI extraction error, checking fallback:", err)
    }
  }

  // 3. Fallback Heuristic Extractor when API keys are not yet configured
  return heuristicExtract(title, content)
}

function validateAndCleanExtractedData(
  data: Partial<AIExtractionData>,
  originalTitle: string
): AIExtractionData {
  return {
    main_title: data.main_title || originalTitle,
    university: data.university || "APJ Abdul Kalam Technological University",
    department_or_course: data.department_or_course || "B.Tech / M.Tech",
    semester: data.semester || "All Semesters",
    important_dates: Array.isArray(data.important_dates) ? data.important_dates : [],
    deadlines: data.deadlines || "",
    without_fine_date: data.without_fine_date || "",
    instructions: Array.isArray(data.instructions) ? data.instructions.slice(0, 3) : [],
    requires_review: Boolean(data.requires_review),
  }
}

/**
 * Deterministic heuristic extractor for zero-config offline or development mode
 */
function heuristicExtract(title: string, content: string): AIExtractionData {
  const text = `${title} ${content}`.toLowerCase()

  // Semester detection
  let semester = "All Semesters"
  const semMatch = text.match(/\b(s[1-8]|semester\s*[1-8]|first|second|third|fourth|fifth|sixth|seventh|eighth)\b/i)
  if (semMatch) {
    semester = semMatch[0].toUpperCase()
  }

  // Course detection
  let course = "B.Tech / M.Tech"
  if (text.includes("m.tech")) course = "M.Tech"
  else if (text.includes("b.tech")) course = "B.Tech"
  else if (text.includes("mca")) course = "MCA"
  else if (text.includes("mba")) course = "MBA"
  else if (text.includes("b.arch")) course = "B.Arch"

  // Date regex
  const dateRegex = /\b(\d{1,2}(?:st|nd|rd|th)?[\s\/\-\.](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[a-zA-Z]+|\d{1,2})[\s\/\-\.]\d{2,4})\b/gi
  const matchedDates = text.match(dateRegex) || []

  // Deadline keywords
  let deadlines = ""
  const deadlineMatch = content.match(/(?:last date|deadline|submission before|till|on or before)[\s:]*([^\.,\n]+)/i)
  if (deadlineMatch) {
    deadlines = deadlineMatch[0].trim()
  } else if (matchedDates.length > 0) {
    deadlines = matchedDates[matchedDates.length - 1]
  }

  // Without Fine date: ONLY for exam registration if explicitly present
  let withoutFineDate = ""
  const isExamRegistration =
    /registration/i.test(title) ||
    /exam.*registration|registration.*exam/i.test(text)

  if (isExamRegistration) {
    const withoutFineMatch = `${content} ${title}`.match(
      /(?:without\s+fine|w\/o\s+fine|without\s+late\s+fee|normal\s+fee)[\s:\-–—to]*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{2,4}|[0-9]{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+[0-9]{2,4})/i
    )
    if (withoutFineMatch && withoutFineMatch[1]) {
      withoutFineDate = withoutFineMatch[1].trim()
    }
  }

  return {
    main_title: title.replace(/published|circular|notification/gi, "").trim() || title,
    university: "APJ Abdul Kalam Technological University",
    department_or_course: course,
    semester: semester,
    important_dates: Array.from(new Set(matchedDates)).slice(0, 3),
    deadlines: deadlines,
    without_fine_date: withoutFineDate,
    instructions: [
      "Check university portal for candidate-specific details",
      "Verify registration status with department coordinator",
      "Adhere strictly to prescribed submission timelines",
    ],
    requires_review: matchedDates.length === 0,
  }
}

