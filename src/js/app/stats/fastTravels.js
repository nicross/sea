app.stats.fastTravels = (() => {
  let counter = 0

  return app.stats.invent('fastTravels', {
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

// TODO: Listen to fast travel events so incrementing logic lives here?
