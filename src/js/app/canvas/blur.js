app.canvas.blur = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas

  let empty,
    touched

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

  function clear() {
    context.clearRect(0, 0, main.width(), main.height())
  }

  function onReset() {
    clear()
  }

  function shouldUpdate() {
    // Always update when touched
    if (touched) {
      empty = false
      return true
    }

    // Never update when proven empty
    if (empty) {
      return false
    }

    // Test pixel data for changes
    const image = context.getImageData(0, 0, main.width(), main.height())

    const data = image.data,
      length = data.length,
      threshold = 4

    // XXX: When globalAlpha is used, it rounds floats (rather than truncate), e.g. 4 * 0.9 -> 4
    // This leads to transparent pixels still on the screen when they should fade out
    // (threshold = 4) will abruptly clear them when nothing else is drawn
    // The easiest fix is with putImageData() for a linear fade, but comes with a huge performance hit

    for (let i = 3; i < length; i += 4) {
      if (data[i] > threshold) {
        empty = false
        return true
      }
    }

    empty = true
    return false
  }

  function update() {
    if (!shouldUpdate()) {
      clear()
      return
    }

    const height = main.height(),
      width = main.width()

    context.fillStyle = context.createPattern(canvas, 'no-repeat')
    clear()
    context.globalAlpha = app.settings.computed.graphicsMotionBlur
    context.fillRect(0, 0, width, height)
    context.globalAlpha = 1
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
        update()
      } else {
        clear()
      }

      touched = false

      return this
    },
    touch: function () {
      touched = true
      return this
    },
  }
})()
