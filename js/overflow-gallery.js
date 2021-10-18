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

// When there's pictures with different ratios, they're maxed to the
// container width and the height of the container automatically adjust
// as we scroll.
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

    // Because negative margin don't add together, they collapse, we need to
    // add the container's negative margin to the `<ul>` negative margin we set
    // later on so that we get the desired effect.
    const style = getComputedStyle(container)

    this.initialNegativeMarginTop = Math.min(style['margin-top'].replace('px', ''), 0)
    this.initialNegativeMarginBottom = Math.min(style['margin-bottom'].replace('px', ''), 0)

    this.onResize()

    ul.addEventListener('scroll', debounceAnimate(() => this.onScroll()))
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

    this.ul.style.marginTop = `${this.initialNegativeMarginTop + margin}px`
    this.ul.style.marginBottom = `${this.initialNegativeMarginBottom + margin}px`
  }

  onResize () {
    this.refreshHeights()
    this.onScroll()
  }

  onScroll () {
    this.updateMargin(this.computeHeightFromScroll())
  }
}

// When there's only portraits in a slider, display exactly two of them
// in a container width.
class PortraitMode {
  constructor (container, ul, slides) {
    this.container = container
    this.ul = ul
    this.imgs = container.querySelectorAll('img')
    this.onResize()
  }

  onResize () {
    const ratio = this.imgs[0].offsetHeight / this.imgs[0].offsetWidth
    const parentWidth = this.container.parentNode.offsetWidth
    const gap = Number(getComputedStyle(this.ul)['column-gap'].replace('px', ''))

    // Hack because the left and right padding of parent node is equal
    // to the gap and we need to exclude them. Find a better way some time.
    const height = ratio * ((parentWidth - (gap * 3)) / 2)

    for (const img of this.imgs) {
      img.style.maxHeight = `${height}px`
    }
  }
}

// When there's a mix of landscape and portraits, conform their heights
// to the smallest one for consistency.
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

    const offsetLeft = this.container.offsetLeft
    const offsetRight = document.body.offsetWidth - this.container.offsetLeft - this.container.offsetWidth

    this.container.style.marginLeft = `-${offsetLeft}px`
    this.container.style.marginRight = `-${offsetRight}px`

    this.slides[0].style.marginLeft = `${offsetLeft}px`
    this.slides[this.slides.length - 1].style.marginRight = `${offsetRight}px`
    this.ul.style.scrollPadding = `0 ${offsetRight}px 0 ${offsetLeft}px`
  }
}

export default function OverflowGallery (selector) {
  const instances = []

  for (const container of document.querySelectorAll(selector)) {
    const ul = container.querySelector('ul')
    const slides = Array.from(ul.querySelectorAll('li'))

    instances.push(new EscapeParent(container, ul, slides))

    const noPortrait = slides.every(slide => (slide.offsetWidth / slide.offsetHeight) > 1)
    const onlyPortrait = !noPortrait && slides.every(slide => (slide.offsetWidth / slide.offsetHeight) < 1)

    if (noPortrait) {
      instances.push(new DynamicHeight(container, ul, slides))
    } else if (onlyPortrait) {
      instances.push(new PortraitMode(container, ul, slides))
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
