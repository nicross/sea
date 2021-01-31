app.screen.game.canvas.grain = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.screen.game.canvas,
    pattern = document.createElement('canvas'),
    patternContext = pattern.getContext('2d'),
    period = 1/8,
    scale = 1,
    size = 128,
    strength = 1/8 * 255

  const patternData = patternContext.createImageData(size, size),
    patternDataLength = 4 * (size ** 2)

  let timer = 0

  context.scale(scale, scale)
  pattern.height = size
  pattern.width = size

  main.on('resize', () => {
    canvas.height = main.height()
    canvas.width = main.width()
  })

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function getColor() {
    const {z} = engine.position.getVector()

    if (z >= 0) {
      return {r: 204, g: 204, b: 255}
    }

    if (z <= content.const.lightZone) {
      return {r: 0, g: 0, b: 0}
    }

    return app.utility.color.hslToRgb({
      h: 240/360,
      s: 1,
      l: engine.utility.scale(z, 0, content.const.lightZone, 0.9, 0),
    })
  }

  function update() {
    const color = getColor()

    for (let i = 0; i < patternDataLength; i += 4) {
      patternData.data[i] = color.r
      patternData.data[i + 1] = color.g
      patternData.data[i + 2] = color.b
      patternData.data[i + 3] = engine.utility.random.integer(0, strength)
    }

    clear()
    patternContext.putImageData(patternData, 0, 0)

    context.fillStyle = context.createPattern(pattern, 'repeat')
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  return {
    draw: function ({delta}) {
      timer += delta

      if (timer >= period) {
        timer = 0
        update()
      }

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
