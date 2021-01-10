app.screen.game.visualizer = (() => {
  const drawDistance = 500,
    explorationNodeHue = engine.utility.perlin4d.create('exploreation', 'node', 'color')

  let aspect,
    context,
    explorationNodeRadius,
    height,
    hfov,
    root,
    vfov,
    width

  engine.ready(() => {
    root = document.querySelector('.a-game--visualizer')
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
    getExplorationNodes().forEach((node) => {
      const relative = toRelative(node)

      if (relative.x <= 0) {
        return
      }

      const hangle = Math.atan2(relative.y, relative.x)

      if (Math.abs(hangle) > hfov / 2) {
        return
      }

      const vangle = Math.atan2(relative.z, relative.x)

      if (Math.abs(vangle) > vfov / 2) {
        return
      }

      const distance = relative.distance()

      if (distance > drawDistance) {
        return
      }

      const ratio = engine.utility.scale(distance, 0, drawDistance, 1, 0)

      const screen = engine.utility.vector2d.create({
        x: (width / 2) - (width * hangle / hfov),
        y: (height / 2) - (height * vangle / vfov),
      })

      const alpha = ratio ** 2,
        hue = getExplorationNodeHue(node),
        radius = engine.utility.lerp(1, explorationNodeRadius, ratio ** 4)

      context.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`
      context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
    })
  }

  function getExplorationNodeHue({
    x = 0,
    y = 0,
    z = 0,
    t = content.system.time.get(),
  } = {}) {
    const value = explorationNodeHue.value(x / 10, y / 10, z / 10, t / 10)
    return engine.utility.lerp(0, 360, value)
  }

  function getExplorationNodes() {
    const doubleDraw = drawDistance * 2,
      position = syngen.position.getVector()

    return content.system.exploration.retrieve({
      x: position.x - drawDistance,
      y: position.y - drawDistance,
      z: position.z - drawDistance,
      depth: doubleDraw,
      height: doubleDraw,
      width: doubleDraw,
    })
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
    clear()
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
