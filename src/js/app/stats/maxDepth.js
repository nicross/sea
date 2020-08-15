app.stats.maxDepth = (() => {
  let maxDepth = 0

  return app.stats.invent('maxDepth', {
    get: function () {
      return maxDepth
    },
    set: function (value) {
      maxDepth = Number(value) || 0
      return this
    },
    update: function () {
      const z = -content.system.z.get()

      if (z > maxDepth) {
        maxDepth = z
      }

      return this
    },
  })
})()

engine.loop.on('frame', ({paused}) => {
  if (paused) {
    return
  }

  app.stats.maxDepth.update()
})
