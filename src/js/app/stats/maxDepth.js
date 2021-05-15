app.stats.maxDepth = (() => {
  let max = 0

  return app.stats.invent('maxDepth', {
    get: () => max,
    set: function (value) {
      max = Number(value) || 0
      return this
    },
    update: function () {
      const depth = -engine.position.getVector().z

      if (depth > max) {
        max = depth
      }

      return this
    },
  })
})()

engine.loop.on('frame', ({paused}) => {
  if (paused || !app.state.game.is('running')) {
    return
  }

  app.stats.maxDepth.update()
})
