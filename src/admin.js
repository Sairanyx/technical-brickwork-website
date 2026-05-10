// src/admin.js
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

let allLeads = []
let currentFilter = 'all'

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
    const res = await fetch(`${SUPABASE_URL}/rest/v1/quotes?order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    })
    allLeads = await res.json()
    updateStats()
    renderLeads()
    const now = new Date()
    document.getElementById('last-updated').textContent =
      `Updated ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
  } catch (err) {
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
    if (currentFilter === 'new') return l.status === 'new'
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
    const phone = lead.phone?.replace(/\s/g, '') || ''
    const waMsg = encodeURIComponent(`Hi ${lead.name}, thanks for your enquiry with Technical Brickwork!`)

    return `
      <div class="lead-card ${isNew ? '' : 'done'}" id="lead-${lead.id}">
        <div class="lead-header">
          <div class="lead-info">
            <h3>${lead.name || 'Unknown'}${isNew ? '<span class="new-badge">New</span>' : ''}</h3>
            <div class="lead-meta">
              <span>📍 ${lead.postcode || 'No postcode'}</span>
              <span>📅 ${date} ${time}</span>
              <span>📞 ${lead.contact_method || 'Not specified'}</span>
            </div>
            ${lead.service ? `<div style="margin-top:6px"><span class="service-badge">${lead.service}</span></div>` : ''}
          </div>
        </div>
        ${lead.message ? `<div class="lead-message">"${lead.message}"</div>` : ''}
        <div class="lead-actions">
          <a href="tel:${phone}" class="action-btn call">📞 Call</a>
          <a href="https://wa.me/${phone.replace('+','')}?text=${waMsg}" class="action-btn whatsapp" target="_blank">💬 WhatsApp</a>
          <button class="action-btn done-btn" onclick="window.markDone(${lead.id})">${isNew ? '✓ Mark Done' : '↩ Reopen'}</button>
        </div>
      </div>
    `
  }).join('')
}

window.markDone = async function(id) {
  const lead = allLeads.find(l => l.id === id)
  const newStatus = lead.status === 'new' ? 'done' : 'new'
  await fetch(`${SUPABASE_URL}/rest/v1/quotes?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({ status: newStatus })
  })
  lead.status = newStatus
  updateStats()
  renderLeads()
}

document.addEventListener('DOMContentLoaded', () => {
  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      currentFilter = btn.dataset.filter
      renderLeads()
    })
  })

  // Netlify Identity
  const identity = window.netlifyIdentity
  if (!identity) {
    document.getElementById('leads-list').innerHTML =
      '<div class="empty-state">Identity not loaded.</div>'
    return
  }

  identity.on('init', user => {
    if (user) {
      showAdmin()
    } else {
      showLogin()
    }
  })

  // Also check immediately in case init already fired
  const currentUser = identity.currentUser()
  if (currentUser) {
    showAdmin()
  }

  identity.on('login', () => {
    identity.close()
    showAdmin()
  })

  identity.on('logout', () => {
    showLogin()
  })

  document.getElementById('btn-login').addEventListener('click', () => {
    identity.open('login')
  })

  document.getElementById('btn-logout').addEventListener('click', () => {
    identity.logout()
  })

  // Auto-refresh every 60 seconds
  setInterval(() => {
    if (document.getElementById('admin-screen').style.display !== 'none') loadLeads()
  }, 60000)
})
