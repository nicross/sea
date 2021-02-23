app.screen.game.canvas.surface = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.screen.game.canvas

  let drawDistance,
    nodeRadius

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    drawDistance = app.settings.computed.drawDistance ** 0.5
    nodeRadius = Math.max(1, (width / 1920) * 3)

    clear()
  })

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawNodes() {
    const color = getColor(),
      height = main.height(),
      hfov = main.hfov(),
      position = engine.position.getVector(),
      vfov = main.vfov(),
      width = main.width(),
      zOffset = engine.const.positionRadius / 2

    position.x = Math.round(position.x)
    position.y = Math.round(position.y)

    // TODO: Optimize as rectangle ahead
    for (let x = -drawDistance; x < drawDistance; x += 1) {
      for (let y = -drawDistance; y < drawDistance; y += 1) {
        const grid = position.add({x, y}),
          relative = main.toRelative(grid)

        const hangle = Math.atan2(relative.y, relative.x)

        if (Math.abs(hangle) > hfov / 2) {
          continue
        }

        relative.z = content.system.surface.height(grid.x, grid.y) - (position.z + zOffset)

        const vangle = Math.atan2(relative.z, relative.x)

        if (Math.abs(vangle) > vfov / 2) {
          continue
        }

        const distance = relative.distance()

        if (distance > drawDistance) {
          continue
        }

        const screen = engine.utility.vector2d.create({
          x: (width / 2) - (width * hangle / hfov),
          y: (height / 2) - (height * vangle / vfov),
        })

        const distanceRatio = engine.utility.scale(distance, 0, drawDistance, 1, 0)

        const alpha = engine.utility.clamp(distanceRatio ** 0.5, 0.5, 1),
          radius = engine.utility.lerpExp(1, nodeRadius, distanceRatio, 6)

        context.fillStyle = `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`
        context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
      }
    }
  }

  function getColor() {
    const clock = content.system.time.clock(),
      cycle = engine.utility.wrapAlternate(clock * 2)

    const color = app.utility.color.lerpHsl(
      app.screen.game.canvas.celestials.moonColor(),
      app.screen.game.canvas.celestials.sunColor(),
      smooth(cycle)
    )

    if (cycle <= 0.5) {
      color.l *= engine.utility.scale(cycle, 0, 0.5, 0.75, 1) ** 2
    }

    // Optimization: pre-calculate scaled literal values
    color.h *= 360
    color.s *= 100
    color.l *= 100

    return color
  }

  function shouldDraw() {
    const {z} = engine.position.getVector()

    if (z < content.const.lightZone) {
      return false
    }

    const surface = content.system.surface.currentHeight()

    if (z > surface) {
      return z - surface < drawDistance
    }

    return -z + surface < drawDistance
  }

  function smooth(value) {
    // generalized logistic function
    // identical to light
    return 1 / (1 + (Math.E ** (-25 * (value - 0.5))))
  }

  return {
    draw: function () {
      if (!shouldDraw()) {
        return this
      }

      // TODO: Respect motion blur setting
      clear()
      drawNodes()

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
