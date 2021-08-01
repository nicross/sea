content.terrain.lattice = (() => {
  const lattice = engine.utility.createNoiseWithOctaves({
    octaves: 8,
    seed: ['content', 'terrain', 'lattice'],
    type: engine.utility.simplex3d,
  })

  const mix = engine.utility.createNoiseWithOctaves({
    octaves: 8,
    seed: ['content', 'terrain', 'lattice', 'mix'],
    type: engine.utility.simplex3d,
  })

  const range = engine.utility.createNoiseWithOctaves({
    octaves: 8,
    seed: ['content', 'terrain', 'lattice', 'range'],
    type: engine.utility.simplex3d,
  })

  const latticeScale = 50 / engine.utility.simplex3d.prototype.skewFactor,
    mixScale = 1000 / engine.utility.simplex3d.prototype.skewFactor,
    rangeScale = 100 / engine.utility.simplex3d.prototype.skewFactor

  const maxRange = 0.45,
    minRange = 0.05

  let latticeOffsetX = 0,
    latticeOffsetY = 0,
    latticeOffsetZ = 0,
    mixOffsetX = 0,
    mixOffsetY = 0,
    mixOffsetZ = 0,
    rangeOffsetX = 0,
    rangeOffsetY = 0,
    rangeOffsetZ = 0

  function getMix(x, y, z) {
    // Scales the width of the lattice at (x, y, z)
    let value = mix.value((x / mixScale) + mixOffsetX, (y / mixScale) + mixOffsetY, (z / mixScale) + mixOffsetZ)

    // Normalize vertices around zero
    value = 1 - engine.utility.wrapAlternate(2 * value, 0, 1)

    // Scale up values, e.g. 0->0 but 0.0625 -> 0.5
    value **= 0.25

    return value
  }

  function getRange(x, y, z) {
    // The width of the lattice at (x, y, z)
    let value = range.value((x / rangeScale) + rangeOffsetX, (y / rangeScale) + rangeOffsetY, (z / rangeScale) + rangeOffsetZ)

    // Scale down values to prefer narrower widths
    return engine.utility.lerpExp(minRange, maxRange, value, 2)
  }

  function getValue(x, y, z) {
    // Whether the lattice is solid or liquid at (x, y, z)
    return lattice.value((x / latticeScale) + latticeOffsetX, (y / latticeScale) + latticeOffsetY, (z / latticeScale) + latticeOffsetZ)
  }

  return {
    getMix,
    getRange,
    getValue,
    isSolid: (x, y, z) => {
      const mix = getMix(x, y, z),
        range = getRange(x, y, z),
        value = getValue(x, y, z)

      const boundary = mix * range,
        lowerBound = 0.5 - boundary,
        upperBound = 0.5 + boundary

      return !engine.utility.between(value, lowerBound, upperBound)
    },
    import: function () {
      const srand = engine.utility.srand('content', 'terrain', 'lattice', 'init')

      latticeOffsetX = srand(-1, 1)
      latticeOffsetY = srand(-1, 1)
      latticeOffsetZ = srand(-1, 1)
      mixOffsetX = srand(-1, 1)
      mixOffsetY = srand(-1, 1)
      mixOffsetZ = srand(-1, 1)
      rangeOffsetX = srand(-1, 1)
      rangeOffsetY = srand(-1, 1)
      rangeOffsetZ = srand(-1, 1)

      return this
    },
    reset: function () {
      lattice.reset()
      mix.reset()
      range.reset()
      return this
    },
  }
})()

engine.state.on('import', () => content.terrain.lattice.import())
engine.state.on('reset', () => content.terrain.lattice.reset())
