content.system.stats = engine.utility.pubsub.decorate({
  export: function () {
    data = {}
    this.emit('export', data)
    return data
  },
  import: function (data = {}) {
    this.emit('import', data)
    return this
  },
  invent: function (key, stat = {}) {
    this.on('export', (data) => data[key] = stat.export())
    this.on('import', (data) => stat.import(data[key]))
    return stat
  },
})
