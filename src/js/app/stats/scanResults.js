app.stats.scanResults = (() => {
  let counter = 0

  return app.stats.invent('scanResults', {
    get: () => counter,
    increment: function (value = 0) {
      counter += value
      return this
    },
    set: function (value) {
      counter = Number(value) || 0
      return this
    },
  })
})()

content.system.scan.on('complete', (results) => {
  let count = 0

  for (const result of Object.values(results)) {
    if (result && result.isSolid) {
      count += 1
    }
  }

  app.stats.scanResults.increment(count)
})
