app.canvas.hud = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    fadeInRate = 2,
    fadeOutRate = 1/4,
    main = app.canvas,
    pubsub = engine.utility.pubsub.create()

  let opacity

  engine.state.on('import', () => {
    opacity = content.idle.is() ? 0 : 1
  })

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    clear()
  })

  function calculateOpacity() {
    const scale = app.settings.computed.graphicsHudOpacity

    if (!scale) {
      return 0
    }

    const delta = engine.loop.delta(),
      isIdle = content.idle.is()

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

  return engine.utility.pubsub.decorate({
    draw: function () {
      const opacity = calculateOpacity()

      if (!opacity) {
        return this
      }

      context.globalAlpha = opacity

      clear()
      pubsub.emit('draw', {canvas, context})

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }, pubsub)
})()
