content.terrain.cheese = (() => {
  const cheeseField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['terrain', 'cheese', 'cheese'],
    type: engine.utility.simplex3d,
  })

  const depthField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['terrain', 'cheese', 'depth'],
    type: engine.utility.simplex2d,
  })

  const paddingField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['terrain', 'cheese', 'padding'],
    type: engine.utility.simplex2d,
  })

  const thresholdField = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: ['terrain', 'cheese', 'threshold'],
    type: engine.utility.simplex3d,
  })

  const cheeseScale = 50 / engine.utility.simplex3d.prototype.skewFactor,
    depthScale = 1000 / engine.utility.simplex2d.prototype.skewFactor,
    paddingScale = 500 / engine.utility.simplex2d.prototype.skewFactor,
    thresholdScale = 200 / engine.utility.simplex3d.prototype.skewFactor

  content.utility.ephemeralNoise
    .manage(cheeseField)
    .manage(depthField)
    .manage(paddingField)
    .manage(thresholdField)

  function getCheese(x, y, z) {
    return cheeseField.value(x / cheeseScale, y / cheeseScale, z / cheeseScale)
  }

  function getDepth(x, y) {
    const value = depthField.value(x / depthScale, y / depthScale)
    return engine.utility.lerp(2500, 5000, value)
  }

  function getPadding(x, y) {
    const value = paddingField.value(x / paddingScale, y / paddingScale)
    return engine.utility.lerp(10, 100, value)
  }

  function getThreshold(x, y, z, min, max) {
    const ratio = engine.utility.scale(z, min, max, 0, 1),
      value = thresholdField.value(x / thresholdScale, y / thresholdScale, z / thresholdScale)

    const mix = ratio < 0.5
      ? engine.utility.scale(ratio, 0, 0.5, 0, 1)
      : engine.utility.scale(ratio, 0.5, 1, 1, 0)

    return ((value ** 2) / 2) * (mix ** 0.5)
  }

  return {
    debug: () => {
      const {x, y, z} = engine.position.getVector()

      const floor = content.terrain.floor.value(x, y),
        max = floor - getPadding(x, y, z)

      const min = max - getDepth(x, y, z)

      const cheese = getCheese(x, y, z),
        threshold = getThreshold(x, y, z, min, max)

      const value = !engine.utility.between(cheese, 0.5 - threshold, 0.5 + threshold)

      return {
        floor,
        padding: getPadding(x, y, z),
        max,
        depth: getDepth(x, y, z),
        min,
        cheese,
        threshold,
        value,
      }
    },
    isSolid: (x, y, z) => {
      const floor = content.terrain.floor.value(x, y),
        max = floor - getPadding(x, y, z)

      if (z > max) {
        return true
      }

      const min = max - getDepth(x, y, z)

      if (z < min) {
        return true
      }

      const cheese = getCheese(x, y, z),
        threshold = getThreshold(x, y, z, min, max)

      return !engine.utility.between(cheese, 0.5 - threshold, 0.5 + threshold)
    },
  }
})()
