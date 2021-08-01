content.surface.normal = (() => {
  const field = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['surface', 'normal'],
    type: engine.utility.simplex3d,
  })

  const changeTimeScale = 5 / engine.utility.simplex3d.prototype.skewFactor,
    momentumX = -5,
    xScale = 10 / engine.utility.simplex3d.prototype.skewFactor,
    yScale = 10 / engine.utility.simplex3d.prototype.skewFactor,
    zPower = 1,
    zScale = 1

  content.utility.ephemeralNoise.manage(field)

  return {
    value: (x, y) => {
      const time = content.time.value()

      x += time * momentumX
      x /= xScale
      y /= yScale

      const value = field.value(x, y, time / changeTimeScale)
      return zScale * ((1 - Math.abs((2 * value) - 1)) ** zPower)
    },
  }
})()
