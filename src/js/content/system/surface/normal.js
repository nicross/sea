content.system.surface.normal = (() => {
  const field = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, ['surface', 'normal'], 2),
    changeTimeScale = 5,
    momentumX = -5,
    xScale = 10,
    yScale = 10,
    zPower = 1,
    zScale = 1

  content.utility.ephemeralNoise.manage(field)

  return {
    value: (x, y) => {
      const time = content.system.time.value()

      x += time * momentumX
      x /= xScale
      y /= yScale

      const value = field.value(x, y, time / changeTimeScale)
      return zScale * ((1 - Math.abs((2 * value) - 1)) ** zPower)
    },
  }
})()
