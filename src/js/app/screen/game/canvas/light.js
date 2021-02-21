app.screen.game.canvas.light = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.screen.game.canvas

  const zones = {
    surface: 0,
    sunlit: content.const.lightZone * 0.125,
    twilight: content.const.lightZone * 0.75,
    midnight: content.const.lightZone,
  }

  let scheme

  main.on('resize', () => {
    canvas.height = main.height()
    canvas.width = 1

    clear()
  })

  function calculateOpacity() {
    const {z} = engine.position.getVector()

    if (z > zones.twilight) {
      return 1
    }

    if (z < zones.midnight) {
      return 0
    }

    return engine.utility.scale(z, zones.twilight, zones.midnight, 1, 0)
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function calculateScheme() {
    const cycle = smooth(engine.utility.wrapAlternate(content.system.time.clock() * 2, 0, 1)) ** (1/3)

    return [
      app.utility.color.lerpHsl(
        {h: 240, s: 50, l: 20},
        {h: 240, s: 100, l: 85},
        cycle
      ),
      app.utility.color.lerpHsl(
        {h: 240, s: 25, l: 10},
        {h: 240, s: 100, l: 75},
        cycle
      ),
      app.utility.color.lerpHsl(
        {h: 240, s: 0, l: 0},
        {h: 240, s: 100, l: 9},
        cycle
      ),
    ]
  }

  function getGradient() {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    const {z} = engine.position.getVector()

    // Cache scheme between toGradientColor() calls
    scheme = calculateScheme()

    gradient.addColorStop(0, getGradientColorTop(z))
    gradient.addColorStop(1, getGradientColorBottom(z))

    return gradient
  }

  function getGradientColorBottom(z) {
    const pov = engine.utility.vector3d.unitX()
      .scale(app.settings.computed.drawDistance)
      .rotateEuler({pitch: main.vfov() / 2})
      .add({z})

    return toGradientColor(pov.z)
  }

  function getGradientColorTop(z) {
    const pov = engine.utility.vector3d.unitX()
      .scale(app.settings.computed.drawDistance)
      .rotateEuler({pitch: -main.vfov() / 2})
      .add({z})

    return toGradientColor(pov.z)
  }

  function smooth(value) {
    // 6x^5 - 15x^4 + 10x^3
    return (value ** 3) * (value * ((value * 6) - 15) + 10)
  }

  function toGradientColor(z) {
    if (z >= zones.surface) {
      return toHsl(scheme[0])
    }

    if (z <= zones.twilight) {
      return toHsl(scheme[2])
    }

    const color = z > zones.sunlit
      ? app.utility.color.lerpHsl(scheme[0], scheme[1], engine.utility.scale(z, zones.surface, zones.sunlit, 0, 1))
      : app.utility.color.lerpHsl(scheme[1], scheme[2], engine.utility.scale(z, zones.sunlit, zones.twilight, 0, 1))

    return toHsl(color)
  }

  function toHsl({
    h = 0,
    s = 0,
    l = 0,
  }) {
    return `hsl(${h}, ${s}%, ${l}%)`
  }

  return {
    draw: function () {
      const opacity = calculateOpacity()

      if (!opacity) {
        return this
      }

      clear()

      context.globalAlpha = opacity
      context.fillStyle = getGradient()
      context.fillRect(0, 0, canvas.width, canvas.height)

      // Draw to main canvas
      main.context().drawImage(canvas, 0, 0, main.width(), main.height())

      return this
    },
  }
})()
