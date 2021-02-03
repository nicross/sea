content.system.wind = (() => {
  const field = engine.utility.createPerlinWithOctaves(engine.utility.perlin1d, 'wind', 4),
    timeScale = 10 // Evolves over 10 seconds

  content.utility.ephemeralNoise.manage(field)

  return {
    reset: function () {
      field.reset()
      return this
    },
    value: function () {
      const x = content.system.time.get() / timeScale
      return field.value(x)
    },
  }
})()

engine.state.on('reset', () => content.system.wind.reset())
