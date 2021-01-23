app.screen.game.canvas = (() => {
  const drawDistance = 500,
    explorationNodeHue = engine.utility.perlin4d.create('exploreation', 'node', 'color'),
    explorationNodeHueRotateSpeed = 1 / 120

  let aspect,
    context,
    explorationNodeRadius,
    height,
    hfov,
    root,
    vfov,
    width

  engine.ready(() => {
    root = document.querySelector('.a-game--canvas')
    context = root.getContext('2d')

    app.state.screen.on('enter-game', onEnterGame)
    app.state.screen.on('exit-game', onExitGame)

    window.addEventListener('resize', onResize)
    onResize()
  })

  function clear() {
    context.clearRect(0, 0, width, height)
  }

  function drawExplorationNodes() {
    const position = syngen.position.getVector()

    const nodes = content.system.exploration.retrieve({
      x: position.x - drawDistance,
      y: position.y - drawDistance,
      z: position.z - drawDistance,
      depth: drawDistance * 2,
      height: drawDistance * 2,
      width: drawDistance * 2,
    }).reduce((nodes, node) => {
      // Convert to relative space
      const relative = toRelative(node)

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
      screen.hue = getExplorationNodeHue(node)
      nodes.push(screen)

      return nodes
    }, [])

    // Sort back-to-front
    nodes.sort((a, b) => b.z - a.z)

    // Draw nodes
    nodes.forEach((node) => {
      const distanceRatio = engine.utility.scale(node.z, 0, drawDistance, 1, 0)

      const alpha = distanceRatio ** 2,
        radius = engine.utility.lerp(1, explorationNodeRadius, distanceRatio ** 6)

      context.fillStyle = `hsla(${node.hue}, 100%, 50%, ${alpha})`
      context.fillRect(node.x - radius, node.y - radius, radius * 2, radius * 2)
    })
  }

  function getExplorationNodeHue({
    x = 0,
    y = 0,
    z = 0,
    t = content.system.time.get(),
  } = {}) {
    const halfT = t / 2

    let value = explorationNodeHue.value((x + halfT) / 10, (y + halfT) / 10, (z + halfT) / 10, t / 10) * 2
    value += engine.loop.time() * explorationNodeHueRotateSpeed
    value = engine.utility.wrap(value, 0, 1)

    return engine.utility.lerp(0, 360, value)
  }

  function onEnterGame() {
    clear()

    if (!app.settings.computed.graphicsOn) {
      return
    }

    onResize()
    engine.loop.on('frame', onFrame)
  }

  function onExitGame() {
    engine.loop.off('frame', onFrame)
  }

  function onFrame() {
    // TODO: Calculate and fade to background color
    context.fillStyle = `rgba(0, 0, 0, ${app.settings.computed.graphicsMotionBlur})`
    context.fillRect(0, 0, width, height)

    drawExplorationNodes()
  }

  function onResize() {
    height = root.height = root.clientHeight
    width = root.width = root.clientWidth
    aspect = width / height
    hfov = app.settings.computed.graphicsFov
    vfov = hfov / aspect

    explorationNodeRadius = (width / 1920) * 3
  }

  function toRelative(vector) {
    return vector
      .subtract(syngen.position.getVector())
      .rotateQuaternion(syngen.position.getQuaternion().conjugate())
  }

  function toScreen(vector) {
    return toScreenFromRelative(
      toRelative(vector)
    )
  }

  function toScreenFromRelative(relative) {
    const hangle = Math.atan2(relative.y, relative.x),
      vangle = Math.atan2(relative.z, relative.x)

    // TODO: Consider points beyond screen edges
    // TODO: Consider points behind screen

    return engine.utility.vector2d.create({
      x: (width / 2) - (width * hangle / hfov),
      y: (height / 2) - (height * vangle / vfov),
    })
  }

  return {}
})()
