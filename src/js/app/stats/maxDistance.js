app.stats.maxDistance = (() => {
  let max = 0

  return app.stats.invent('maxDistance', {
    get: () => max,
    set: function (value) {
      max = Number(value) || 0
      return this
    },
    update: function () {
      const distance = engine.position.getVector().distance()

      if (distance > max) {
        max = distance
      }

      return this
    },
  })
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  app.stats.maxDistance.update()
})
