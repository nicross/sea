app.debug.canvas = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas,
    pubsub = engine.utility.pubsub.create()

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

  return engine.utility.pubsub.decorate({
    draw: function () {
      clear()
      pubsub.emit('draw', {canvas, context})

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }, pubsub)
})()
