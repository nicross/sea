app.canvas.light = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    horizonDistance = 1000,
    main = app.canvas

  const zones = {
    surface: 0,
    sunlit: content.const.lightZone * 0.125,
    twilight: content.const.lightZone * 0.75,
    midnight: content.const.lightZone,
  }

  let averageColor,
    scheme

  main.on('resize', () => {
    canvas.height = main.height()
    canvas.width = main.width()

    clear()
  })

  function calculateOpacity() {
    const {z} = engine.position.getVector()

    if (z > zones.twilight) {
      return app.settings.computed.graphicsDarkModeOn
       ? app.settings.computed.graphicsBacklightStrength
       : 1
    }

    if (z < zones.midnight) {
      return 0
    }

    const value = engine.utility.scale(z, zones.twilight, zones.midnight, 1, 0)

    return app.settings.computed.graphicsDarkModeOn
     ? value * app.settings.computed.graphicsBacklightStrength
     : value
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function calculateScheme() {
    const clock = content.time.clock(),
      cycle = smooth(engine.utility.wrapAlternate(clock * 2, 0, 1)) ** (1/3),
      hue = engine.utility.lerp(330/360, 240/360, smooth(Math.abs(Math.cos(Math.PI * 2 * clock)) ** 0.5)),
      hueHalf = engine.utility.lerp(hue, 240/360, 0.5)

    return [
      app.utility.color.lerpHsl(
        {h: hue, s: 0.666, l: 0.125},
        {h: hue, s: 1, l: 0.80},
        cycle
      ),
      app.utility.color.lerpHsl(
        {h: hueHalf, s: 0.333, l: 0.0625},
        {h: hueHalf, s: 1, l: 0.70},
        cycle
      ),
      app.utility.color.lerpHsl(
        {h: 240/360, s: 0, l: 0},
        {h: 240/360, s: 1, l: 0.10},
        cycle
      ),
    ]
  }

  function getGradient() {
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    const {z} = engine.position.getVector()

    // Cache scheme between toGradientColor() calls
    scheme = calculateScheme()

    const bottom = getGradientColorBottom(z),
      top = getGradientColorTop(z)

    // Cache averageColor
    averageColor = app.utility.color.lerpHsl(top, bottom, 0.5)

    if (app.settings.computed.graphicsDarkModeOn) {
      gradient.addColorStop(0.5, toHsla({...averageColor, a: 0}))
      gradient.addColorStop(1 - (2 / canvas.height), toHsla({...averageColor, a: 1/8}))
      gradient.addColorStop(1, toHsla({...averageColor, a: 1/4}))
    } else {
      gradient.addColorStop(0, toHsla(top))
      gradient.addColorStop(1, toHsla(bottom))
    }

    return gradient
  }

  function getGradientColorBottom(z) {
    const pov = engine.utility.vector3d.unitX()
      .scale(horizonDistance)
      .rotateEuler({pitch: main.vfov() / 2})
      .add({z})

    return toGradientColor(pov.z)
  }

  function getGradientColorTop(z) {
    const pov = engine.utility.vector3d.unitX()
      .scale(horizonDistance)
      .rotateEuler({pitch: -main.vfov() / 2})
      .add({z})

    return toGradientColor(pov.z)
  }

  function smooth(value) {
    // generalized logistic function
    // identical to surface
    return 1 / (1 + (Math.E ** (-25 * (value - 0.5))))
  }

  function toGradientColor(z) {
    if (z >= zones.surface) {
      return scheme[0]
    }

    if (z <= zones.twilight) {
      return scheme[2]
    }

    return z > zones.sunlit
      ? app.utility.color.lerpHsl(scheme[0], scheme[1], engine.utility.scale(z, zones.surface, zones.sunlit, 0, 1))
      : app.utility.color.lerpHsl(scheme[1], scheme[2], engine.utility.scale(z, zones.sunlit, zones.twilight, 0, 1))
  }

  function toHsla({
    h = 0,
    s = 0,
    l = 0,
    a = 1,
  }) {
    return `hsla(${h * 360}, ${s * 100}%, ${l * 100}%, ${a})`
  }

  return {
    averageColor: () => ({...averageColor}),
    draw: function () {
      if (app.settings.computed.graphicsDarkModeOn && !app.settings.computed.graphicsBacklightStrength) {
        return this
      }

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
