app.stats.totalTime = (() => {
  let totalTime = 0

  return app.stats.invent('totalTime', {
    get: function () {
      return totalTime
    },
    increment: function (value) {
      totalTime += value
      return this
    },
    set: function (value) {
      totalTime = Number(value) || 0
      return this
    },
  })
})()

engine.loop.on('frame', ({delta, paused}) => {
  if (paused && !app.state.game.is('running')) {
    return
  }

  app.stats.totalTime.increment(delta)
})
