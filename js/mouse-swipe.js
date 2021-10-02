import * as scrollSnap from 'scroll-snap-api'
import debounce from './debounce.js'

function addGlobalEventsOnce () {
  if (addGlobalEventsOnce.added) {
    return
  }

  addEventListener('mousemove', e => {
    if (MouseSwipe.activeSwipe) {
      MouseSwipe.activeSwipe.onMouseMove(e)
    }
  })

  addEventListener('mouseup', e => {
    if (MouseSwipe.activeSwipe) {
      MouseSwipe.activeSwipe.onMouseUp(e)
    }
  })
}

class MouseSwipeImpl {
  constructor (el) {
    this.el = el

    addGlobalEventsOnce()

    el.addEventListener('mousedown', e => this.onMouseDown(e))
    el.addEventListener('click', e => this.onClick(e))
    el.addEventListener('scroll', debounce(() => this.onScrollEnd(), 100))

    this.el.classList.add('loaded')
    this.el.style.scrollBehavior = 'unset'
  }

  onMouseDown (e) {
    if (e.button !== 0) {
      return
    }

    e.preventDefault()

    MouseSwipe.activeSwipe = this

    this.el.style.scrollSnapType = 'unset'
    this.el.style.scrollBehavior = 'unset'

    this.startX = e.clientX
    this.initialScrollLeft = this.el.scrollLeft
  }

  onMouseMove (e) {
    const diff = this.startX - e.clientX

    this.el.scrollLeft = this.initialScrollLeft + diff
  }

  onMouseUp (e) {
    MouseSwipe.activeSwipe = null

    this.el.style.scrollBehavior = ''

    if (!this.isSwipe(e)) {
      return
    }

    if (!this.snapPositions) {
      this.onResize()
    }

    // Call the `scroll` method instead of assigning the `scrollLeft`
    // property so that it works with the smooth scroll polyfill for
    // Safari and others that don't support native smooth scroll.
    if (e.clientX < this.startX) {
      this.el.scroll({
        left: this.snapPositions.find(x => x > this.el.scrollLeft) || this.lastSnap,
        behavior: 'smooth'
      })
    } else {
      this.el.scroll({
        left: this.reversedSnapPositions.find(x => x < this.el.scrollLeft),
        behavior: 'smooth'
      })
    }
  }

  onClick (e) {
    if (this.isSwipe(e)) {
      e.preventDefault()
    }
  }

  onResize () {
    this.snapPositions = scrollSnap.getScrollSnapPositions(this.el).x.map(x => Math.round(x))
    this.lastSnap = this.snapPositions[this.snapPositions.length - 1]
    this.reversedSnapPositions = this.snapPositions.slice().reverse()
  }

  onScrollEnd () {
    // Reset `scroll-snap-type` is done only after scroll to prevent
    // visual glitch on Chrome who otherwise instantly jumps the scroll
    // back to closest position.
    this.el.style.scrollSnapType = ''
  }

  isSwipe (e) {
    const { startX } = this
    const endX = e.clientX

    // Moved enough to consider this a swipe?
    return Math.abs(startX - endX) > 5
  }
}

export default function MouseSwipe (selector) {
  const instances = []

  for (const el of document.querySelectorAll(selector)) {
    instances.push(new MouseSwipeImpl(el))
  }

  return {
    onResize () {
      for (const instance of instances) {
        instance.onResize()
      }
    }
  }
}
