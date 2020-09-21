content.system.time = (() => {
  let time = 0

  return {
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
  }
})()

engine.loop.on('frame', ({delta, paused}) => {
  if (paused) {
    return
  }

  content.system.time.increment(delta)
})

engine.state.on('import', ({time}) => content.system.time.set(time))
engine.state.on('export', (data) => data.time = content.system.time.get())
