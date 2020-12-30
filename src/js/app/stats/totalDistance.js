app.stats.totalDistance = (() => {
  let distance = 0

  return app.stats.invent('totalDistance', {
    get: () => distance,
    increment: function (value) {
      distance += value
      return this
    },
    set: function (value) {
      distance = Number(value) || 0
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
