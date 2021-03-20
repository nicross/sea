app.canvas.nodes = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    main = app.canvas,
    nodeHue = engine.utility.perlin3d.create('exploration', 'node', 'hue'),
    nodeHueRotateSpeed = 1 / 120

  let nodeRadius

  content.utility.ephemeralNoise.manage(nodeHue)

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
    const drawDistance = app.settings.computed.drawDistance,
      height = main.height(),
      hfov = main.hfov(),
      position = syngen.position.getVector(),
      vfov = main.vfov(),
      width = main.width()

    const nodes = content.system.exploration.retrieve({
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

      // Filter out nodes beyond horizontal field of view
      if (Math.abs(hangle) > hfov / 2) {
        return nodes
      }

      const vangle = Math.atan2(relative.z, relative.x)

      // Filter out nodes beyond vertical field of view
      if (Math.abs(vangle) > vfov / 2) {
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

    // Draw nodes
    nodes.forEach((node) => {
      const distanceRatio = engine.utility.scale(node.z, 0, drawDistance, 1, 0)

      const alpha = distanceRatio ** 2,
        radius = engine.utility.lerpExp(1, nodeRadius, distanceRatio, 64)

      context.fillStyle = `hsla(${node.hue}, 100%, 50%, ${alpha})`
      context.fillRect(node.x - radius, node.y - radius, radius * 2, radius * 2)
    })
  }

  /*
     XXX: See git history at this line.
          Using 4D noise here was an artistic choice.
          Changing it for performance not a light decision.
     TODO: Look into simples or other more performant noise for this.
   */
  function getNodeHue({
    x = 0,
    y = 0,
    z = 0,
    t = content.system.time.value(),
  } = {}) {
    const halfT = t / 2

    let value = nodeHue.value((x + halfT) / 10, (y + halfT) / 10, (z + halfT) / 10) * 2
    value += engine.loop.time() * nodeHueRotateSpeed
    value = engine.utility.wrap(value, 0, 1)

    return engine.utility.lerp(0, 360, value)
  }

  function shouldDraw() {
    // TODO: Find better value, e.g. what is the Z at the bottom of screen?
    const {z} = engine.position.getVector()
    return z < content.const.lightZone
  }

  function tameAlpha() {
    // XXX: Huge performance impact
    // TODO: Look into better solution
    return

    const image = context.getImageData(0, 0, main.width(), main.height())

    const data = image.data,
      length = data.length

    for (let i = 4; i < length; i += 4) {
      if (data[i] > 0) {
        data[i] -= 1
      }
    }

    context.putImageData(image, 0, 0)
  }

  return {
    draw: function () {
      if (!shouldDraw()) {
        return this
      }

      const hasBlur = app.settings.computed.graphicsMotionBlur > 0

      if (hasBlur) {
        tameAlpha()
      }

      const blur = hasBlur
        ? context.createPattern(canvas, 'no-repeat')
        : undefined

      clear()

      if (hasBlur) {
        context.globalAlpha = app.settings.computed.graphicsMotionBlur
        context.fillStyle = blur
        context.fillRect(0, 0, main.width(), main.height())
        context.globalAlpha = 1
      }

      drawNodes()

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
