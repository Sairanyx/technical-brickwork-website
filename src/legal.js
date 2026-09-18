// src/legal.js
// Entry point for the privacy, cookie and terms pages.

import './legal.css'
import { renderFooter }    from './components/footer.js'
import { initTransitions } from './components/transitions.js'

// The inline <style> in each page's <head> holds the body hidden until this
// runs, so the page is never painted before legal.css has been applied.
document.documentElement.classList.add('css-ready')

initTransitions()

function ready() {
  renderFooter(document.getElementById('site-footer'))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready)
} else {
  ready()
}
