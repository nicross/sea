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
    const position = engine.position.getVector(),
      radius = app.settings.computed.streamerRadius

    // Find nearby inactive nodes
    const nodes = content.exploration.retrieve({
      depth: radius * 2,
      height: radius * 2,
      width: radius * 2,
      x: position.x - radius,
      y: position.y - radius,
      z: position.z -radius,
    }).filter((node) => !activeNodes.has(node))

    if (!nodes.length) {
      return
    }

    // Find random node, weighted by nearest distance
    const node = engine.utility.choose(nodes, Math.random())
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

  return {
    reset: function () {
      activeNodes.clear()
      return this
    },
    update: function () {
      const maxProps = app.settings.computed.streamerLimit

      cleanupProps()

      const count = engine.props.get().length,
        isMuted = content.audio.mixer.bus.music.isMuted()

      if (isMuted || count >= maxProps || !content.terrain.worms.isReady()) {
        return this
      }

      // TODO: Get velocity from 4D noise
      const velocity = 1

      const chance = maxProps / engine.performance.fps(),
        roll = Math.random()

      if (roll < chance) {
        generateProp(velocity)
      }
    },
  }
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  content.audio.underwater.nodes.update()
})

engine.state.on('reset', () => content.audio.underwater.nodes.reset())
