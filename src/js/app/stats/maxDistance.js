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
      const position = engine.position.get()
      const distance = engine.utility.distanceOrigin(position.x, position.y)

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
