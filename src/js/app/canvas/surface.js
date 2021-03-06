app.canvas.surface = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas,
    shimmerField = engine.utility.perlin3d.create('shimmer'),
    shimmerScaleX = 2,
    shimmerScaleY = 2,
    shimmerScaleZ = 0.5

  let drawDistance,
    nodeRadius

  content.utility.ephemeralNoise.manage(shimmerField)

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    drawDistance = Math.round(engine.utility.lerpExp(5, 35, app.settings.raw.drawDistance, 0.9275))
    nodeRadius = Math.max(1, (width / 1920) * 8)

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
      time = content.time.value(),
      vfov = main.vfov(),
      width = main.width(),
      zOffset = engine.const.positionRadius / 2

    position.x = Math.round(position.x)
    position.y = Math.round(position.y)

    // TODO: Optimize as rectangle ahead
    for (let x = -drawDistance; x < drawDistance; x += 1) {
      for (let y = -drawDistance; y < drawDistance; y += 1) {
        // Convert to relative space
        const grid = position.add({x, y}),
          relative = main.toRelative(grid)

        // Filter out nodes behind field of view
        if (relative.x <= 0) {
          continue
        }

        const hangle = Math.atan2(relative.y, relative.x)

        // Filter out nodes beyond horizontal field of view (with leeway)
        if (Math.abs(hangle) > hfov / 1.95) {
          continue
        }

        // Filter out nodes too distant to see
        if (relative.distance() > drawDistance) {
          continue
        }

        // Calculate z-coordinate and vertical angle
        relative.z = content.surface.value(grid.x, grid.y) - (position.z + zOffset)

        const vangle = Math.atan2(relative.z, relative.x)

        // Filter out nodes beyond vertical field of view (with leeway)
        if (Math.abs(vangle) > vfov / 1.95) {
          continue
        }

        // Calculate true distance with known z-coordinate
        const distance = relative.distance()

        // Filter out nodes too distant to see
        if (distance > drawDistance) {
          continue
        }

        // Calculate position in screen space
        const screen = engine.utility.vector2d.create({
          x: (width / 2) - (width * hangle / hfov),
          y: (height / 2) - (height * vangle / vfov),
        })

        // Calculate properties
        const alphaRatio = engine.utility.scale(distance, 0, drawDistance, 1, 0),
          radiusRatio = engine.utility.scale(distance, 0, 35, 1, 0), // max drawDistance
          radius = engine.utility.lerpExp(1, nodeRadius, radiusRatio, 12),
          shimmer = getShimmer(grid.x, grid.y, time)

        // Apply shimmer to color
        const alpha = engine.utility.clamp(color.a * engine.utility.lerp(0.5, 1.5, shimmer), 0, 1) * (alphaRatio ** 0.666),
          luminance = engine.utility.clamp(color.l * engine.utility.lerp(1.5, 0.5, shimmer), 0, 1)

        // Draw
        context.fillStyle = `hsla(${color.h}, ${color.s}%, ${luminance * 100}%, ${alpha})`
        context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
      }
    }
  }

  function getColor() {
    const clock = content.time.clock(),
      cycle = engine.utility.wrapAlternate(clock * 2)

    const color = app.utility.color.lerpHsl(
      app.canvas.celestials.moonColor(),
      app.canvas.celestials.sunColor(),
      smooth(cycle)
    )

    color.a = cycle > 0.5
      ? 1
      : engine.utility.lerpExp(0.4, 1, engine.utility.scale(cycle, 0, 0.5, 0, 1), 4)

    // Optimization: pre-calculate scaled literal values
    color.h *= 360
    color.s *= 100

    return color
  }

  function getShimmer(x, y, time) {
    x /= shimmerScaleX
    y /= shimmerScaleY
    time /= shimmerScaleZ

    return shimmerField.value(x, y, time)
  }

  function shouldDraw() {
    const {z} = engine.position.getVector()

    if (z < content.const.lightZone) {
      return false
    }

    const surface = content.surface.current()

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

      clear()
      drawNodes()

      // Draw to main canvas (tracers channel), assume identical dimensions
      main.tracers.touch().context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
