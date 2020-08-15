content.system.stats.distance = (() => {
  let distance = 0

  return content.system.stats.invent('distance', {
    get: function () {
      return distance
    },
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

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  const {deltaVelocity} = engine.movement.get()

  if (deltaVelocity) {
    content.system.meta.distance.increment(deltaVelocity)
  }
})
