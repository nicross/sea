content.system.stats.time = (() => {
  let time = 0

  return content.system.stats.invent('time', {
    get: function () {
      return time
    },
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
  if (paused) {
    return
  }

  content.system.stats.time.increment(delta)
})
