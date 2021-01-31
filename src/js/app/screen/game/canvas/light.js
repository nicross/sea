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

  function getGradient() {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    const {z} = engine.position.getVector()

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

  function toGradientColor(z) {
    if (z >= zones.surface) {
      return 'hsl(240, 100%, 88%)'
    }

    if (z <= zones.twilight) {
      return 'hsl(240, 100%, 9%)'
    }

    const l = z > zones.sunlit
      ? engine.utility.scale(z, zones.surface, zones.sunlit, 88, 75)
      : engine.utility.scale(z, zones.sunlit, zones.twilight, 75, 9)

    return `hsl(240, 100%, ${l}%)`
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
