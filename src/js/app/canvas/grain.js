app.canvas.grain = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas,
    pattern = document.createElement('canvas'),
    patternContext = pattern.getContext('2d'),
    period = 1/8,
    scale = 1,
    size = 128,
    strength = 1/16 * 255

  const patternData = patternContext.createImageData(size, size),
    patternDataLength = 4 * (size ** 2)

  const zones = {
    surface: 0,
    sunlit: content.const.lightZone * 0.125,
    twilight: content.const.lightZone * 0.75,
    midnightFade: content.const.lightZone * 0.9,
    midnight: content.const.lightZone,
  }

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

    if (z <= zones.midnight || app.settings.computed.graphicsDarkModeOn) {
      return {r: 0, g: 0, b: 0}
    }

    let color = app.canvas.light.averageColor()

    if (z <= zones.midnightFade) {
      color.l *= engine.utility.scale(z, zones.midnightFade, zones.midnight, 1, 0)
    }

    color.l **= 0.5

    if (engine.utility.between(z, zones.twilight, zones.midnight)) {
      const ratio = engine.utility.scale(z, zones.twilight, zones.midnight, 0, 1)
      color.l = engine.utility.lerp(color.l, 0, ratio)
    }

    return app.utility.color.hslToRgb(color)
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
    draw: function () {
      timer += engine.loop.delta()

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
