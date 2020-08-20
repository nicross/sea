content.system.terrain.lattice = (() => {
  const lattice = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'lattice', 8),
    latticeScale = 50

  const mix = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'latticeMix', 8),
    mixScale = 1000

  const range = engine.utility.createPerlinWithOctaves(engine.utility.perlin3d, 'latticeRange', 8),
    rangeScale = 100

  const maxRange = 0.45,
    minRange = 0.05

  function getMix(x, y, z) {
    // Scales the width of the lattice at (x, y, z)
    let value = mix.value(x / mixScale, y / mixScale, z / mixScale)

    // Normalize vertices around zero
    value = 1 - engine.utility.wrapAlternate(2 * value, 0, 1)

    // Scale up values, e.g. 0->0 but 0.0625 -> 0.5
    value **= 0.25

    return value
  }

  function getRange(x, y, z) {
    // The width of the lattice at (x, y, z)
    let value = range.value(x / rangeScale, y / rangeScale, z / rangeScale)

    // Scale down values to prefer narrower widths
    return engine.utility.lerpExp(minRange, maxRange, value, 2)
  }

  function getValue(x, y, z) {
    // Whether the lattice is solid or liquid at (x, y, z)
    return lattice.value(x / latticeScale, y / latticeScale, z / latticeScale)
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
