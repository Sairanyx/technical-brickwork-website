import './style.css'
import { initNav }        from './components/nav.js'
import { initAnimations } from './components/animations.js'
import { initForm }       from './components/form.js'

document.addEventListener('DOMContentLoaded', () => {
  initNav()
  initAnimations()
  initForm()
})
