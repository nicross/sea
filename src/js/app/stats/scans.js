app.stats.scans = (() => {
  let counter = 0

  return app.stats.invent('scans', {
    get: () => counter,
    increment: function () {
      counter += 1
      return this
    },
    set: function (value) {
      counter = Number(value) || 0
      return this
    },
  })
})()

content.scan.on('trigger', () => {
  app.stats.scans.increment()
})
