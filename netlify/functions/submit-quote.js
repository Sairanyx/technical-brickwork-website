// netlify/functions/submit-quote.js
//
// Public endpoint for the quote form. Runs server-side so the browser never
// holds a Supabase key at all — this one accepts writes only, and only the
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

export async function handler(event) {
  if (event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' })

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return reply(500, { error: 'Server not configured' })
  }

  let input
  try {
    input = JSON.parse(event.body || '{}')
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
