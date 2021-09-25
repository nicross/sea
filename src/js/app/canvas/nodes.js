app.canvas.nodes = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    fadeDuration = 1/2,
    main = app.canvas,
    maxObjects = 1000,
    nodeHue = engine.utility.simplex3d.create('exploration', 'node', 'hue'),
    nodeHueScale = 25 / engine.utility.simplex3d.prototype.skewFactor,
    nodeHueRotateSpeed = 1 / 120

  let nodeRadius

  content.utility.ephemeralNoise.manage(nodeHue)

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
      height = main.height(),
      now = engine.audio.time(),
      width = main.width()

    const maxX = width + nodeRadius,
      maxY = height + nodeRadius,
      minX = -nodeRadius,
      minY = -nodeRadius

    const nodes = app.canvas.camera.frustum.cullOctree(
      content.exploration.tree()
    ).reduce((nodes, node) => {
      if (!app.canvas.camera.frustum.containsPoint(node)) {
        return nodes
      }

      // Convert to screen space
      const screen = app.canvas.camera.toScreenFromGlobal(node)

      // Optimization: skip if offscreen
      if (!engine.utility.between(screen.x, minX, maxX) || !engine.utility.between(screen.y, minY, maxY)) {
        return nodes
      }

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
    const length = Math.min(nodes.length, maxObjects)

    // Draw nodes within limits
    for (let index = 0; index < length; index += 1) {
      const node = nodes[nodes.length - length + index]

      const alphaRatio = engine.utility.scale(node.z, 0, drawDistance, 1, 0),
        radiusRatio = engine.utility.scale(node.z, 0, 1000, 1, 0), // max drawDistance
        radius = engine.utility.lerpExp(1, nodeRadius, radiusRatio, 64)

      // Fade out distant nodes
      let alpha = alphaRatio ** 2

      // Fade out nodes approaching the object limit
      if ((length > (maxObjects / 2)) && index < (length - (maxObjects / 2))) {
        alpha *= engine.utility.scale(index, 0, length - maxObjects/2, 0, 1)
      }

      if ((now - node.time) < fadeDuration) {
        alpha *= engine.utility.scale(now - node.time, 0, fadeDuration, 0, 1)
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
    // XXX: This used to be 4D noise prior to v1.2.2.
    // TODO: Look into simplex or other more performant noise.

    let value = nodeHue.value((x + t/59) / nodeHueScale, (y + t/61) / nodeHueScale, (z + t/2) / nodeHueScale)
    value += t * nodeHueRotateSpeed
    value = engine.utility.wrap(value * 2, 0, 1)

    return engine.utility.lerp(0, 360, value)
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
