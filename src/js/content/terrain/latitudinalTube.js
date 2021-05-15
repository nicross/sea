content.terrain.latitudinalTube = (() => {
  const tube = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'latitudinalTube', 1),
    tubeScaleX = 1000,
    tubeScaleY = 50,
    tubeScaleZ = 50

  const mix = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'latitudinalTubeMix', 8),
    mixScale = 1000

  const range = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'latitudinalTubeRange', 2),
    rangeScale = 100

  const maxRange = 0.1,
    minRange = 0.05

  let mixOffsetX = 0,
    mixOffsetY = 0,
    mixOffsetZ = 0,
    rangeOffsetX = 0,
    rangeOffsetY = 0,
    rangeOffsetZ = 0,
    tubeOffsetX = 0,
    tubeOffsetY = 0,
    tubeOffsetZ = 0

  function getMix(x, y, z) {
    // Scales the width of the tube at (x, y, z)
    let value = mix.value((x / mixScale) + mixOffsetX, (y / mixScale) + mixOffsetY, (z / mixScale) + mixOffsetZ)

    // Normalize vertices around zero
    value = 1 - engine.utility.wrapAlternate(2 * value, 0, 1)

    // Scale up values, e.g. 0->0 but 0.0625 -> 0.25
    value **= 0.5

    return value
  }

  function getRange(x, y, z) {
    // The width of the tube at (x, y, z)
    let value = range.value((x / rangeScale) + rangeOffsetX, (y / rangeScale) + rangeOffsetY, (z / rangeScale) + rangeOffsetZ)

    // Scale down values to prefer narrower widths
    return engine.utility.lerpExp(minRange, maxRange, value, 2)
  }

  function getValue(x, y, z) {
    // Whether the tube is solid or liquid at (x, y, z)
    return tube.value((x / tubeScaleX) + tubeOffsetX, (y / tubeScaleY) + tubeOffsetY, (z / tubeScaleZ) + tubeOffsetZ)
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
      const srand = engine.utility.srand('terrain', 'latitudinalTube', 'init')

      mixOffsetX = srand(-1, 1)
      mixOffsetY = srand(-1, 1)
      mixOffsetZ = srand(-1, 1)
      rangeOffsetX = srand(-1, 1)
      rangeOffsetY = srand(-1, 1)
      rangeOffsetZ = srand(-1, 1)
      tubeOffsetX = srand(-1, 1)
      tubeOffsetY = srand(-1, 1)
      tubeOffsetZ = srand(-1, 1)

      return this
    },
    reset: function () {
      tube.reset()
      mix.reset()
      range.reset()
      return this
    },
  }
})()

engine.state.on('import', () => content.terrain.latitudinalTube.import())
engine.state.on('reset', () => content.terrain.latitudinalTube.reset())
