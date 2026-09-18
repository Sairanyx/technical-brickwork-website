// src/quote.js
// Quote form. 2-step flow, submits via a Netlify Function.

import { initTransitions } from './components/transitions.js'

initTransitions()

// Posts to a Netlify Function rather than straight to Supabase, so no
// database key is shipped to the browser.
async function saveEnquiry(payload) {
  const res = await fetch('/.netlify/functions/submit-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (res.status === 429) {
    const err = new Error('Rate limited')
    err.rateLimited = true
    throw err
  }
  if (!res.ok) throw new Error(`Submit failed: ${res.status}`)
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

    // The database write and the email notification are independent: either
    // one reaching us means the enquiry is not lost.
    const [saved, emailed] = await Promise.allSettled([
      saveEnquiry(payload),
      sendNetlifyForm(payload)
    ])

    if (saved.status === 'rejected' && emailed.status === 'rejected') {
      console.error('Submission failed:', saved.reason, emailed.reason)
      btnSubmit.textContent = 'Send My Request'
      btnSubmit.disabled = false
      showError(saved.reason?.rateLimited)
      return
    }

    if (saved.status === 'rejected')   console.error('Save failed:', saved.reason)
    if (emailed.status === 'rejected') console.error('Email failed:', emailed.reason)

    step2.classList.remove('active')
    success.style.display = 'block'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  // If nothing got through, say so and give them the phone number rather
  // than pretending the enquiry was received.
  function showError(rateLimited) {
    let box = document.getElementById('submit-error')
    if (!box) {
      box = document.createElement('p')
      box.id = 'submit-error'
      box.className = 'submit-error'
      btnSubmit.insertAdjacentElement('afterend', box)
    }
    box.innerHTML = rateLimited
      ? 'That is a lot of requests in a short time. Please wait a minute and try ' +
        'again, or call us on <a href="tel:+447438031478">+44 743 803 1478</a>.'
      : 'Something went wrong sending your request. Please try again, or call us on ' +
        '<a href="tel:+447438031478">+44 743 803 1478</a>.'
    box.style.display = 'block'
  }

  function shake(el) {
    el.style.transition = 'transform 0.1s'
    el.style.transform = 'translateX(-6px)'
    setTimeout(() => { el.style.transform = 'translateX(6px)' },  100)
    setTimeout(() => { el.style.transform = 'translateX(-4px)' }, 200)
    setTimeout(() => { el.style.transform = 'translateX(0)' },    300)
  }
})
