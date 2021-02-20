content.system.time = (() => {
  let offset = 0,
    time = 0

  return {
    clock: () => {
      const value = (time + offset) / content.const.dayDuration
      return value % 1
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

  content.system.time.incrementTime(delta)
})

engine.state.on('import', ({time}) => content.system.time.import(time))
engine.state.on('export', (data) => data.time = content.system.time.export())
