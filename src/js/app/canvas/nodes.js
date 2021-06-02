app.canvas.nodes = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas,
    maxObjects = 1000,
    nodeHue = engine.utility.perlin3d.create('exploration', 'node', 'hue'),
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
    const drawDistance = app.settings.computed.drawDistance,
      height = main.height(),
      hfov = main.hfov(),
      position = syngen.position.getVector(),
      vfov = main.vfov(),
      width = main.width()

    const nodes = content.exploration.retrieve({
      x: position.x - drawDistance,
      y: position.y - drawDistance,
      z: position.z - drawDistance,
      depth: drawDistance * 2,
      height: drawDistance * 2,
      width: drawDistance * 2,
    }).reduce((nodes, node) => {
      // Convert to relative space
      const relative = main.toRelative(node)

      // Filter out nodes behind field of view
      if (relative.x <= 0) {
        return nodes
      }

      const hangle = Math.atan2(relative.y, relative.x)

      // Filter out nodes beyond horizontal field of view (with leeway)
      if (Math.abs(hangle) > hfov / 1.95) {
        return nodes
      }

      const vangle = Math.atan2(relative.z, relative.x)

      // Filter out nodes beyond vertical field of view (with leeway)
      if (Math.abs(vangle) > vfov / 1.95) {
        return nodes
      }

      const distance = relative.distance()

      // Filter out nodes beyond draw distance
      if (distance > drawDistance) {
        return nodes
      }

      // Convert to screen space
      // Importantly, z-coordinate represents distance from camera
      const screen = engine.utility.vector3d.create({
        x: (width / 2) - (width * hangle / hfov),
        y: (height / 2) - (height * vangle / vfov),
        z: relative.distance(),
      })

      // Cache hue before we discard global coordinates
      screen.hue = getNodeHue(node)
      nodes.push(screen)

      return nodes
    }, [])

    // Sort back-to-front
    nodes.sort((a, b) => b.z - a.z)

    // Limit to maximum object limit
    const length = Math.min(nodes.length, maxObjects)

    // Draw nodes
    nodes.slice(-length).forEach((node, index) => {
      const alphaRatio = engine.utility.scale(node.z, 0, drawDistance, 1, 0),
        radiusRatio = engine.utility.scale(node.z, 0, 1000, 1, 0), // max drawDistance
        radius = engine.utility.lerpExp(1, nodeRadius, radiusRatio, 64)

      // Fade out distant nodes
      let alpha = alphaRatio ** 2

      // Fade out nodes approaching the object limit
      if ((length > (maxObjects / 2)) && index < (length - (maxObjects / 2))) {
        alpha *= engine.utility.scale(index, 0, length - maxObjects/2, 0, 1)
      }

      context.fillStyle = `hsla(${node.hue}, 100%, 50%, ${alpha})`
      context.fillRect(node.x - radius, node.y - radius, radius * 2, radius * 2)
    })
  }

  function getNodeHue({
    x = 0,
    y = 0,
    z = 0,
    t = content.time.value(),
  } = {}) {
    // XXX: This used to be 4D noise prior to v1.2.2.
    // TODO: Look into simplex or other more performant noise.

    let value = nodeHue.value((x + t/59) / 25, (y + t/61) / 25, (z + t/2) / 25)
    value += t * nodeHueRotateSpeed
    value = engine.utility.wrap(value * 2, 0, 1)

    return engine.utility.lerp(0, 360, value)
  }

  function shouldDraw() {
    // TODO: Find better value, e.g. what is the Z at the bottom of screen?
    const {z} = engine.position.getVector()
    return z < content.const.lightZone
  }

  return {
    draw: function () {
      if (!shouldDraw()) {
        return this
      }

      clear()
      drawNodes()

      // Draw to main canvas (motion blur channel), assume identical dimensions
      main.blur.touch().context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
