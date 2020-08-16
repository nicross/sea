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

  const {deltaVelocity} = engine.movement.get()
  const deltaVelocityZ = Math.abs(content.system.movement.zVelocity() * delta)

  if (deltaVelocity || deltaVelocityZ) {
    app.stats.totalDistance.increment(deltaVelocity + deltaVelocityZ)
  }
})
