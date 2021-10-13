app.canvas.tracers = (() => {
  const main = app.canvas

  let canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    empty,
    touched

  app.ready(() => {
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

  function swapCanvas() {
    // XXX: Prevents periodic GPU crashes when same canvas is reused for context.createPattern() each frame
    // Not sure why this problem exists or how this fixes it

    const previousCanvas = canvas

    canvas = document.createElement('canvas')
    canvas.height = previousCanvas.height
    canvas.width = previousCanvas.width

    context = canvas.getContext('2d')

    return previousCanvas
  }

  function update() {
    if (!shouldUpdate()) {
      clear()
      return
    }

    const height = main.height(),
      patternCanvas = swapCanvas(),
      width = main.width()

    context.fillStyle = context.createPattern(patternCanvas, 'no-repeat')
    context.globalAlpha = app.settings.computed.graphicsTracers
    context.fillRect(0, 0, width, height)
    context.globalAlpha = 1
  }

  return {
    canvas: () => canvas,
    clear: function () {
      clear()
      return this
    },
    context: () => context,
    draw: function () {
      main.context().drawImage(canvas, 0, 0)
      return this
    },
    prime: function () {
      if (app.settings.computed.graphicsTracers) {
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
