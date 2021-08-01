content.surface.wind = (() => {
  const fieldNormal = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['surface', 'wind', 'normal'],
    type: engine.utility.simplex2d,
  })

  const fieldOffset = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['surface', 'wind', 'offset'],
    type: engine.utility.simplex2d,
  })

  const momentumX = -7.5,
    xScale = 40 / engine.utility.simplex2d.prototype.skewFactor,
    yScale = 200 / engine.utility.simplex2d.prototype.skewFactor,
    zPower = 1.25,
    zScale = 4

  content.utility.ephemeralNoise
    .manage(fieldNormal)
    .manage(fieldOffset)

  function clip(value) {
    return Math.max((2 * value) - 1, 0)
  }

  return {
    value: (x, y) => {
      const time = content.time.value()

      x += time * momentumX
      x /= xScale
      y /= yScale

      const normal = clip(fieldNormal.value(x, y)),
        offset = clip(fieldOffset.value(x + 0.5, y + 0.5)),
        value = Math.min(normal + offset, 1)

      return zScale * (value ** zPower)
    },
  }
})()
