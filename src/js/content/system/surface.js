content.system.surface = (() => {
  const momentumX = -10, // Moves westward N m/s
    normalField = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, ['surface', 'normal'], 6),
    scaleX = 80,
    scaleY = 300,
    tidalField = engine.utility.perlin2d.create('surface', 'tidal'),
    timeScale = 60 // Evolves over N seconds

  let currentHeight,
    currentHeightScale,
    currentValue

  content.utility.ephemeralNoise.manage(normalField)
  content.utility.ephemeralNoise.manage(tidalField)

  function cacheCurrent() {
    const cycle = content.system.time.cycle(),
      position = engine.position.getVector()

    currentValue = getValue(position.x, position.y)
    currentHeight = toHeight(currentValue)
    currentHeightScale = 1 - engine.utility.wrapAlternate(2 * cycle, 0, 1)
  }

  function getTidal(x, y, time) {
    const mix = tidalField.value(y, time) ** 0.75,
      wave = Math.cos(2 * Math.PI * x) ** 3

    return engine.utility.clamp(wave * mix, 0, 1)
  }

  function getValue(x, y) {
    const cycle = content.system.time.cycle(),
      cycleFactor = Math.cos(Math.PI * cycle) ** 8,
      time = content.system.time.value()

    x /= scaleX
    x += time * momentumX / scaleX
    y /= scaleY

    const tidal = cycleFactor
      ? getTidal(x, y, time / timeScale) * cycleFactor
      : 0

    const normal = normalField.value(x, y, time / timeScale) * (1 - tidal)
    return engine.utility.clamp(normal + tidal, 0, 1)
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
      normalField.reset()
      tidalField.reset()

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
