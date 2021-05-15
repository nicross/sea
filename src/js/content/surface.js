content.surface = (() => {
  let current

  function cacheCurrent() {
    const position = engine.position.getVector()
    current = getValue(position.x, position.y)
  }

  function getValue(x, y) {
    const cycle = content.time.cycle(),
      cycleFactor = Math.cos(Math.PI * cycle) ** 4,
      normal = content.surface.normal.value(x, y),
      tidal = content.surface.tidal.value(x, y) * cycleFactor,
      wind = content.surface.wind.value(x, y)

    return normal + tidal + wind
  }

  return {
    current: function () {
      if (current === undefined) {
        cacheCurrent()
      }

      return current
    },
    import: function () {
      cacheCurrent()
      return this
    },
    max: () => 1 + 4 + 8,
    reset: function () {
      current = undefined
      return this
    },
    update: function () {
      const {z} = engine.position.getVector()

      if (z > content.const.lightZone) {
        cacheCurrent()
      }

      return this
    },
    value: function (x, y) {
      return getValue(x, y)
    },
  }
})()

engine.loop.on('frame', () => content.surface.update())
engine.state.on('import', () => content.surface.import())
engine.state.on('reset', () => content.surface.reset())
