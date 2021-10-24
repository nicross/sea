content.terrain.floor = (() => {
  const biomes = {},
    cache = new Map()

  const amplitudeField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['floor', 'amplitude'],
    type: engine.utility.simplex2d,
  })

  const biomeXField = engine.utility.createNoiseWithOctaves({
    octaves: 1,
    seed: ['floor', 'biomeX'],
    type: engine.utility.simplex2d,
  })

  const biomeYField = engine.utility.createNoiseWithOctaves({
    octaves: 1,
    seed: ['floor', 'biomeY'],
    type: engine.utility.simplex2d,
  })

  const depthField = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: ['floor', 'depth'],
    type: engine.utility.simplex2d,
  })

  const exponentField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['floor', 'exponent'],
    type: engine.utility.simplex2d,
  })

  const noiseField = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: ['floor', 'noise'],
    type: engine.utility.simplex2d,
  })

  const sauceField = engine.utility.createNoiseWithOctaves({
    octaves: 1,
    seed: ['floor', 'sauce'],
    type: engine.utility.simplex2d,
  })

  const wildcardField = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['floor', 'wildcard'],
    type: engine.utility.simplex2d,
  })

  content.utility.ephemeralNoise
    .manage(amplitudeField)
    .manage(biomeXField)
    .manage(biomeYField)
    .manage(depthField)
    .manage(exponentField)
    .manage(noiseField)
    .manage(sauceField)
    .manage(wildcardField)

  function amplitudeValue(x, y, scale = 1) {
    scale /= engine.utility.simplex2d.prototype.skewFactor
    return amplitudeField.value(x / scale, y / scale)
  }

  function exponentValue(x, y, scale = 1) {
    scale /= engine.utility.simplex2d.prototype.skewFactor
    return exponentField.value(x / scale, y / scale)
  }

  function generateBiome(x, y) {
    const scale = 10000 / engine.utility.simplex2d.prototype.skewFactor

    x /= scale
    x += 0.5

    y /= scale
    y += 0.5

    const weighted = getWeightedBiomes(x, y)

    return (options) => {
      let value = 0

      for (const biome of weighted) {
        value += biome.weight * biome.generate({
          ...options,
          weight: biome.weight,
        })
      }

      return value
    }
  }

  function generateValue(x, y) {
    const biome = generateBiome(x, y)

    const options = {
      amplitude: amplitudeValue,
      exponent: exponentValue,
      noise: noiseValue,
      smooth,
      wildcard: wildcardValue,
      x,
      y,
    }

    return getDepth(x, y) + getSauce(x, y) + biome(options)
  }

  function getCache(x, y) {
    const xMap = cache.get(x)

    if (!xMap) {
      return
    }

    return xMap.get(y)
  }

  function getDepth(x, y) {
    const scale = 20000 / engine.utility.simplex2d.prototype.skewFactor

    let value = depthField.value(x / scale, y / scale)

    return engine.utility.lerp(-2000, -3000, value)
  }

  function getSauce(x, y) {
    const amplitude = 1,
      scale = 4 / engine.utility.simplex2d.prototype.skewFactor

    return (sauceField.value(x / scale, y / scale) ** 8) * amplitude
  }

  function getValue(x, y) {
    const shouldCache = x % 1 == 0 && y % 1 == 0

    let result = shouldCache
      ? getCache(x, y)
      : undefined

    if (result) {
      return result
    }

    result = generateValue(x, y)

    if (shouldCache) {
      setCache(x, y, result)
    }

    return result
  }

  function getWeightedBiomes(x, y) {
    x = biomeXField.value(x, y)
    y = biomeYField.value(x, y)

    const results = []

    for (const biome of Object.values(biomes)) {
      results.push({
        distance: engine.utility.distance2({x, y}, {x: biome.x, y: biome.y}),
        generate: biome.generate,
        name: biome.name,
      })
    }

    results.sort((a, b) => {
      return b.distance - a.distance
    })

    let totalDistance = results.reduce((sum, result) => {
      return sum + result.distance
    }, 0)

    for (const result of results) {
      result.weight = (1 - (result.distance / totalDistance)) ** 16
    }

    let totalWeight = results.reduce((sum, result) => {
      return sum + result.weight
    }, 0)

    for (const result of results) {
      result.weight /= totalWeight
    }

    return results
  }

  function noiseValue(x, y, scale = 1) {
    scale /= engine.utility.simplex2d.prototype.skewFactor
    return noiseField.value(x / scale, y / scale)
  }

  function setCache(x, y, value) {
    let xMap = cache.get(x)

    if (!xMap) {
      xMap = new Map()
      cache.set(x, xMap)
    }

    xMap.set(y, value)
  }

  function smooth(value, slope = 25) {
    // generalized logistic function
    return 1 / (1 + (Math.E ** (-slope * (value - 0.5))))
  }

  function wildcardValue(x, y, scale = 1) {
    scale /= engine.utility.simplex2d.prototype.skewFactor
    return wildcardField.value(x / scale, y / scale)
  }

  return {
    registerBiome: function (definition) {
      biomes[definition.name] = definition
      return this
    },
    reset: function () {
      cache.clear()
      return this
    },
    value: function (x, y) {
      return getValue(x, y)
    },
  }
})()

engine.state.on('reset', () => content.terrain.floor.reset())

/*

lowlands
rolling plains
canyons basins
rough outcrops
mountains plateaus
highlands

*/

content.terrain.floor.registerBiome({
  name: 'lowlands',
  x: 0,
  y: 1/2,
  generate: () => 0,
})

content.terrain.floor.registerBiome({
  name: 'rolling',
  x: 1/5,
  y: 1/3,
  generate: ({
    amplitude,
    exponent,
    noise,
    x,
    y,
  }) => {
    noise = noise(x, y, 750)
    noise = Math.abs((noise * 2) - 1)

    amplitude = amplitude(x, y, 500)
    amplitude = engine.utility.lerp(0, 20, amplitude)

    exponent = exponent(x, y, 250)
    exponent = engine.utility.lerp(1.5, 2.5, exponent)

    return (noise ** exponent) * amplitude
  }
})

content.terrain.floor.registerBiome({
  name: 'plains',
  x: 1/5,
  y: 2/3,
  generate: ({
    amplitude,
    noise,
    x,
    y,
  }) => {
    noise = noise(x, y, 1000)

    amplitude = amplitude(x, y, 500)
    amplitude = engine.utility.lerp(0, 10, amplitude)

    return noise * amplitude
  }
})

content.terrain.floor.registerBiome({
  name: 'canyons',
  x: 2/5,
  y: 1/3,
  generate: ({
    amplitude,
    noise,
    x,
    y,
  }) => {
    noise = noise(x, y, 500)
    noise = Math.cos(noise * 2 * Math.PI)
    noise *= noise
    noise = engine.utility.clamp(noise, 0, 1)
    noise **= 2

    amplitude = amplitude(x, y, 1000)
    amplitude = engine.utility.lerpExp(0, -500, amplitude, 2)

    return noise * amplitude
  }
})

content.terrain.floor.registerBiome({
  name: 'basins',
  x: 2/5,
  y: 2/3,
  generate: ({
    amplitude,
    exponent,
    noise,
    smooth,
    x,
    y,
  }) => {
    noise = noise(x, y, 250)
    noise = smooth(noise, 15)

    amplitude = amplitude(x, y, 1000)
    amplitude = engine.utility.lerpExp(0, -500, amplitude, 2)

    exponent = exponent(x, y, 250)
    exponent = engine.utility.lerp(1, 4, exponent)

    return (noise ** exponent) * amplitude
  }
})

content.terrain.floor.registerBiome({
  name: 'rough',
  x: 3/5,
  y: 1/3,
  generate: ({
    amplitude,
    exponent,
    noise,
    x,
    y,
  }) => {
    noise = noise(x, y, 100)

    amplitude = amplitude(x, y, 500)
    amplitude = engine.utility.lerp(0, 250, amplitude)

    exponent = exponent(x, y, 250)
    exponent = engine.utility.lerp(4, 8, exponent)

    return (noise ** exponent) * amplitude
  }
})

content.terrain.floor.registerBiome({
  name: 'outcrops',
  x: 3/5,
  y: 2/3,
  generate: ({
    amplitude,
    exponent,
    noise,
    smooth,
    weight = 1,
    wildcard,
    x,
    y,
  }) => {
    noise = noise(x, y, 50)
    noise = (Math.cos(noise * 2 * Math.PI) / 2) + 1

    amplitude = amplitude(x, y, 250)
    amplitude = engine.utility.lerpExp(0, 250, amplitude, 4)

    exponent = exponent(x, y, 250)
    exponent = engine.utility.lerpExp(6, 2, exponent, 2)

    wildcard = wildcard(x, y, 200)

    const stairHeight = engine.utility.lerp(2, 25, wildcard) / weight
    const value = amplitude * (noise ** exponent)
    const v0 = Math.floor(value / stairHeight) * stairHeight
    const delta = smooth((value - v0) / stairHeight, 20) * stairHeight

    return v0 + delta
  }
})

content.terrain.floor.registerBiome({
  name: 'mountains',
  x: 4/5,
  y: 1/3,
  generate: ({
    amplitude,
    exponent,
    noise,
    smooth,
    x,
    y,
  }) => {
    noise = noise(x, y, 750)
    noise = Math.abs(noise - 0.5) * 2

    amplitude = amplitude(x, y, 1000)
    amplitude = smooth(amplitude, 20)
    amplitude = engine.utility.lerp(500, 1500, amplitude)

    exponent = exponent(x, y, 250)
    exponent = engine.utility.lerp(1, 2, exponent)

    return amplitude * (noise ** exponent)
  }
})

content.terrain.floor.registerBiome({
  name: 'plateaus',
  x: 4/5,
  y: 2/3,
  generate: ({
    amplitude,
    exponent,
    noise,
    smooth,
    weight = 1,
    wildcard,
    x,
    y,
  }) => {
    noise = noise(x, y, 100)

    amplitude = amplitude(x, y, 1000)
    amplitude = engine.utility.lerp(0, 1000, amplitude)

    exponent = exponent(x, y, 200)
    exponent = engine.utility.lerp(1/2, 3/2, exponent)

    wildcard = wildcard(x, y, 400)

    const stairHeight = engine.utility.lerp(1, 100, wildcard) / weight
    const value = amplitude * (noise ** exponent)
    const v0 = Math.floor(value / stairHeight) * stairHeight
    const delta = smooth((value - v0) / stairHeight, 20) * stairHeight

    return v0 + delta
  }
})

content.terrain.floor.registerBiome({
  name: 'highlands',
  x: 1,
  y: 1/2,
  generate: () => 1000,
})
