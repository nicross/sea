app.canvas.surface = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    cullCone = app.utility.cone.create(),
    main = app.canvas,
    maxDrawDistance = 75,
    noiseField = engine.utility.simplex3d.create('noise'),
    noiseMagnitude = 1/16,
    shimmerField = engine.utility.simplex3d.create('shimmer')

  const gridCache = engine.utility.octree.create({
    depth: maxDrawDistance * 2,
    height: maxDrawDistance * 2,
    width: maxDrawDistance * 2,
    x: -maxDrawDistance,
    y: -maxDrawDistance,
    z: -maxDrawDistance,
  })

  let nodeRadius

  // Fill gridCache to maximum draw distance
  for (let x = -maxDrawDistance; x < maxDrawDistance; x += 1) {
    for (let y = -maxDrawDistance; y < maxDrawDistance; y += 1) {
      gridCache.insert(
        engine.utility.vector3d.create({x, y})
      )
    }
  }

  content.utility.ephemeralNoise
    .manage(noiseField)
    .manage(shimmerField)

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

  function cullGrid() {
    return app.utility.octree.reduce(gridCache, (center, radius) => cullCone.containsSphere(center, radius))
  }

  function drawNodes() {
    const color = getColor(),
      drawDistance = app.settings.computed.drawDistanceDynamic,
      position = app.canvas.camera.computedVector(),
      positionGrid = position.clone(),
      time = content.time.value(),
      vertices = cullGrid()

    // Cache min/max screen dimensions
    const maxX = main.width() + nodeRadius,
      maxY = main.height() + nodeRadius,
      minX = -nodeRadius,
      minY = -nodeRadius

    // Determine grid offsets
    positionGrid.x = Math.round(positionGrid.x)
    positionGrid.y = Math.round(positionGrid.y)

    context.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l * 100}%)`

    for (const vertex of vertices) {
      const global = positionGrid.add(vertex)
      let distance = global.distance(position)

      // Optimization: only draw within draw distance
      if (distance > drawDistance) {
        continue
      }

      global.z = content.surface.value(global.x, global.y) - engine.const.positionRadius/2
      global.z += noiseMagnitude * noiseField.value(global.x, global.y, time)
      distance = global.distance(position)

      // Optimization: only draw within draw distance (again)
      if (distance > drawDistance) {
        continue
      }

      // Convert to screen space
      const screen = app.canvas.camera.toScreenFromGlobal(global)

      // Optimization: Skip if offscreen
      if (!engine.utility.between(screen.x, minX, maxX) || !engine.utility.between(screen.y, minY, maxY)) {
        continue
      }

      // Calculate properties
      const alphaProximityAttenuation = distance > 1 ? 1 : distance,
        alphaRatio = engine.utility.scale(distance, 0, drawDistance, 1, 0),
        radiusRatio = engine.utility.scale(distance, 0, maxDrawDistance, 1, 0),
        radius = engine.utility.lerpExp(1, nodeRadius, radiusRatio, 12),
        shimmer = shimmerField.value(global.x, global.y, time)

      const alpha = engine.utility.clamp(color.a * engine.utility.lerp(0, 2, shimmer), 0, 1) * (alphaRatio ** 0.666) * alphaProximityAttenuation

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

  function shouldDraw() {
    const {z} = app.canvas.camera.computedVector()

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

  function updateCullingGeometry() {
    const current = content.surface.current(),
      drawDistance = app.settings.computed.drawDistanceDynamic,
      fov = Math.max(app.canvas.hfov(), app.canvas.vfov())

    const leeway = 4

    // Solve triangle
    const A = fov/2
    const B = Math.PI/2
    const C = Math.PI - A - B

    // Update cone
    cullCone.height = drawDistance + leeway
    cullCone.normal = app.canvas.camera.computedNormal()
    cullCone.radius = cullCone.height / Math.sin(C) * Math.sin(A)
    cullCone.vertex = cullCone.normal.scale(-leeway).add({
      z: app.canvas.camera.computedVector().z - current,
    })
  }

  return {
    draw: function () {
      if (!shouldDraw()) {
        return this
      }

      clear()
      updateCullingGeometry()
      drawNodes()

      // Draw to main canvas (tracers channel), assume identical dimensions
      main.tracers.touch().context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
