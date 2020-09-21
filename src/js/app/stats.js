app.stats = engine.utility.pubsub.decorate({
  export: function () {
    const data = {}
    this.emit('export', data)
    return data
  },
  import: function (data = {}) {
    this.emit('import', data)
    return this
  },
  invent: function (key, stat = {}) {
    this.on('export', (data) => data[key] = stat.get())
    this.on('import', (data) => stat.set(data[key]))
    return stat
  },
})

engine.ready(() => app.stats.import(
  app.storage.getStats()
))
