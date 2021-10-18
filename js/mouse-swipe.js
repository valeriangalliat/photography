import * as scrollSnap from 'scroll-snap-api'
import debounce from './debounce.js'

let globalActiveSwipe

function addGlobalEventsOnce () {
  if (addGlobalEventsOnce.added) {
    return
  }

  addEventListener('mousemove', e => {
    if (globalActiveSwipe) {
      globalActiveSwipe.onMouseMove(e)
    }
  })

  addEventListener('mouseup', e => {
    if (globalActiveSwipe) {
      globalActiveSwipe.onMouseUp(e)
    }
  })
}

class MouseSwipeImpl {
  constructor (el) {
    this.el = el

    addGlobalEventsOnce()

    el.addEventListener('mousedown', e => this.onMouseDown(e))
    el.addEventListener('click', e => this.onClick(e))
  }

  onMouseDown (e) {
    if (e.button !== 0) {
      return
    }

    e.preventDefault()

    globalActiveSwipe = this

    this.startX = e.clientX
    this.initialScrollLeft = this.el.scrollLeft
  }

  onMouseMove (e) {
    this.el.scrollLeft = this.initialScrollLeft + (this.startX - e.clientX)
  }

  onMouseUp (e) {
    globalActiveSwipe = null
  }

  onResize () {}

  onClick (e) {
    if (this.isSwipe(e)) {
      e.preventDefault()
    }
  }

  isSwipe (e) {
    const { startX } = this
    const endX = e.clientX

    // Moved enough to consider this a swipe?
    return Math.abs(startX - endX) > 5
  }
}

class SnapMouseSwipeImpl extends MouseSwipeImpl {
  constructor (el) {
    super(el)

    el.addEventListener('scroll', debounce(() => this.onScrollEnd(), 100))

    this.el.classList.add('loaded')
    this.el.style.scrollBehavior = 'unset'
  }

  onMouseDown (e) {
    super.onMouseDown(e)

    if (e.button !== 0) {
      return
    }

    this.el.style.scrollSnapType = 'unset'
    this.el.style.scrollBehavior = 'unset'
  }

  onMouseUp (e) {
    super.onMouseUp(e)

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
}

export function MouseSwipe (selector, Instance = MouseSwipeImpl) {
  const instances = []

  for (const el of document.querySelectorAll(selector)) {
    instances.push(new Instance(el))
  }

  return {
    onResize () {
      for (const instance of instances) {
        instance.onResize()
      }
    }
  }
}

export function SnapMouseSwipe (selector) {
  return MouseSwipe(selector, SnapMouseSwipeImpl)
}
