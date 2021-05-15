app.stats.timeCaving = (() => {
  let time = 0

  return app.stats.invent('timeCaving', {
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

  // Technically also underwater, but use reverb to split time into separate statistics
  if (content.movement.isMedium('underwater') && content.audio.reverb.is('cave')) {
    app.stats.timeCaving.increment(delta)
  }
})
