app.stats.scanResults = (() => {
  let counter = 0

  return app.stats.invent('scanResults', {
    get: () => counter,
    increment: function (value = 0) {
      counter += BigInt(value)
      return this
    },
    set: function (value) {
      counter = BigInt(value) || 0
      return this
    },
  })
})()

content.scan.on('complete', (results) => {
  if (!results.isFloor) {
    return
  }

  const count = [
    ...results.scan2d.flat(),
    ...results.scan3d,
  ].filter((result) => result.remember).length

  app.stats.scanResults.increment(count)
})
