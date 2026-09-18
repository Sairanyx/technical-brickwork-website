// netlify/functions/leads.js
//
// Server-side gateway to the quotes table.
//
// The browser never sees a Supabase key that can read customer data. This
// function holds the service_role key (set in Netlify env vars, never in the
// bundle) and will only use it once Netlify Identity has verified the caller.
//
// clientContext.user is populated by Netlify from a signed JWT it has already
// validated, so it cannot be forged by sending a header by hand.

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
}

function reply(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) }
}

async function supabase(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      ...options.headers
    }
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Supabase ${res.status}: ${detail}`)
  }
  return res
}

export async function handler(event, context) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    return reply(500, { error: 'Server not configured' })
  }

  // Every request must come from a logged-in Identity user.
  const user = context.clientContext && context.clientContext.user
  if (!user) return reply(401, { error: 'Not authorised' })

  try {
    if (event.httpMethod === 'GET') {
      const res = await supabase('quotes?order=created_at.desc')
      return reply(200, await res.json())
    }

    if (event.httpMethod === 'PATCH') {
      let payload
      try {
        payload = JSON.parse(event.body || '{}')
      } catch {
        return reply(400, { error: 'Invalid JSON' })
      }

      const id = Number(payload.id)
      if (!Number.isInteger(id) || id <= 0) {
        return reply(400, { error: 'Invalid id' })
      }
      if (payload.status !== 'new' && payload.status !== 'done') {
        return reply(400, { error: 'Invalid status' })
      }

      await supabase(`quotes?id=eq.${id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ status: payload.status })
      })
      return reply(200, { ok: true })
    }

    return reply(405, { error: 'Method not allowed' })
  } catch (err) {
    // Log server-side; don't leak Supabase internals to the browser.
    console.error('leads function error:', err)
    return reply(502, { error: 'Upstream request failed' })
  }
}
