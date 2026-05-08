// src/quote.js
// Quote form — 2-step flow with validation and submission

document.addEventListener('DOMContentLoaded', () => {
  // State
  const data = {
    name: '',
    phone: '',
    postcode: '',
    contact: '',
    service: '',
    message: ''
  }

  // Elements — Step 1
  const step1    = document.getElementById('step-1')
  const step2    = document.getElementById('step-2')
  const success  = document.getElementById('success')
  const btnStep1 = document.getElementById('btn-step1')
  const btnBack  = document.getElementById('btn-back')
  const btnSubmit= document.getElementById('btn-submit')
  const prog1    = document.getElementById('prog-1')
  const prog2    = document.getElementById('prog-2')

  // Contact method buttons — allow multiple selection
  document.querySelectorAll('.contact-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('selected')
    })
  })

  // Service buttons
  document.querySelectorAll('.service-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.service-btn').forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      data.service = btn.dataset.value
    })
  })

  // Step 1 → Step 2
  btnStep1.addEventListener('click', () => {
    data.name     = document.getElementById('name').value.trim()
    data.phone    = document.getElementById('phone').value.trim()
    data.email    = document.getElementById('email').value.trim()
    data.postcode = document.getElementById('postcode').value.trim().toUpperCase()

    if (!data.name) { shake(document.getElementById('name')); return }
    if (!data.phone) { shake(document.getElementById('phone')); return }
    if (!data.postcode) { shake(document.getElementById('postcode')); return }

    // Move to step 2
    step1.classList.remove('active')
    step2.classList.add('active')
    prog1.classList.remove('active')
    prog1.classList.add('done')
    prog2.classList.add('active')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  // Step 2 → Step 1
  btnBack.addEventListener('click', () => {
    step2.classList.remove('active')
    step1.classList.add('active')
    prog2.classList.remove('active')
    prog1.classList.remove('done')
    prog1.classList.add('active')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  // Submit
  btnSubmit.addEventListener('click', async () => {
    data.message = document.getElementById('message').value.trim()

    // Collect all selected contact methods
    const selectedMethods = [...document.querySelectorAll('.contact-btn.selected')]
      .map(b => b.dataset.value).join(', ') || 'Not specified'

    if (!data.service) {
      shake(document.querySelector('.services-grid'))
      return
    }

    btnSubmit.textContent = 'Sending...'
    btnSubmit.disabled = true

    try {
      const formData = new FormData()
      formData.append('form-name', 'quote')
      formData.append('name',     data.name)
      formData.append('phone',    data.phone)
      formData.append('email',    data.email || 'Not provided')
      formData.append('postcode', data.postcode)
      formData.append('contact',  selectedMethods)
      formData.append('service',  data.service)
      formData.append('message',  data.message)

      await fetch('/', {
        method: 'POST',
        body: formData
      })
    } catch (err) {
      console.error('Form error:', err)
    }

    // Show success regardless (don't punish user for network issues)
    step2.classList.remove('active')
    success.style.display = 'block'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  // Shake animation for validation feedback
  function shake(el) {
    el.style.transition = 'transform 0.1s'
    el.style.transform = 'translateX(-6px)'
    setTimeout(() => { el.style.transform = 'translateX(6px)' }, 100)
    setTimeout(() => { el.style.transform = 'translateX(-4px)' }, 200)
    setTimeout(() => { el.style.transform = 'translateX(0)' }, 300)
  }
})
