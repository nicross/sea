app.stats.maxDistance = (() => {
  let maxDistance = 0

  return app.stats.invent('maxDistance', {
    get: function () {
      return maxDistance
    },
    set: function (value) {
      maxDistance = Number(value) || 0
      return this
    },
    update: function () {
      const distance = engine.position.getVector().distance()

      if (distance > maxDistance) {
        maxDistance = distance
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
