export function initNav() {
  const hamburger = document.getElementById('hamburger')
  const mobileNav = document.getElementById('mobile-nav')

  hamburger?.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open')
    hamburger.classList.toggle('open', isOpen)
  })

  mobileNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open')
      hamburger.classList.remove('open')
    })
  })
}
