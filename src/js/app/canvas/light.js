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
    const clock = content.time.clock(),
      cycle = smooth(engine.utility.wrapAlternate(clock * 2, 0, 1)) ** (1/3),
      hue = engine.utility.lerp(330/360, 240/360, smooth(Math.abs(Math.cos(Math.PI * 2 * clock)) ** 0.5)),
      hueHalf = engine.utility.lerp(hue, 240/360, 0.5)

    return [
      app.utility.color.lerpHsl(
        {h: hue, s: 0.5, l: 0.20},
        {h: hue, s: 1, l: 0.80},
        cycle
      ),
      app.utility.color.lerpHsl(
        {h: hueHalf, s: 0.25, l: 0.10},
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

    gradient.addColorStop(0, toHsl(top))
    gradient.addColorStop(1, toHsl(bottom))

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

    const color = z > zones.sunlit
      ? app.utility.color.lerpHsl(scheme[0], scheme[1], engine.utility.scale(z, zones.surface, zones.sunlit, 0, 1))
      : app.utility.color.lerpHsl(scheme[1], scheme[2], engine.utility.scale(z, zones.sunlit, zones.twilight, 0, 1))

    return color
  }

  function toHsl({
    h = 0,
    s = 0,
    l = 0,
  }) {
    return `hsl(${h * 360}, ${s * 100}%, ${l * 100}%)`
  }

  return {
    averageColor: () => ({...averageColor}),
    draw: function () {
      if (app.settings.computed.graphicsDarkModeOn) {
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
