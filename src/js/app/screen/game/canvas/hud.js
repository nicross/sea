app.screen.game.canvas.hud = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    fadeInRate = 4,
    fadeOutRate = 1,
    main = app.screen.game.canvas

  let opacity

  main.on('enter', () => {
    opacity = 1
  })

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    clear()
  })

  function calculateOpacity() {
    const scale = app.settings.computed.hudOpacity

    if (!scale) {
      return 0
    }

    const delta = engine.loop.delta(),
      isIdle = content.system.idle.is()

    if (isIdle && opacity > 0) {
      opacity = engine.utility.clamp(opacity - (delta * fadeOutRate))
    } else if (!isIdle && opacity < 1) {
      opacity = engine.utility.clamp(opacity + (delta * fadeInRate))
    }

    return opacity * scale
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawCompass() {}

  function drawDepth() {
    const z = engine.position.getVector().z

    if (z >= 0) {
      return
    }

    const alpha = engine.utility.clamp(engine.utility.scale(z, 0, content.const.lightZone, 0, 1)),
      depth = app.utility.format.number(-z),
      rem = app.utility.css.rem(),
      x = canvas.width - rem,
      y = canvas.height - rem

    context.fillStyle = `rgba(0, 0, 0, ${alpha})`
    context.font = `${2 * rem}px SuperSubmarine`
    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`
    context.textAlign = 'end'

    context.fillText(depth, x, y)
    context.strokeText(depth, x, y)
  }

  return {
    draw: function () {
      const opacity = calculateOpacity()

      if (!opacity) {
        return this
      }

      context.globalAlpha = opacity

      clear()
      drawCompass()
      drawDepth()

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
