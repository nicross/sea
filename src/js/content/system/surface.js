content.system.surface = (() => {
  const field = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'surface', 8),
    momentumX = -10, // Moves westward N m/s
    scaleX = 60, // Nodes are N m apart
    scaleY = 300, // Nodes are N m apart
    timeScale = 60 // Evolves over N seconds

  let currentHeight,
    currentValue

  content.utility.ephemeralNoise.manage(field)

  function cacheCurrent() {
    const position = engine.position.getVector()

    currentValue = getValue(position.x, position.y)
    currentHeight = toHeight(currentValue)
  }

  function getValue(x, y) {
    const time = content.system.time.value(),
      z = time / timeScale

    x /= scaleX
    x += time * momentumX / scaleX

    y /= scaleY

    return field.value(x, y, z)
  }

  function toHeight(value) {
    return value * content.const.waveHeight
  }

  return {
    currentHeight: function () {
      if (currentHeight === undefined) {
        cacheCurrent()
      }

      return currentHeight
    },
    currentValue: function () {
      if (currentValue === undefined) {
        cacheCurrent()
      }

      return currentValue
    },
    height: function (x, y) {
      const value = this.value(x, y)
      return toHeight(value)
    },
    import: function () {
      cacheCurrent()
      return this
    },
    reset: function () {
      field.reset()
      currentHeight = undefined
      currentValue = undefined
      return this
    },
    update: function () {
      const {z} = engine.position.getVector()

      if (z > content.const.lightZone) {
        cacheCurrent()
      }

      return this
    },
    value: function (x, y) {
      return getValue(x, y)
    },
  }
})()

engine.loop.on('frame', () => content.system.surface.update())
engine.state.on('import', () => content.system.surface.import())
engine.state.on('reset', () => content.system.surface.reset())
