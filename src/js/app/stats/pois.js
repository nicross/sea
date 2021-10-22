app.stats.pois = (() => {
  let count = 0,
    types = {}

  return app.stats.invent('pois', {
    count: () => count,
    get: () => ({
      count,
      types: {...types},
    }),
    onDiscover: function (poi) {
      const key = poi.type

      count += 1

      if (types[key]) {
        types[key] += 1
      } else {
        types[key] = 1
      }

      return this
    },
    set: function (data = {}) {
      count = data.count || 0
      types = data.types ? {...data.types} : {}

      return this
    },
    types: () => ({...types}),
  })
})()

content.pois.on('discover', (...args) => app.stats.pois.onDiscover(...args))
