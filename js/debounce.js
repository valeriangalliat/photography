export default function debounce (onEnd, rate, onStart) {
  if (typeof onEnd === 'object') {
    onEnd = onEnd.onEnd
    onStart = onEnd.onStart
  }

  let timer

  return (...args) => {
    clearTimeout(timer)

    if (!timer && onStart) {
      onStart(...args)
    }

    timer = setTimeout(() => {
      onEnd(args)
      timer = null
    }, rate)
  }
}
