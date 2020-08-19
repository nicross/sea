content.system.surface = (() => {
  const field = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'surface', 4),
    momentumX = -10, // Moves westward N m/s
    scaleX = 60, // Nodes are N m apart
    scaleY = 300, // Nodes are N m apart
    timeScale = 60 // Evolves over N seconds

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

      x /= scaleX
      x += time * momentumX / scaleX

      y /= scaleY

      return field.value(x, y, z)
    },
  }
})()

engine.state.on('reset', () => content.system.surface.reset())
