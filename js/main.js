// More likely an emoji
if (document.title.codePointAt(0) > 100) {
  const emoji = String.fromCodePoint(document.title.codePointAt(0))
  const canvas = document.createElement('canvas')

  canvas.height = 64
  canvas.width = 64

  const ctx = canvas.getContext('2d')
  ctx.font = '64px ' + getComputedStyle(document.body).fontFamily;
  ctx.fillText(emoji, 0, 64)

  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.href = canvas.toDataURL()

  document.head.appendChild(favicon)
  document.title = document.title.substr(emoji.length + 1).trim()
}

if (document.body.classList.contains('photo')) {
  const a = document.querySelector('a')
  const img = new Image()

  img.src = a.style.backgroundImage.slice(5, -2)

  function onResize () {
    const imgRatio = img.width / img.height

    // Panorama
    if (imgRatio > 16 / 9) {
      a.style.width = `${img.width / img.height * document.documentElement.clientHeight}px`
    }
  }

  img.addEventListener('load', onResize)
  addEventListener('resize', onResize)
}
