app.screen.game.canvas.hud = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    hudAlpha = 0.5,
    main = app.screen.game.canvas

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    clear()
  })

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawCompass() {}

  function drawDepth() {
    const z = engine.position.getVector().z

    if (z >= 0) {
      return
    }

    const alpha = engine.utility.clamp(engine.utility.scale(z, 0, content.const.lightZone, 0, 1)) * hudAlpha,
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
      const mainContext = main.context()

      clear()
      drawCompass()
      drawDepth()

      // Draw to main canvas, assume identical dimensions
      mainContext.drawImage(canvas, 0, 0)

      return this
    },
  }
})()
