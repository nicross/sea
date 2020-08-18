content.system.surface = (() => {
  const field = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'surface', 2),
    momentumX = -1/2, // Moves westward N m/s
    physicalScale = 60, // Nodes are N m apart
    timeScale = 300 // Evolves over N seconds

  return {
    height: function (x, y) {
      return this.value(x, y) * content.const.waveHeight
    },
    reset: function () {
      field.reset()
      return this
    },
    value: function (x, y) {
      const time = content.system.time.get(),
        z = time / timeScale

      x /= physicalScale
      x += time * momentumX

      y /= physicalScale

      return field.value(x, y, z)
    },
  }
})()

engine.state.on('reset', () => content.system.surface.reset())
