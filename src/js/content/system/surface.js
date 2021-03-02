content.system.surface = (() => {
  const field = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'surface', 6),
    momentumX = -10, // Moves westward N m/s
    scaleX = 60, // Nodes are N m apart
    scaleY = 300, // Nodes are N m apart
    timeScale = 60 // Evolves over N seconds

  let currentHeight,
    currentHeightScale,
    currentValue

  content.utility.ephemeralNoise.manage(field)

  function cacheCurrent() {
    const cycle = content.system.time.cycle(),
      position = engine.position.getVector()

    currentValue = getValue(position.x, position.y)
    currentHeight = toHeight(currentValue)
    currentHeightScale = 1 - engine.utility.wrapAlternate(2 * cycle, 0, 1)
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
    return engine.utility.lerp(content.const.waveHeightMin, content.const.waveHeightMax, currentHeightScale) * value
  }

  return {
    currentHeight: function () {
      if (currentHeight === undefined) {
        cacheCurrent()
      }

      return currentHeight
    },
    currentHeightScale: () => currentHeightScale,
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
      currentHeightScale = undefined
      currentValue = undefined
      return this
    },
    toHeight,
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
