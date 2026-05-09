// src/quote.js
// Quote form — 2-step flow with Supabase + Netlify Forms

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY

async function saveToSupabase(payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`)
}

async function sendNetlifyForm(payload) {
  const formData = new FormData()
  formData.append('form-name', 'quote')
  Object.entries(payload).forEach(([k, v]) => formData.append(k, v))
  await fetch('/', { method: 'POST', body: formData })
}

document.addEventListener('DOMContentLoaded', () => {
  const data = { name: '', phone: '', email: '', postcode: '', contact: '', service: '', message: '' }

  const step1     = document.getElementById('step-1')
  const step2     = document.getElementById('step-2')
  const success   = document.getElementById('success')
  const btnStep1  = document.getElementById('btn-step1')
  const btnBack   = document.getElementById('btn-back')
  const btnSubmit = document.getElementById('btn-submit')
  const prog1     = document.getElementById('prog-1')
  const prog2     = document.getElementById('prog-2')

  document.querySelectorAll('.contact-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('selected'))
  })

  document.querySelectorAll('.service-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.service-btn').forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      data.service = btn.dataset.value
    })
  })

  btnStep1.addEventListener('click', () => {
    data.name     = document.getElementById('name').value.trim()
    data.phone    = document.getElementById('phone').value.trim()
    data.email    = document.getElementById('email')?.value.trim() || ''
    data.postcode = document.getElementById('postcode').value.trim().toUpperCase()

    if (!data.name)     { shake(document.getElementById('name'));     return }
    if (!data.phone)    { shake(document.getElementById('phone'));    return }
    if (!data.postcode) { shake(document.getElementById('postcode')); return }

    step1.classList.remove('active')
    step2.classList.add('active')
    prog1.classList.remove('active')
    prog1.classList.add('done')
    prog2.classList.add('active')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  btnBack.addEventListener('click', () => {
    step2.classList.remove('active')
    step1.classList.add('active')
    prog2.classList.remove('active')
    prog1.classList.remove('done')
    prog1.classList.add('active')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  btnSubmit.addEventListener('click', async () => {
    data.message = document.getElementById('message').value.trim()

    const contactMethods = [...document.querySelectorAll('.contact-btn.selected')]
      .map(b => b.dataset.value).join(', ') || 'Not specified'

    if (!data.service) { shake(document.querySelector('.services-grid')); return }

    btnSubmit.textContent = 'Sending...'
    btnSubmit.disabled = true

    const payload = {
      name:           data.name,
      phone:          data.phone,
      email:          data.email || 'Not provided',
      postcode:       data.postcode,
      contact_method: contactMethods,
      service:        data.service,
      message:        data.message
    }

    try {
      await Promise.all([
        saveToSupabase(payload),
        sendNetlifyForm(payload)
      ])
    } catch (err) {
      console.error('Submission error:', err)
    }

    step2.classList.remove('active')
    success.style.display = 'block'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  function shake(el) {
    el.style.transition = 'transform 0.1s'
    el.style.transform = 'translateX(-6px)'
    setTimeout(() => { el.style.transform = 'translateX(6px)' },  100)
    setTimeout(() => { el.style.transform = 'translateX(-4px)' }, 200)
    setTimeout(() => { el.style.transform = 'translateX(0)' },    300)
  }
})