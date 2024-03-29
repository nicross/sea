app.canvas.nodes = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    fadeDuration = 1/2,
    main = app.canvas,
    nodeHue = engine.utility.simplex4d.create('exploration', 'node', 'hue'),
    nodeX = engine.utility.perlin1d.create('exploration', 'node', 'x'),
    nodeY = engine.utility.perlin1d.create('exploration', 'node', 'y'),
    nodeZ = engine.utility.perlin1d.create('exploration', 'node', 'z'),
    nodeTranslateScale = 1/8,
    nodeTranslateTimeScale = 4,
    nodeHueScale = 37.5 / engine.utility.simplex3d.prototype.skewFactor,
    nodeHueTimeScale = 60 / engine.utility.simplex3d.prototype.skewFactor,
    nodeHueRotateSpeed = 1 / 300

  let nodeRadius

  content.utility.ephemeralNoise
    .manage(nodeHue)
    .manage(nodeX)
    .manage(nodeY)
    .manage(nodeZ)

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    nodeRadius = Math.max(1, (width / 1920) * 16)

    clear()
  })

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawNodes() {
    const drawDistance = app.settings.computed.drawDistanceStatic,
      cameraVector = app.canvas.camera.computedVector(),
      now = engine.audio.time(),
      objectLimit = app.settings.computed.graphicsStaticObjectLimit,
      translateTime = content.time.value() / nodeTranslateTimeScale

    const nx0 = engine.utility.lerp(-nodeTranslateScale, nodeTranslateScale, nodeX.value(translateTime)),
      nx1 = engine.utility.lerp(-nodeTranslateScale, nodeTranslateScale, nodeX.value(translateTime + 1)),
      ny0 = engine.utility.lerp(-nodeTranslateScale, nodeTranslateScale, nodeY.value(translateTime)),
      ny1 = engine.utility.lerp(-nodeTranslateScale, nodeTranslateScale, nodeY.value(translateTime + 1)),
      nz0 = engine.utility.lerp(-nodeTranslateScale, nodeTranslateScale, nodeZ.value(translateTime)),
      nz1 = engine.utility.lerp(-nodeTranslateScale, nodeTranslateScale, nodeZ.value(translateTime + 1))

    const nodes = reduceClosest(
      app.utility.octree.reduce(
        content.exploration.tree(),
        (center, radius) => app.canvas.camera.frustum.containsSphereNoPlanes(center, radius + nodeTranslateScale),
        (point) => app.canvas.camera.frustum.containsSphereInPlanes(point, nodeTranslateScale)
      )
    ).reduce((nodes, node) => {
      // Convert to screen space, with added noise
      const screen = app.canvas.camera.toScreenFromGlobal({
        x: node.x + engine.utility.lerp(nx0, nx1, node.phase),
        y: node.y + engine.utility.lerp(ny0, ny1, node.phase),
        z: node.z + engine.utility.lerp(nz0, nz1, node.phase),
      })

      // Cache distance from player as z-coordinate
      screen.z = cameraVector.subtract(node).distance()

      // Cache hue before we discard global coordinates
      screen.hue = getNodeHue(node)

      // Copy node time for animations
      screen.time = node.time

      nodes.push(screen)

      return nodes
    }, [])

    // Sort back-to-front
    nodes.sort((a, b) => b.z - a.z)

    // Limit to maximum object limit
    const length = Math.min(nodes.length, objectLimit)

    // Draw nodes within limits
    for (let index = 0; index < length; index += 1) {
      const node = nodes[nodes.length - length + index]

      const distanceRatio = engine.utility.clamp(engine.utility.scale(node.z, 0, drawDistance, 1, 0), 0, 1),
        radiusRatio = engine.utility.scale(node.z, 0, 1000, 1, 0), // max drawDistance
        radius = engine.utility.lerpExp(1, nodeRadius, radiusRatio, 64)

      if (!distanceRatio) {
        continue
      }

      // Fade out distant nodes
      let alpha = distanceRatio ** 0.5

      // Fade out nodes approaching the object limit
      if ((length > (objectLimit / 2)) && index < (length - (objectLimit / 2))) {
        alpha *= engine.utility.scale(index, 0, length - objectLimit/2, 0, 1) ** 0.5
      }

      if ((now - node.time) < fadeDuration) {
        alpha *= engine.utility.scale(now - node.time, 0, fadeDuration, 0, 1)
      }

      if (!alpha) {
        continue
      }

      context.fillStyle = `hsla(${node.hue}, 100%, 50%, ${alpha})`
      context.fillRect(node.x - radius, node.y - radius, radius * 2, radius * 2)
    }
  }

  function getNodeHue({
    x = 0,
    y = 0,
    z = 0,
    t = content.time.value(),
  } = {}) {
    let value = nodeHue.value(x / nodeHueScale, y / nodeHueScale, z / nodeHueScale, t / nodeHueTimeScale)
    value += t * nodeHueRotateSpeed
    value = engine.utility.wrap(value * 2, 0, 1)

    return engine.utility.lerp(0, 360, value)
  }

  function reduceClosest(nodes) {
    // Optimize z-sorting by moving the near plane until object limit is on negative side of plane

    const drawDistance = app.settings.computed.drawDistanceStatic,
      objectLimit = app.settings.computed.graphicsStaticObjectLimit,
      step = drawDistance / 10

    const plane = app.utility.plane.create({
      constant: app.canvas.camera.computedNormal().dotProduct(app.canvas.camera.computedVector()),
      normal: app.canvas.camera.computedNormal(),
    })

    let distance = 0,
      results = []

    while (results.length < objectLimit && distance < drawDistance) {
      distance += step
      results = nodes.filter((result) => plane.distanceToPoint(result) < distance)
    }

    return results
  }

  function shouldDraw() {
    // TODO: Find better value, e.g. what is the Z at the bottom of screen?
    const {z} = app.canvas.camera.computedVector()
    return z < content.const.lightZone
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
