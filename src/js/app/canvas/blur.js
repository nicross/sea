app.canvas.blur = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas

  engine.ready(() => {
    engine.state.on('reset', onReset)
  })

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    clear()
  })

  function blur() {
    const height = main.height(),
      width = main.width()

    context.fillStyle = context.createPattern(canvas, 'no-repeat')
    clear()
    context.globalAlpha = app.settings.computed.graphicsMotionBlur
    context.fillRect(0, 0, width, height)
    context.globalAlpha = 1
  }

  function clear() {
    context.clearRect(0, 0, main.width(), main.height())
  }

  function onReset() {
    clear()
  }

  return {
    canvas: () => canvas,
    clear,
    context: () => context,
    draw: function () {
      main.context().drawImage(canvas, 0, 0)
      return this
    },
    prime: function () {
      if (app.settings.computed.graphicsMotionBlur) {
        blur()
      } else {
        clear()
      }

      return this
    },
  }
})()
