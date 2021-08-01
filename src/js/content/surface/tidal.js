content.surface.tidal = (() => {
  const field = engine.utility.simplex2d.create('surface', 'tidal'),
    momentumX = -10,
    slope = 99,
    timeScale = 30,
    xScale = 500 / engine.utility.simplex2d.prototype.skewFactor,
    yScale = 500 / engine.utility.simplex2d.prototype.skewFactor,
    zScale = 8

  content.utility.ephemeralNoise.manage(field)

  return {
    value: (x, y) => {
      const time = content.time.value()

      x /= xScale
      x += time * momentumX / xScale
      y /= yScale

      const mix = content.utility.smooth(field.value(y, time / timeScale) ** 0.5, 12.5),
        wave = Math.cos(2 * Math.PI * x) ** slope

      return engine.utility.clamp(wave * mix, 0, 1) * zScale
    },
  }
})()
