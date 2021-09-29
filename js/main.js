/* eslint-env browser */

// More likely an emoji or a sequence of emoji.
if (document.title.codePointAt(0) > 100) {
  // Emojis can be made of multiple code points, and multiple emoji can be
  // combined to make a single displayed emoji, so using `Array.from` or
  // `codePointAt` is not an option.
  //
  // Without embedding a list of what code points are modifiers for other ones,
  // or using a library that does that, I can't tell if we have two separate
  // emojis side by side or if they're gonna be displayed as a single emoji.
  //
  // At that point I just assume that there's only one emoji and that the
  // following text will be separated with a space.
  const emoji = document.title.split(' ')[0]

  emojicon(emoji)

  document.title = document.title.substr(emoji.length + 1).trim()
} else {
  emojicon('📸')
}

if (document.body.classList.contains('photo')) {
  document.querySelector('.photo-container').scrollIntoView({ behavior: 'smooth' })
}
