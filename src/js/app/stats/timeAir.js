app.stats.timeAir = (() => {
  let time = 0

  return app.stats.invent('timeAir', {
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

  if (content.system.movement.isMedium('air')) {
    app.stats.timeAir.increment(delta)
  }
})
