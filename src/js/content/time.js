content.time = (() => {
  let offset = 0,
    time = 0

  return {
    clock: () => {
      const value = (time + offset) / content.const.dayDuration
      return value % 1
    },
    cycle: function () {
      return engine.utility.scale(Math.cos(2 * Math.PI * this.clock()), -1, 1, 1, 0)
    },
    export: () => ({
      offset,
      time,
    }),
    import: function (data = {}) {
      offset = Number(data.offset) || 0
      time = Number(data.time) || 0
      return this
    },
    incrementOffset: function (value) {
      offset += value
      return this
    },
    incrementTime: function (value) {
      time += value
      return this
    },
    offset: () => offset,
    time: () => time,
    value: () => time + offset,
  }
})()

engine.loop.on('frame', ({delta, paused}) => {
  if (paused) {
    return
  }

  content.time.incrementTime(delta)
})

engine.state.on('import', ({time}) => content.time.import(time))
engine.state.on('export', (data) => data.time = content.time.export())
