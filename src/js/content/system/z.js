content.system.z = (() => {
  let z = 0

  return {
    get: function () {
      return z
    },
    increment: function (value) {
      z += value
      return this
    },
    set: function (value) {
      z = Number(value) || 0
      return this
    },
  }
})()

engine.state.on('import', ({z}) => content.system.z.set(z))
engine.state.on('export', (data) => data.z = content.system.z.get())
