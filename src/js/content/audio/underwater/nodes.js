content.audio.underwater.nodes = (() => {
  const activeNodes = new Set()

  function calculateFrequency(node) {
    const radius = app.settings.computed.streamerRadius

    // Calculate relative height ratio
    const position = engine.position.getVector()
    const value = engine.utility.scale(node.z - position.z, -radius, radius, 0, 1)
    const clamped = engine.utility.clamp(value, 0, 1)

    // Choose harmonic frequency
    return engine.utility.choose(content.soundtrack.harmonics(), clamped)
  }

  function cleanupProps() {
    // Destroy props beyond radius
    const props = engine.props.get(),
      radius = app.settings.computed.streamerRadius

    for (const prop of props) {
      if (content.prop.node.isPrototypeOf(prop) && prop.distance > radius) {
        engine.props.destroy(prop)
      }
    }
  }

  function generateProp(velocity) {
    // Select node
    const node = selectNode()

    if (!node) {
      return
    }

    activeNodes.add(node)

    // Instantiate prop
    const prototype = getPrototypeCached(node)

    const prop = engine.props.create(prototype, {
      destination: content.audio.mixer.bus.music.bus(),
      x: node.x,
      y: node.y,
      z: node.z,
    })

    // Override onDestroy to clean up activeNodes
    const onDestroy = prop.onDestroy

    prop.onDestroy = function () {
      activeNodes.delete(node)
      return onDestroy.call()
    }

    // Play prop sound and then destroy
    prop.play({
      frequency: calculateFrequency(prop),
      velocity,
    }).then(() => {
      engine.props.destroy(prop)
    })
  }

  function getPrototype(node) {
    if (content.terrain.worms.isInside(node.x, node.y, node.z, 1)) {
      return content.prop.worm
    }

    // TODO: Determine prototype from terrain biome
    return content.prop.classic
  }

  function getPrototypeCached(node) {
    if (!node._propPrototype) {
      node._propPrototype = getPrototype(node)
    }

    return node._propPrototype
  }

  function selectNode() {
    const nodes = selectNodes(),
      limit = app.settings.computed.streamerLimit

    // Try to produce a random inactive node without building a full set difference
    for (let i = 0; i < limit; i += 1) {
      const roll = Math.random()
      const node = engine.utility.choose(nodes, roll)

      if (!activeNodes.has(node)) {
        return node
      }
    }
  }

  function selectNodes() {
    const position = engine.position.getVector(),
      radius = app.settings.computed.streamerRadius,
      step = Math.sqrt(radius)

    // Optimization: Proceed only if there are nodes to sort, cache all results
    const all = content.exploration.retrieve({
      depth: radius * 2,
      height: radius * 2,
      width: radius * 2,
      x: position.x - radius,
      y: position.y - radius,
      z: position.z - radius,
    })

    if (!all.length || all.length == activeNodes.size) {
      return []
    }

    let nodes = []

    // Select increasing areas around position, weighting closer nodes by pushing copies into the result set
    for (let distance = step; distance < radius; distance += step) {
      nodes = nodes.concat(content.exploration.retrieve({
        depth: distance * 2,
        height: distance * 2,
        width: distance * 2,
        x: position.x - distance,
        y: position.y - distance,
        z: position.z - distance,
      }))
    }

    // Push the cached full result set to include the last step
    nodes = nodes.concat(all)

    return nodes
  }

  return {
    reset: function () {
      activeNodes.clear()
      return this
    },
    update: function () {
      cleanupProps()

      const count = activeNodes.size,
        maxProps = app.settings.computed.streamerLimit

      const shouldRoll = count < maxProps
        && !content.audio.mixer.bus.music.isMuted()
        && content.utility.altimeter.isCloserToFloor()
        && content.terrain.worms.isReady()

      if (!shouldRoll) {
        return this
      }

      // TODO: Get velocity from 4D noise
      const velocity = 1

      const chance = maxProps / engine.performance.fps(),
        roll = Math.random()

      if (roll < chance) {
        generateProp(velocity)
      }

      return this
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused && content.scan.isCooldown()) {
    return
  }

  content.audio.underwater.nodes.update()
})

engine.state.on('reset', () => content.audio.underwater.nodes.reset())
