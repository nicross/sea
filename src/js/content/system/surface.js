content.system.surface = (() => {
  const field = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'surface', 4),
    physicalScale = 10, // Nodes are 10m apart
    timeScale = 60, // Evolves over 60 seconds
    waveHeight = 2 // m

  return {
    height: function (x, y) {
      return this.value(x, y) * waveHeight
    },
    reset: function () {
      field.reset()
      return this
    },
    value: function (x, y) {
      const time = content.system.time.get(),
        z = time / timeScale

      x /= physicalScale
      x -= time / 4 // Moving westward at 0.25 m/s

      y /= physicalScale

      return field.value(x, y, z)
    },
  }
})()

engine.state.on('reset', () => content.system.surface.reset())
