app.screen.game.canvas.light = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.screen.game.canvas

  main.on('resize', () => {
    canvas.height = main.height()
    canvas.width = 1

    clear()
  })

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function getGradient() {
    const {z} = engine.position.getVector()

    const stop0 = calculateTopColor(z),
      stop1 = calculateBottomColor(z)

    if (stop0 == stop1) {
      return false
    }

    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)

    gradient.addColorStop(0, stop0)
    gradient.addColorStop(1, stop1)

    return gradient
  }

  function calculateBottomColor(z) {
    const pov = engine.utility.vector3d.create({x: 1})
      .scale(app.settings.computed.drawDistance)
      .rotateEuler({pitch: main.vfov() / 2})
      .add({z})

    return toColor(pov.z)
  }

  function calculateTopColor(z) {
    const pov = engine.utility.vector3d.create({x: 1})
      .scale(app.settings.computed.drawDistance)
      .rotateEuler({pitch: -main.vfov() / 2})
      .add({z})

    return toColor(pov.z)
  }

  function toColor(z) {
    if (z >= 0) {
      return 'hsla(240, 100%, 88%, 1)'
    }

    if (z <= content.const.lightZone) {
      return 'hsla(240, 100%, 9%, 0)'
    }

    const stop1 = content.const.lightZone * 0.1,
      stop2 = content.const.lightZone * 0.8

    const l = z > stop1
      ? engine.utility.scale(z, 0, stop1, 88, 75)
      : engine.utility.scale(Math.max(z, stop2), stop1, stop2, 75, 9)

    const a = z > stop2
      ? 1
      : engine.utility.scale(z, stop2, content.const.lightZone, 1, 0) ** 0.5

    return `hsla(240, 100%, ${l}%, ${a})`
  }

  return {
    draw: function () {
      const gradient = getGradient()

      if (gradient) {
        clear()

        context.fillStyle = gradient
        context.fillRect(0, 0, canvas.width, canvas.height)

        // Draw to main canvas
        main.context().drawImage(canvas, 0, 0, main.width(), main.height())
      }

      return this
    },
  }
})()
