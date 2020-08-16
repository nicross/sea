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
      const position = engine.position.get(),
        z = Math.min(0, content.system.z.get())

      const distance = Math.sqrt((position.x ** 2) + (position.y ** 2) + (z ** 2))

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
