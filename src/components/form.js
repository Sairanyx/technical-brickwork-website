export function initForm() {
  const form = document.getElementById('contact-form')
  const msg  = document.getElementById('form-success')
  if (!form) return

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const btn = form.querySelector('button[type="submit"]')
    btn.textContent = 'Sending...'
    btn.disabled = true
    await new Promise(r => setTimeout(r, 800))
    form.reset()
    btn.textContent = 'Send Enquiry'
    btn.disabled = false
    msg.style.display = 'block'
    setTimeout(() => { msg.style.display = 'none' }, 5000)
  })
}
