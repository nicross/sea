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

  const maskField = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: ['floor', 'mask'],
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

  let current

  content.utility.ephemeralNoise
    .manage(amplitudeField)
    .manage(biomeXField)
    .manage(biomeYField)
    .manage(depthField)
    .manage(exponentField)
    .manage(maskField)
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

  function cacheCurrent() {
    const position = engine.position.getVector()
    current = getValue(position.x, position.y)
  }

  function generateBiome(x, y) {
    const scale = 20000 / engine.utility.simplex2d.prototype.skewFactor

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
      mask: maskValue,
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
    const scale = 50000 / engine.utility.simplex2d.prototype.skewFactor,
      value = depthField.value(x / scale, y / scale)

    return engine.utility.lerp(-2500, -3500, value)
  }

  function getSauce(x, y) {
    const amplitude = (maskValue(x, y, 100) ** 2) * 2,
      exponent = engine.utility.lerp(4, 8, exponentValue(x, y, 100)),
      scale = 4 / engine.utility.simplex2d.prototype.skewFactor,
      value = sauceField.value(x / scale, y / scale)

    return (value ** exponent) * amplitude
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

  function maskValue(x, y, scale = 1) {
    scale /= engine.utility.simplex2d.prototype.skewFactor
    return maskField.value(x / scale, y / scale)
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
    current: function () {
      if (current === undefined) {
        cacheCurrent()
      }

      return current
    },
    registerBiome: function (definition) {
      biomes[definition.name] = definition
      return this
    },
    reset: function () {
      cache.clear()
      current = undefined

      return this
    },
    update: function () {
      const {z} = engine.position.getVector()

      if (z < content.const.lightZone) {
        cacheCurrent()
      }

      return this
    },
    value: function (x, y) {
      return getValue(x, y)
    },
  }
})()

engine.loop.on('frame', () => content.terrain.floor.update())
engine.state.on('reset', () => content.terrain.floor.reset())

/*

lowlands
canyons basins
rolling plains
rough outcrops
mountains plateaus
highlands

*/

content.terrain.floor.registerBiome({
  name: 'lowlands',
  x: 0,
  y: 1/2,
  generate: () => {
    // Constant zero
    return 0
  },
})

content.terrain.floor.registerBiome({
  name: 'canyons',
  x: 1/5,
  y: 1/3,
  generate: ({
    amplitude,
    exponent,
    mask,
    noise,
    wildcard,
    x,
    y,
  }) => {
    // Generate noise, applying cos() and squaring to produce river-like features within [0, 1]
    noise = noise(x, y, 500)
    noise = Math.cos(noise * 2 * Math.PI)
    noise *= noise

    // Scale noise, carving out from world
    amplitude = amplitude(x, y, 1000)
    amplitude = engine.utility.lerpExp(-500, 0, amplitude, 0.5)

    // Massage depth and slope with exponent
    exponent = exponent(x, y, 500)
    exponent = engine.utility.lerp(1, 3, exponent)

    // Determine masking amount
    wildcard = wildcard(x, y, 100)
    wildcard = engine.utility.lerp(-10, 0, wildcard)

    // Generate masking layer, carving hills from noise
    mask = mask(x, y, 15)

    // Combine layers
    return ((noise ** exponent) * amplitude) + (mask * wildcard)
  }
})

content.terrain.floor.registerBiome({
  name: 'basins',
  x: 1/5,
  y: 2/3,
  generate: ({
    amplitude,
    exponent,
    mask,
    noise,
    smooth,
    weight = 1,
    wildcard,
    x,
    y,
  }) => {
    // Generate noise
    noise = noise(x, y, 500)

    // Scale noise, carving out from world
    amplitude = amplitude(x, y, 1000)
    amplitude = engine.utility.lerpExp(-500, 0, amplitude, 0.5)

    // Massage depth and slope with exponent
    exponent = exponent(x, y, 750)
    exponent = engine.utility.lerp(0.5, 2, exponent)

    // Combine and smooth layers into raw value
    const value = smooth((noise ** exponent), 15) * amplitude

    // Determine gradiation, scaling by 1/weight to preserve gradiation when weighted
    let gradiation = wildcard(x, y, 500)
    gradiation = engine.utility.lerp(0.05, 0.1, gradiation) * Math.abs(amplitude) / weight

    // Transform into stairs at gradiation height (v0), smoothing the edges (delta)
    const v0 = Math.floor(value / gradiation) * gradiation
    const delta = engine.utility.clamp(smooth(((value - v0) / gradiation) ** 2, 25), 0, 1) * gradiation

    // Generate mask, subtracting from gradiation
    mask = mask(x, y, 50) * -gradiation

    // Combine stair components and mask
    return v0 + delta + mask
  }
})

content.terrain.floor.registerBiome({
  name: 'rolling',
  x: 2/5,
  y: 1/3,
  generate: ({
    amplitude,
    exponent,
    mask,
    noise,
    x,
    y,
  }) => {
    // Generate noise
    noise = noise(x, y, 100)
    noise = Math.abs((noise * 2) - 1)

    // Scale noise into hills
    amplitude = amplitude(x, y, 400)
    amplitude = engine.utility.lerp(25, 75, amplitude)

    // Massage slopes with exponent
    exponent = exponent(x, y, 1000)
    exponent = engine.utility.lerp(1, 2, exponent)

    // Attenuate up an octave with mask
    mask = mask(x, y, 50)
    mask = engine.utility.lerpExp(0.75, 1, mask, 2)

    // Combine layers
    return (noise ** exponent) * amplitude * mask
  }
})

content.terrain.floor.registerBiome({
  name: 'plains',
  x: 2/5,
  y: 2/3,
  generate: ({
    amplitude,
    mask,
    noise,
    x,
    y,
  }) => {
    // Generate noise
    noise = noise(x, y, 250)

    // Scale into short wide hills
    amplitude = amplitude(x, y, 750)
    amplitude = engine.utility.lerp(25, 75, amplitude)

    // Attenuate at higher octave with mask
    mask = mask(x, y, 100)
    mask = engine.utility.lerp(0.8, 1, mask)

    // Combine layers
    return noise * amplitude * mask
  }
})

content.terrain.floor.registerBiome({
  name: 'rough',
  x: 3/5,
  y: 1/3,
  generate: ({
    amplitude,
    exponent,
    mask,
    noise,
    wildcard,
    x,
    y,
  }) => {
    // Generate noise
    noise = noise(x, y, 100)

    // Scale into tall narrow hills
    amplitude = amplitude(x, y, 500)
    amplitude = engine.utility.lerp(50, 250, amplitude)

    // Massage slopes with exponent
    exponent = exponent(x, y, 400)
    exponent = engine.utility.lerp(1, 4, exponent)

    // Add harmonic roughness at a low amplitude
    wildcard = (wildcard(x, y, 10) ** 2) * engine.utility.lerp(0, 10, wildcard(x, y, 150))

    // Attenuate with mask as percentage
    mask = engine.utility.lerp(0.9, 1, mask(x, y, 25))

    // Combine layers
    return (((noise ** exponent) * amplitude) + wildcard) * mask
  }
})

content.terrain.floor.registerBiome({
  name: 'outcrops',
  x: 3/5,
  y: 2/3,
  generate: ({
    amplitude,
    exponent,
    mask,
    noise,
    smooth,
    weight = 1,
    wildcard,
    x,
    y,
  }) => {
    // Generate noise, abs(cos(x)) to shape into distinct areas
    noise = noise(x, y, 75)
    noise = (Math.cos(noise * 2 * Math.PI) / 2) + 1

    // Scale into clusters of tall pillars
    amplitude = amplitude(x, y, 500)
    amplitude = engine.utility.lerpExp(30, 300, amplitude, 3)

    // Massage height and slope with exponent
    exponent = exponent(x, y, 250)
    exponent = engine.utility.lerp(1, 4, exponent)

    // Combine layers into raw value
    const value = amplitude * (noise ** exponent)

    // Determine gradiation, scaling by 1/weight to preserve gradiation when weighted
    let gradiation = wildcard(x, y, 250)
    gradiation = engine.utility.lerp(0.05, 0.1, gradiation) * Math.abs(amplitude) / weight

    // Transform into stairs at gradiation height (v0), smoothing the edges (delta)
    const v0 = Math.floor(value / gradiation) * gradiation
    const delta = engine.utility.clamp(smooth(((value - v0) / gradiation) ** 2, 20), 0, 1) * gradiation

    // Generate mask, subtracting from gradiation
    mask = mask(x, y, 50) * -gradiation/2

    // Combine stair components and mask
    return v0 + delta + mask
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
    mask,
    wildcard,
    x,
    y,
  }) => {
    // Generate noise, absolute value creates valleys
    noise = noise(x, y, 500)
    noise = Math.abs(noise - 0.5) * 2

    // Scale into large tall hills
    amplitude = amplitude(x, y, 1000)
    amplitude = engine.utility.lerp(300, 900, amplitude)

    // Massage height and slope with exponent
    exponent = exponent(x, y, 250)
    exponent = engine.utility.lerp(1, 3, exponent)

    // Generate rocks, with wildcard amplitude and mask noise/exponent
    wildcard = wildcard(x, y, 200)
    wildcard = (Math.cos(2 * Math.PI * wildcard) + 1) / 2
    wildcard = engine.utility.lerp(5, 50, wildcard)

    mask = mask(x, y, 25) ** engine.utility.lerp(1, 3, mask(x, y, 250))

    const rocks = wildcard * mask

    // Combine layers
    return (amplitude * (noise ** exponent)) + rocks
  }
})

content.terrain.floor.registerBiome({
  name: 'plateaus',
  x: 4/5,
  y: 2/3,
  generate: ({
    amplitude,
    exponent,
    mask,
    noise,
    smooth,
    weight = 1,
    wildcard,
    x,
    y,
  }) => {
    // Generate noise
    noise = noise(x, y, 500)

    // Scale into large pillars
    amplitude = amplitude(x, y, 1000)
    amplitude = engine.utility.lerp(0, 750, amplitude)

    // Massage height and slope with exponent
    exponent = exponent(x, y, 500)
    exponent = engine.utility.lerp(1, 3, exponent)

    // Combine layers into raw value
    const value = amplitude * (noise ** exponent)

    // Determine gradiation, scaling by 1/weight to preserve gradiation when weighted
    let gradiation = wildcard(x, y, 750)
    gradiation = engine.utility.lerp(0.05, 0.1, gradiation) * Math.abs(amplitude) / weight

    // Transform into stairs at gradiation height (v0), smoothing the edges (delta)
    const v0 = Math.floor(value / gradiation) * gradiation
    const delta = engine.utility.clamp(smooth(((value - v0) / gradiation) ** 3, 20), 0, 1) * gradiation

    // Generate mask, adding to gradiation
    mask = mask(x, y, 75) ** engine.utility.lerp(1, 3, mask(x, y, 300))
    mask *= gradiation/2

    // Combine stair components and mask
    return v0 + delta + mask
  }
})

content.terrain.floor.registerBiome({
  name: 'highlands',
  x: 1,
  y: 1/2,
  generate: () => {
    // Constant, range of depth field
    return 1000
  },
})
