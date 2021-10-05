import * as scrollSnap from 'scroll-snap-api'

function debounceAnimate (f) {
  let scheduled = false

  return () => {
    if (scheduled) {
      return
    }

    scheduled = true

    requestAnimationFrame(() => {
      scheduled = false
      f()
    })
  }
}

class DynamicHeight {
  constructor (container, ul, slides) {
    this.container = container
    this.ul = ul
    this.slides = slides
    this.imgs = container.querySelectorAll('img')

    for (const img of this.imgs) {
      img.style.maxHeight = 'unset'
    }

    if (!this.needsAdaptiveHeight()) {
      return
    }

    const style = getComputedStyle(container)

    this.initialMarginTop = Number(style['margin-top'].replace('px', ''))
    this.initialMarginBottom = Number(style['margin-bottom'].replace('px', ''))

    this.onResize()

    ul.addEventListener('scroll', debounceAnimate(() => this.onScroll()))
  }

  static compatible (slides) {
    return slides.every(slide => (slide.offsetWidth / slide.offsetHeight) > 1)
  }

  needsAdaptiveHeight () {
    const ratio = (this.slides[0].offsetWidth / this.slides[0].offsetHeight).toFixed(1)
    return this.slides.slice(1).some(slide => (slide.offsetWidth / slide.offsetHeight).toFixed(1) !== ratio)
  }

  refreshHeights () {
    this.heights = []

    const snapPositions = scrollSnap.getScrollSnapPositions(this.ul).x

    for (const [i, slide] of this.slides.entries()) {
      this.heights.push({
        left: snapPositions[i],
        height: slide.offsetHeight
      })
    }
  }

  computeHeightFromScroll () {
    const scroll = this.ul.scrollLeft
    const match = this.heights.find(({ left }) => left > scroll) || this.heights[this.heights.length - 1]
    const prev = this.heights[this.heights.indexOf(match) - 1] || this.heights[0]

    if (match.height === prev.height) {
      return match.height
    }

    const ratio = (scroll - prev.left) / (match.left - prev.left)

    return prev.height + (ratio * (match.height - prev.height))
  }

  updateMargin (height) {
    const margin = -1 * (this.container.offsetHeight - height) / 2

    this.container.style.marginTop = `${this.initialMarginTop + margin}px`
    this.container.style.marginBottom = `${this.initialMarginBottom + margin}px`
  }

  onResize () {
    this.refreshHeights()
    this.onScroll()
  }

  onScroll () {
    this.updateMargin(this.computeHeightFromScroll())
  }
}

class MatchingHeight {
  constructor (container, ul, slides) {
    this.imgs = container.querySelectorAll('img')
    this.onResize()
  }

  onResize () {
    for (const img of this.imgs) {
      img.style.maxHeight = 'unset'
    }

    let minHeight = Infinity

    for (const img of this.imgs) {
      minHeight = Math.min(minHeight, img.offsetHeight)
    }

    for (const img of this.imgs) {
      img.style.maxHeight = `${minHeight}px`
    }
  }
}

class EscapeParent {
  constructor (container, ul, slides) {
    this.container = container
    this.ul = ul
    this.slides = slides

    this.onResize()
  }

  onResize () {
    this.container.style.marginLeft = ''

    const escapeParentMargin = `${this.container.offsetLeft}px`

    this.container.style.marginLeft = `-${escapeParentMargin}`
    this.container.style.marginRight = `-${escapeParentMargin}`

    this.slides[0].style.marginLeft = escapeParentMargin
    this.slides[this.slides.length - 1].style.marginRight = escapeParentMargin
    this.ul.style.scrollPadding = `0 ${escapeParentMargin}`
  }
}

export default function OverflowGallery (selector) {
  const instances = []

  for (const container of document.querySelectorAll(selector)) {
    const ul = container.querySelector('ul')
    const slides = Array.from(ul.querySelectorAll('li'))

    instances.push(new EscapeParent(container, ul, slides))

    if (DynamicHeight.compatible(slides)) {
      instances.push(new DynamicHeight(container, ul, slides))
    } else {
      instances.push(new MatchingHeight(container, ul, slides))
    }
  }

  return {
    onResize () {
      for (const instance of instances) {
        instance.onResize()
      }
    }
  }
}
