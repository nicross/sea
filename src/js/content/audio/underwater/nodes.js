content.audio.underwater.nodes = (() => {
  const activeNodes = new Set()

  // TODO: Use settings
  const maxProps = 10,
    radius = 40

  function calculateFrequency(node) {
    // Calculate relative height ratio
    const position = engine.position.getVector()
    const value = engine.utility.scale(node.z - position.z, -radius, radius, 0, 1)
    const clamped = engine.utility.clamp(value, 0, 1)

    // Choose harmonic frequency
    return engine.utility.choose(content.soundtrack.harmonics(), clamped)
  }

  function cleanupProps() {
    // Destroy props beyond radius
    const props = engine.props.get()

    for (const prop of props) {
      if (content.prop.node.isPrototypeOf(prop) && prop.distance > radius) {
        engine.props.destroy(prop)
      }
    }
  }

  function generateProp(velocity) {
    const position = engine.position.getVector()

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

    // Sort by nearest distance
    for (const node of nodes) {
      node._distance2 = node.distance2(position)
    }

    nodes.sort((a, b) => a._distance2 - b._distance2)

    // Find random node, weighted by nearest distance
    const node = engine.utility.choose(nodes, Math.random() ** 2)
    activeNodes.add(node)

    // Instantiate prop
    const prop = engine.props.create(getPrototype(node), {
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

  function getPrototype() {
    // TODO: Determine prototype from terrain biome
    return content.prop.classic
  }

  return {
    reset: function () {
      activeNodes.clear()
      return this
    },
    update: function () {
      cleanupProps()

      const count = engine.props.get().length,
        isMuted = content.audio.mixer.bus.music.isMuted()

      if (isMuted || count >= maxProps) {
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
