app.stats.totalTime = (() => {
  let time = 0

  return app.stats.invent('totalTime', {
    get: () => time,
    increment: function (value) {
      time += value
      return this
    },
    set: function (value) {
      time = Number(value) || 0
      return this
    },
  })
})()

engine.loop.on('frame', ({delta, paused}) => {
  if (paused || !app.state.game.is('running')) {
    return
  }

  app.stats.totalTime.increment(delta)
})
