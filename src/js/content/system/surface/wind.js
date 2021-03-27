content.system.surface.wind = (() => {
  const fieldNormal = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, ['surface', 'wind', 'normal'], 2),
    fieldOffset = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, ['surface', 'wind', 'offset'], 2),
    momentumX = -7.5,
    xScale = 40,
    yScale = 200,
    zPower = 1.25,
    zScale = 4

  content.utility.ephemeralNoise.manage(fieldNormal).manage(fieldOffset)

  function clip(value) {
    return Math.max((2 * value) - 1, 0)
  }

  return {
    value: (x, y) => {
      const time = content.system.time.value()

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
