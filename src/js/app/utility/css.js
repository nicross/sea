app.utility.css = (() => {
  let rem,
    vh,
    vw

  window.addEventListener('resize', onResize)
  onResize()

  function getFontSize(element) {
    return parseFloat(window.getComputedStyle(element).fontSize) || 0
  }

  function onResize() {
    rem = getFontSize(document.documentElement)
    vh = window.innerHeight / 100
    vw = window.innerWidth / 100
  }

  return {
    rem: (scalar = 1) => scalar * rem,
    vh: (scalar = 1) => scalar * vh,
    vw: (scalar = 1) => scalar * vw,
  }
})()
