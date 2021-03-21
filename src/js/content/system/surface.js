content.system.surface = (() => {
  const momentumX = -10, // Moves westward N m/s
    noiseAmplitude = 1 / (2 ** 6),
    noiseField = engine.utility.perlin3d.create('surface', 'noise'),
    noiseOffset = engine.utility.perlin1d.create('surface', 'noise', 'offset'),
    noiseScaleX = 2,
    noiseScaleY = 2,
    normalField = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, ['surface', 'normal'], 4),
    normalScaleX = 60,
    normalScaleY = 300,
    tidalField = engine.utility.perlin2d.create('surface', 'tidal'),
    tidalScaleX = 500,
    tidalScaleY = 500,
    timeScale = 60 // Evolves over N seconds

  let currentHeight,
    currentHeightScale,
    currentValue

  content.utility.ephemeralNoise.manage(noiseField)
  content.utility.ephemeralNoise.manage(noiseOffset)
  content.utility.ephemeralNoise.manage(normalField)
  content.utility.ephemeralNoise.manage(tidalField)

  function cacheCurrent() {
    const cycle = content.system.time.cycle(),
      position = engine.position.getVector()

    currentValue = getValue(position.x, position.y)
    currentHeight = toHeight(currentValue)
    currentHeightScale = 1 - engine.utility.wrapAlternate(2 * cycle, 0, 1)
  }

  function getNoise(x, y, time) {
    const offset = 2 * Math.PI * noiseOffset.value(time / timeScale)

    x += Math.cos(offset)
    y += Math.sin(offset)

    x /= noiseScaleX
    y /= noiseScaleY

    return noiseField.value(x, y, time)
  }

  function getNormal(x, y, time) {
    x /= normalScaleX
    x += time * momentumX / normalScaleX
    y /= normalScaleY

    return normalField.value(x, y, time / timeScale)
  }

  function getTidal(x, y, time) {
    x /= tidalScaleX
    x += time * momentumX / tidalScaleX
    y /= tidalScaleY

    const mix = smooth(tidalField.value(y, time / timeScale) ** 0.5),
      wave = Math.cos(2 * Math.PI * x) ** 127

    return engine.utility.clamp(wave * mix, 0, 1)
  }

  function getValue(x, y) {
    const cycle = content.system.time.cycle(),
      cycleFactor = Math.cos(Math.PI * cycle) ** 8,
      time = content.system.time.value()

    const tidal = cycleFactor
      ? getTidal(x, y, time) * cycleFactor
      : 0

    const noise = getNoise(x, y, time) * noiseAmplitude * (1 - tidal),
      normal = getNormal(x, y, time) * (1 - noiseAmplitude) * (1 - tidal)

    return engine.utility.clamp(noise + normal + tidal, 0, 1)
  }

  function smooth(value) {
    // generalized logistic function
    return 1 / (1 + (Math.E ** (-12.5 * (value - 0.5))))
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
