import smoothscroll from 'smoothscroll-polyfill'
import './emojicon.js'
import { MouseSwipe, SnapMouseSwipe } from './mouse-swipe.js'
import OverflowGallery from './overflow-gallery.js'
import debounce from './debounce.js'

smoothscroll.polyfill()

if (document.documentElement.classList.contains('photo')) {
  document.querySelector('.photo-container').scrollIntoView({ behavior: 'smooth' })
  MouseSwipe('.photo-container')
}

addEventListener('load', () => {
  // Need to init `MouseSwipe` first because it will disable the
  // scrollbar which will affect the dynamic height for `OverflowGallery`.
  const mouseSwipe = SnapMouseSwipe('.slide ul')
  const overflowGallery = OverflowGallery('.slide')

  addEventListener('resize', debounce(e => {
    // Need to resize `OverflowGallery` first because it will affect the
    // height of the pictures which in turn will affect the cached scroll
    // positions for `MouseSwipe` to work well.
    overflowGallery.onResize()
    mouseSwipe.onResize()
  }, 200))
})

const isBrowserDark = matchMedia && matchMedia('(prefers-color-scheme: dark)').matches

for (const button of Array.from(document.querySelectorAll('.change-color-theme'))) {
  if (document.documentElement.classList.contains('dark')) {
    button.textContent = '🌞'
  }

  button.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      button.textContent = '🌝'
      localStorage.theme = 'light'
    } else {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
      button.textContent = '🌞'
      localStorage.theme = 'dark'
    }
  })
}
