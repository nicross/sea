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

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  const {deltaVelocity} = engine.movement.get()

  if (deltaVelocity) {
    app.stats.totalDistance.increment(deltaVelocity)
  }
})
