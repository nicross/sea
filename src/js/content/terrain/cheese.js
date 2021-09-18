content.terrain.cheese = (() => {
  const depthField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['terrain', 'cheese', 'depth'],
    type: engine.utility.simplex2d,
  })

  const largeField = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: ['terrain', 'floor', 'large'],
    type: engine.utility.simplex3d,
  })

  const largeExponentField = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: ['terrain', 'floor', 'large', 'exponent'],
    type: engine.utility.simplex3d,
  })

  const largeThresholdField = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: ['terrain', 'floor', 'large', 'threshold'],
    type: engine.utility.simplex3d,
  })

  const paddingField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['terrain', 'cheese', 'padding'],
    type: engine.utility.simplex2d,
  })

  const smallField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['terrain', 'floor', 'small'],
    type: engine.utility.simplex3d,
  })

  const smallExponentField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['terrain', 'floor', 'small', 'exponent'],
    type: engine.utility.simplex3d,
  })

  const smallThresholdField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['terrain', 'floor', 'small', 'threshold'],
    type: engine.utility.simplex3d,
  })

  const depthScale = 1000 / engine.utility.simplex2d.prototype.skewFactor,
    largeExponentScale = 100 / engine.utility.simplex3d.prototype.skewFactor,
    largeScale = 300 / engine.utility.simplex3d.prototype.skewFactor,
    largeThresholdScale = 150 / engine.utility.simplex3d.prototype.skewFactor,
    paddingScale = 500 / engine.utility.simplex2d.prototype.skewFactor,
    smallExponentScale = 10 / engine.utility.simplex3d.prototype.skewFactor,
    smallScale = 30 / engine.utility.simplex3d.prototype.skewFactor,
    smallThresholdScale = 15 / engine.utility.simplex3d.prototype.skewFactor

  content.utility.ephemeralNoise
    .manage(depthField)
    .manage(largeExponentField)
    .manage(largeField)
    .manage(largeThresholdField)
    .manage(paddingField)
    .manage(smallExponentField)
    .manage(smallField)
    .manage(smallThresholdField)

  function getDepth(x, y) {
    const value = depthField.value(x / depthScale, y / depthScale)
    return engine.utility.lerp(2500, 5000, value)
  }

  function getLarge(x, y, z) {
    return largeField.value(x / largeScale, y / largeScale, z / largeScale)
  }

  function getLargeExponent(x, y, z) {
    const value = largeExponentField.value(x / largeExponentScale, y / largeExponentScale, z / largeExponentScale)
    return engine.utility.lerp(1, 2, value)
  }

  function getLargeThreshold(x, y, z) {
    return largeThresholdField.value(x / largeThresholdScale, y / largeThresholdScale, z / largeThresholdScale)
  }

  function getPadding(x, y) {
    const value = paddingField.value(x / paddingScale, y / paddingScale)
    return engine.utility.lerp(50, 150, value)
  }

  function getSmall(x, y, z) {
    return smallField.value(x / smallScale, y / smallScale, z / smallScale)
  }

  function getSmallExponent(x, y, z) {
    const value = smallExponentField.value(x / smallExponentScale, y / smallExponentScale, z / smallExponentScale)
    return engine.utility.lerp(1, 2, value)
  }

  function getSmallThreshold(x, y, z) {
    return smallThresholdField.value(x / smallThresholdScale, y / smallThresholdScale, z / smallThresholdScale)
  }

  return {
    debug: () => {
      const {x, y, z} = engine.position.getVector()

      const floor = content.terrain.floor.value(x, y),
        max = floor - getPadding(x, y, z)

      if (z > max) {
        return true
      }

      const min = max - getDepth(x, y, z)

      if (z < min) {
        return true
      }

      const ratio = engine.utility.scale(z, min, max, 0, 1)

      const mix = (
        ratio < 0.5
          ? engine.utility.scale(ratio, 0, 0.5, 0, 1)
          : engine.utility.scale(ratio, 0.5, 1, 1, 0)
      ) ** 0.5

      const value = getLarge(x, y, z) < ((getLargeThreshold(x, y, z) ** getLargeExponent(x, y, z)) * mix)
        || getSmall(x, y, z) < ((getSmallThreshold(x, y, z) ** getSmallExponent(x, y, z)) * mix)

      return {
        floor,
        max,
        min,
        mix,
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

      const ratio = engine.utility.scale(z, min, max, 0, 1)

      const mix = (
        ratio < 0.5
          ? engine.utility.scale(ratio, 0, 0.5, 0, 1)
          : engine.utility.scale(ratio, 0.5, 1, 1, 0)
      ) ** 0.5

      return getLarge(x, y, z) < ((getLargeThreshold(x, y, z) ** getLargeExponent(x, y, z)) * mix)
        || getSmall(x, y, z) < ((getSmallThreshold(x, y, z) ** getSmallExponent(x, y, z)) * mix)
    },
  }
})()
