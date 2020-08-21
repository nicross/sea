content.system.terrain.verticalTube = (() => {
  const tube = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'verticalTube', 1),
    tubeScaleX = 10,
    tubeScaleY = 10,
    tubeScaleZ = 1000

  const mix = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'tubeMix', 8),
    mixScale = 1000

  const range = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'tubeRange', 2),
    rangeScale = 100

  const maxRange = 0.45,
    minRange = 0.05

  function getMix(x, y, z) {
    // Scales the width of the tube at (x, y, z)
    let value = mix.value(x / mixScale, y / mixScale, z / mixScale)

    // Normalize vertices around zero
    value = 1 - engine.utility.wrapAlternate(2 * value, 0, 1)

    // Scale up values, e.g. 0->0 but 0.0625 -> 0.25
    value **= 0.5

    return value
  }

  function getRange(x, y, z) {
    // The width of the tube at (x, y, z)
    let value = range.value(x / rangeScale, y / rangeScale, z / rangeScale)

    // Scale down values to prefer narrower widths
    return engine.utility.lerpExp(minRange, maxRange, value, 2)
  }

  function getValue(x, y, z) {
    // Whether the tube is solid or liquid at (x, y, z)
    return tube.value(x / tubeScaleX, y / tubeScaleY, z / tubeScaleZ)
  }

  return {
    isSolid: (x, y, z) => {
      const mix = getMix(x, y, z),
        range = getRange(x, y, z),
        value = getValue(x, y, z)

      const boundary = mix * range,
        lowerBound = 0.5 - boundary,
        upperBound = 0.5 + boundary

      return !engine.utility.between(value, lowerBound, upperBound)
    }
  }
})()
