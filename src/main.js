import './style.css'
import { initNav }         from './components/nav.js'
import { initAnimations }  from './components/animations.js'
import { initForm }        from './components/form.js'
import { initTransitions } from './components/transitions.js'

// The inline <head> style holds the body hidden until style.css has been
// applied, so the page is never painted unstyled.
document.documentElement.classList.add('css-ready')

initTransitions()

document.addEventListener('DOMContentLoaded', () => {
  initNav()
  initAnimations()
  initForm()

  const year = document.getElementById('footer-year')
  if (year) year.textContent = new Date().getFullYear()
})
