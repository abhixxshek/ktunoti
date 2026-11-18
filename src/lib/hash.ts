import * as crypto from "crypto"

/**
 * Creates a stable SHA-256 hash from a notification's URL and title,
 * used as the unique `source_id` to prevent duplicate inserts.
 */
export function makeSourceId(url: string, title: string): string {
  const raw = `${url.trim().toLowerCase()}::${title.trim().toLowerCase()}`
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32)
}

