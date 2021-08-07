app.canvas.surface = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas,
    maxDrawDistance = 75,
    shimmerField = engine.utility.simplex3d.create('shimmer'),
    shimmerScaleX = 2 / engine.utility.simplex3d.prototype.skewFactor,
    shimmerScaleY = 2 / engine.utility.simplex3d.prototype.skewFactor,
    shimmerScaleZ = 0.5 / engine.utility.simplex3d.prototype.skewFactor

  /**
   * The gridCache allows quick lookup for the vertices to draw given a heading and horizontal field of view.
   * Vertices are converted to polar coordinates and indexed by their angle within a bitree.
   * For simplicity, three complete rotations of the grid are stored so values always exist for every possible input.
   * Coordinates for vertices are expressed relative to the camera.
   */
  const gridCache = engine.utility.bitree.create({
    dimension: 'angle',
    maxItems: maxDrawDistance,
    minValue: -engine.const.tau * 1.5,
    range: engine.const.tau * 3,
  })

  let nodeRadius

  // Fill gridCache to maximum draw distance
  for (let x = -maxDrawDistance; x < maxDrawDistance; x += 1) {
    for (let y = -maxDrawDistance; y < maxDrawDistance; y += 1) {
      const distance = Math.sqrt((x * x) + (y * y))

      if (distance > maxDrawDistance) {
        continue
      }

      const angle = Math.atan2(y, x)

      gridCache.insert({
        angle: angle - engine.const.tau,
        distance,
        x,
        y,
      })

      gridCache.insert({
        angle,
        distance,
        x,
        y,
      })

      gridCache.insert({
        angle: angle + engine.const.tau,
        distance,
        x,
        y,
      })
    }
  }

  content.utility.ephemeralNoise.manage(shimmerField)

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    nodeRadius = Math.max(1, (width / 1920) * 8)

    clear()
  })

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawNodes() {
    const color = getColor(),
      drawDistance = app.settings.computed.drawDistanceDynamic,
      heading = engine.utility.vector3d.unitX().rotateQuaternion(engine.position.getQuaternion()),
      headingConjugate = engine.utility.vector3d.unitX().rotateQuaternion(engine.position.getQuaternion().conjugate()),
      hfov = main.hfov(),
      hfovLeeway = hfov / 4,
      position = engine.position.getVector(),
      positionGrid = position.clone(),
      rotateYaw = Math.atan2(headingConjugate.y, headingConjugate.x),
      time = content.time.value(),
      vertices = gridCache.retrieve(Math.atan2(heading.y, heading.x) - ((hfov + hfovLeeway) / 2), hfov + hfovLeeway),
      zOffset = engine.const.positionRadius / 2

    positionGrid.x = Math.round(positionGrid.x)
    positionGrid.y = Math.round(positionGrid.y)

    context.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l * 100}%)`

    for (const vertex of vertices) {
      // Convert to relative space
      const global = positionGrid.add(vertex)

      const relative = engine.utility.vector3d.create(
        engine.utility.vector2d.create({
          x: global.x - position.x,
          y: global.y - position.y,
        }).rotate(rotateYaw)
      )

      // Calculate true position
      global.z = content.surface.value(global.x, global.y)
      relative.z = global.z - (position.z + zOffset)

      // Calculate true distance
      const distance = relative.distance()

      // Optimization: only draw within draw distance
      if (distance > drawDistance) {
        continue
      }

      // Convert to screen space
      const screen = main.toScreenFromRelative(relative)

      // Calculate properties
      const alphaRatio = engine.utility.scale(distance, 0, drawDistance, 1, 0),
        radiusRatio = engine.utility.scale(distance, 0, maxDrawDistance, 1, 0),
        radius = engine.utility.lerpExp(1, nodeRadius, radiusRatio, 12),
        shimmer = getShimmer(global.x, global.y, time)

      const alpha = engine.utility.clamp(color.a * engine.utility.lerp(0, 2, shimmer), 0, 1) * (alphaRatio ** 0.666)

      // Draw
      context.globalAlpha = alpha
      context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
    }
  }

  function getColor() {
    const clock = content.time.clock(),
      cycle = engine.utility.wrapAlternate(clock * 2)

    const color = app.utility.color.lerpHsl(
      app.canvas.celestials.moonColor(),
      app.canvas.celestials.sunColor(),
      content.utility.smooth(cycle, 25)
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

    const drawDistance = app.settings.computed.drawDistanceDynamic,
      surface = content.surface.current()

    if (z > surface) {
      return z - surface < drawDistance
    }

    return -z + surface < drawDistance
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
