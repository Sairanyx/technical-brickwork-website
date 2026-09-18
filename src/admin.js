// src/admin.js
// Lead dashboard. All data access goes through /.netlify/functions/leads,
// which verifies the Identity login server-side. No Supabase key is shipped
// to the browser.

let allLeads = []
let currentFilter = 'all'

// Escape anything that came from the public quote form before it goes near
// innerHTML — a lead's name or message is attacker-controlled text.
function esc(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function api(method, body) {
  const user = window.netlifyIdentity?.currentUser()
  if (!user) throw new Error('Not logged in')

  // Refreshes the JWT when it is close to expiry.
  const token = await user.jwt()

  const res = await fetch('/.netlify/functions/leads', {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : undefined
  })

  if (res.status === 401) {
    window.netlifyIdentity?.logout()
    throw new Error('Session expired')
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)

  return res.json()
}

function showAdmin() {
  document.getElementById('login-screen').style.display = 'none'
  document.getElementById('admin-screen').style.display = 'block'
  loadLeads()
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex'
  document.getElementById('admin-screen').style.display = 'none'
}

async function loadLeads() {
  try {
    allLeads = await api('GET')
    updateStats()
    renderLeads()
    const now = new Date()
    document.getElementById('last-updated').textContent =
      `Updated ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
  } catch (err) {
    console.error(err)
    document.getElementById('leads-list').innerHTML =
      '<div class="empty-state">Could not load leads.</div>'
  }
}

function updateStats() {
  document.getElementById('stat-total').textContent = allLeads.length
  document.getElementById('stat-new').textContent = allLeads.filter(l => l.status === 'new').length
  document.getElementById('stat-done').textContent = allLeads.filter(l => l.status === 'done').length
}

function renderLeads() {
  const filtered = allLeads.filter(l => {
    if (currentFilter === 'new')  return l.status === 'new'
    if (currentFilter === 'done') return l.status === 'done'
    return true
  })

  const list = document.getElementById('leads-list')
  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state">No leads found.</div>'
    return
  }

  list.innerHTML = filtered.map(lead => {
    const date = new Date(lead.created_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
    const time = new Date(lead.created_at).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit'
    })
    const isNew = lead.status === 'new'

    // Keep only digits and a leading + so a crafted phone value cannot break
    // out of the href.
    const phone   = String(lead.phone || '').replace(/[^\d+]/g, '')
    const waPhone = phone.replace(/\D/g, '')
    const waMsg   = encodeURIComponent(
      `Hi ${lead.name || ''}, thanks for your enquiry with Technical Brickwork!`
    )

    return `
      <div class="lead-card ${isNew ? '' : 'done'}" id="lead-${esc(lead.id)}">
        <div class="lead-header">
          <div class="lead-info">
            <h3>${esc(lead.name) || 'Unknown'}${isNew ? '<span class="new-badge">New</span>' : ''}</h3>
            <div class="lead-meta">
              <span>${esc(lead.postcode) || 'No postcode'}</span>
              <span>${date} ${time}</span>
              <span>${esc(lead.contact_method) || 'Not specified'}</span>
            </div>
            ${lead.service ? `<div style="margin-top:6px"><span class="service-badge">${esc(lead.service)}</span></div>` : ''}
          </div>
        </div>
        ${lead.message ? `<div class="lead-message">"${esc(lead.message)}"</div>` : ''}
        <div class="lead-actions">
          <a href="tel:${esc(phone)}" class="action-btn call">Call</a>
          <a href="https://wa.me/${esc(waPhone)}?text=${waMsg}" class="action-btn whatsapp" target="_blank" rel="noopener">WhatsApp</a>
          <button class="action-btn done-btn" data-id="${esc(lead.id)}">${isNew ? 'Mark Done' : 'Reopen'}</button>
        </div>
      </div>
    `
  }).join('')
}

async function toggleStatus(id) {
  const lead = allLeads.find(l => String(l.id) === String(id))
  if (!lead) return

  const newStatus = lead.status === 'new' ? 'done' : 'new'
  try {
    await api('PATCH', { id: Number(id), status: newStatus })
    lead.status = newStatus
    updateStats()
    renderLeads()
  } catch (err) {
    console.error('Could not update lead:', err)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      currentFilter = btn.dataset.filter
      renderLeads()
    })
  })

  // Delegated so no global handler is exposed on window.
  document.getElementById('leads-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.done-btn')
    if (btn) toggleStatus(btn.dataset.id)
  })

  const identity = window.netlifyIdentity
  if (!identity) {
    document.getElementById('leads-list').innerHTML =
      '<div class="empty-state">Identity not loaded.</div>'
    return
  }

  identity.on('init', user => { user ? showAdmin() : showLogin() })
  if (identity.currentUser()) showAdmin()

  identity.on('login',  () => { identity.close(); showAdmin() })
  identity.on('logout', () => { allLeads = []; showLogin() })

  document.getElementById('btn-login').addEventListener('click',  () => identity.open('login'))
  document.getElementById('btn-logout').addEventListener('click', () => identity.logout())

  setInterval(() => {
    if (document.getElementById('admin-screen').style.display !== 'none') loadLeads()
  }, 60000)
})
