// src/components/transitions.js
// Cross-page fade. Uses the View Transitions API where the browser supports it
// (Chrome, Edge), and falls back to a short fade-out before navigating so
// Firefox and Safari get the same feel.

const FADE_MS = 220

function isPlainLeftClick(e) {
  return !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0
}

// Only intercept links that stay on this site and actually load a new document.
function isInternalNavigation(link) {
  if (!link) return false
  if (link.target && link.target !== '_self') return false
  if (link.hasAttribute('download')) return false

  const href = link.getAttribute('href')
  if (!href) return false
  if (href.startsWith('#')) return false
  if (/^(mailto:|tel:|https?:)/i.test(href) && link.origin !== location.origin) return false

  // Same-page anchors (e.g. "/#contact" while already on "/") scroll instead.
  const url = new URL(link.href, location.href)
  if (url.pathname === location.pathname && url.hash) return false

  return url.origin === location.origin
}

export function initTransitions() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) return

  // Each page's inline <head> style holds the body hidden until its stylesheet
  // has been applied, so there is no entry class to add here. Coming back via
  // the bfcache restores the document mid-exit, so clear that state.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      document.documentElement.classList.remove('page-exit')
      document.documentElement.classList.add('css-ready')
    }
  })

  document.addEventListener('click', (e) => {
    if (!isPlainLeftClick(e)) return

    const link = e.target.closest('a')
    if (!isInternalNavigation(link)) return

    // Chrome/Edge: let the browser cross-fade the two documents itself.
    if (document.startViewTransition) return

    e.preventDefault()
    document.documentElement.classList.add('page-exit')
    setTimeout(() => { location.href = link.href }, FADE_MS)
  })
}
