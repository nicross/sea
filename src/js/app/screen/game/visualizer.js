app.screen.game.visualizer = (() => {
  const drawDistance = 500,
    explorationNodeColor = engine.utility.perlin4d.create('exploreation', 'node', 'color')

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

  function drawExplorationNodes() {
    getExplorationNodes().forEach((vector) => {
      if (vector.x <= 0) {
        return
      }

      const hangle = Math.atan2(vector.y, vector.x)

      if (Math.abs(hangle) > hfov / 2) {
        return
      }

      const vangle = Math.atan2(vector.z, vector.x)

      if (Math.abs(vangle) > vfov / 2) {
        return
      }

      const distance = vector.distance()

      if (distance > drawDistance) {
        return
      }

      const x = (width / 2) - (width * hangle / hfov),
        y = (height / 2) - (height * vangle / vfov)

      const alpha = ((drawDistance - distance) / drawDistance) ** 2

      // TODO: Consider assigning colors to each point
      context.fillStyle = getExplorationNodeColor(vector, alpha)
      context.fillRect(x, y, 1, 1)
    })
  }

  function getExplorationNodeColor(vector, alpha) {
    const t = content.system.time.get(),
      value = explorationNodeColor.value(vector._nodeX / 10, vector._nodeY / 10, vector._nodeZ / 10, t / 10)

    const hue = engine.utility.lerp(0, 360, value)

    return `hsla(${hue}, 100%, 50%, ${alpha})`
  }

  function getExplorationNodes() {
    const doubleDraw = drawDistance * 2,
      positionQuaternionConjugate = syngen.position.getQuaternion().conjugate(),
      positionVector = syngen.position.getVector()

    // TODO: Optimize geometry
    const nodes = content.system.exploration.retrieve({
      x: positionVector.x - drawDistance,
      y: positionVector.y - drawDistance,
      z: positionVector.z - drawDistance,
      depth: doubleDraw,
      height: doubleDraw,
      width: doubleDraw,
    })

    return nodes.map((node) => {
      const vector = engine.utility.vector3d.create(node)
        .subtract(positionVector)
        .rotateQuaternion(positionQuaternionConjugate)

      vector._nodeX = node.x
      vector._nodeY = node.y
      vector._nodeZ = node.z

      return vector
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

  return {}
})()
