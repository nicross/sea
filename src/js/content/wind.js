content.wind = (() => {
  const field = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: 'wind',
    type: engine.utility.perlin1d,
  })

  const timeScale = 10

  content.utility.ephemeralNoise.manage(field)

  return {
    value: function () {
      const x = content.time.value() / timeScale
      return field.value(x)
    },
  }
})()
