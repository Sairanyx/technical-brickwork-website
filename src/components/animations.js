export function initAnimations() {
  const els = document.querySelectorAll(
    '.service-card, .team-card, .why-point, .gallery-item, .stat, .contact-detail'
  )
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = [...entry.target.parentElement.children]
        entry.target.style.transitionDelay = `${siblings.indexOf(entry.target) * 60}ms`
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  els.forEach(el => { el.classList.add('reveal'); observer.observe(el) })
}
