// Emoji
if (document.title.codePointAt(0) !== document.title.charCodeAt(0)) {
  const emoji = String.fromCodePoint(document.title.codePointAt(0))
  const canvas = document.createElement('canvas')

  canvas.height = 64
  canvas.width = 64

  const ctx = canvas.getContext('2d')
  ctx.font = '64px serif';
  ctx.fillText(emoji, 0, 64)

  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.href = canvas.toDataURL()

  document.head.appendChild(favicon)
  document.title = document.title.substr(emoji.length + 1).trim()
}

if (location.href.endsWith('-Pano.html')) {
  const a = document.querySelector('a')
  const img = new Image()

  img.src = a.style.backgroundImage.slice(5, -2)

  img.addEventListener('load', () => {
    a.style.width = `${img.width / img.height * innerHeight}px`
  })
}
