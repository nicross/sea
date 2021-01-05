app.screen.game.visualizer = (() => {
  const drawDistance = 500,
    explorationNodeHue = engine.utility.perlin4d.create('exploreation', 'node', 'color')

  let aspect,
    context,
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

  function distanceToAlpha(distance) {
    return ((drawDistance - distance) / drawDistance) ** 2
  }

  function drawExplorationNodes() {
    // Caches values for efficiently drawing node edges
    const cache = new Map()

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

      const screen = engine.utility.vector2d.create({
        x: (width / 2) - (width * hangle / hfov),
        y: (height / 2) - (height * vangle / vfov),
      })

      const alpha = distanceToAlpha(distance),
        hue = getExplorationNodeHue(node)

      context.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`
      context.fillRect(screen.x, screen.y, 1, 1)

      cache.set(node, {
        alpha,
        distance,
        hue,
        relative,
        screen,
      })
    })

    getExplorationNodeEdges(
      ...cache.keys()
    ).forEach(([a, b]) => {
      const aCache = cache.get(a),
        bCache = cache.get(b)

      const aRelative = aCache ? aCache.relative : toRelative(a),
        bRelative = bCache ? bCache.relative : toRelative(b)

      const aDistance = aCache ? aCache.distance : aRelative.distance(),
        bDistance = bCache ? bCache.distance : bRelative.distance()

      if (aDistance > drawDistance || bDistance > drawDistance) {
        return
      }

      const aAlpha = aCache ? aCache.alpha : distanceToAlpha(aDistance),
        bAlpha = bCache ? bCache.alpha : distanceToAlpha(bDistance)

      const aHue = aCache ? aCache.hue : getExplorationNodeHue(a),
        bHue = bCache ? bCache.hue : getExplorationNodeHue(b)

      const aScreen = aCache ? aCache.screen : toScreenFromRelative(a),
        bScreen = bCache ? bCache.screen : toScreenFromRelative(b)

      const gradient = context.createLinearGradient(aScreen.x, aScreen.y, bScreen.x, bScreen.y)
      gradient.addColorStop(0, `hsla(${aHue}, 100%, 50%, ${aAlpha})`)
      gradient.addColorStop(0, `hsla(${bHue}, 100%, 50%, ${bAlpha})`)
      context.strokeStyle = gradient

      context.beginPath()
      context.moveTo(aScreen.x, aScreen.y)
      context.lineTo(bScreen.x, bScreen.y)
      context.stroke()
    })
  }

  function getExplorationNodeEdges(...nodes) {
    const cache = new Map(),
      graph = content.system.exploration.graph(),
      lines = []

    nodes.forEach((node) => {
      const edges = new Set()

      graph.get(node).forEach((other) => {
        if (cache.has(other)) {
          if (cache.get(other).has(node)) {
            return
          }
        }

        lines.push([node, other])
        edges.add(other)
      })

      cache.set(node, edges)
    })

    return lines
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
    engine.loop.on('frame', onFrame)
  }

  function onExitGame() {
    engine.loop.off('frame', onFrame)
  }

  function onFrame() {
    context.clearRect(0, 0, width, height)
    drawExplorationNodes()
  }

  function onResize() {
    height = root.height = root.clientHeight
    width = root.width = root.clientWidth
    aspect = width / height
    hfov = Math.PI / 2
    vfov = hfov / aspect
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
