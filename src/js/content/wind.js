content.wind = (() => {
  const field = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: 'wind',
    type: engine.utility.perlin1d,
  })

  const timeScale = 10 // Evolves over 10 seconds

  content.utility.ephemeralNoise.manage(field)

  return {
    reset: function () {
      return this
    },
    value: function () {
      const x = content.time.value() / timeScale
      return field.value(x)
    },
  }
})()

engine.state.on('reset', () => content.wind.reset())
