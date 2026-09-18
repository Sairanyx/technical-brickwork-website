// netlify/functions/submit-quote.js
//
// Public endpoint for the quote form. Runs server-side so the browser never
// holds a Supabase key at all. This one accepts writes only, and only the
// seven fields below.

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }

const LIMITS = {
  name: 120, phone: 40, email: 160,
  postcode: 16, contact_method: 80, service: 60, message: 2000
}

function reply(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) }
}

function clean(value, max) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim().slice(0, max)
}

// A genuine enquiry is well under 4KB. Anything larger is junk, and parsing it
// wastes function time.
const MAX_BODY_BYTES = 8 * 1024

// Best-effort throttle. Function instances are not shared, so this slows a
// flood from one source rather than stopping it outright.
const RATE_LIMIT = 5             // submissions
const RATE_WINDOW_MS = 60 * 1000 // per minute, per IP
const recent = new Map()

function rateLimited(ip) {
  if (!ip) return false
  const now = Date.now()

  for (const [key, times] of recent) {
    const kept = times.filter(t => now - t < RATE_WINDOW_MS)
    if (kept.length) recent.set(key, kept)
    else recent.delete(key)
  }

  const times = recent.get(ip) || []
  if (times.length >= RATE_LIMIT) return true

  times.push(now)
  recent.set(ip, times)
  return false
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' })

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return reply(500, { error: 'Server not configured' })
  }

  const body = event.body || '{}'
  if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) {
    return reply(413, { error: 'Request too large' })
  }

  const ip = event.headers['x-nf-client-connection-ip'] ||
             (event.headers['x-forwarded-for'] || '').split(',')[0].trim()
  if (rateLimited(ip)) {
    return reply(429, { error: 'Too many requests. Please try again shortly.' })
  }

  let input
  try {
    input = JSON.parse(body)
  } catch {
    return reply(400, { error: 'Invalid JSON' })
  }

  // Honeypot: real users never fill this in.
  if (clean(input['bot-field'], 50)) return reply(200, { ok: true })

  const row = {
    name:           clean(input.name,           LIMITS.name),
    phone:          clean(input.phone,          LIMITS.phone),
    email:          clean(input.email,          LIMITS.email),
    postcode:       clean(input.postcode,       LIMITS.postcode).toUpperCase(),
    contact_method: clean(input.contact_method, LIMITS.contact_method),
    service:        clean(input.service,        LIMITS.service),
    message:        clean(input.message,        LIMITS.message),
    status:         'new'
  }

  if (!row.name || !row.phone) {
    return reply(400, { error: 'Name and phone are required' })
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row)
    })
    if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
    return reply(200, { ok: true })
  } catch (err) {
    console.error('submit-quote error:', err)
    return reply(502, { error: 'Could not save enquiry' })
  }
}
