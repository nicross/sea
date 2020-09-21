app.stats.totalDistance = (() => {
  let totalDistance = 0

  return app.stats.invent('totalDistance', {
    get: function () {
      return totalDistance
    },
    increment: function (value) {
      totalDistance += value
      return this
    },
    set: function (value) {
      totalDistance = Number(value) || 0
      return this
    },
  })
})()

engine.loop.on('frame', ({delta, paused}) => {
  if (paused) {
    return
  }

  const velocity = engine.position.getVelocity().distance()

  if (velocity) {
    app.stats.totalDistance.increment(delta * velocity)
  }
})
