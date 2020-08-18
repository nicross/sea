content.system.terrain = (() => {
  const floor = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, 'floor', 8),
    floorHeight = 250,
    floorScale = 1000

  const hill = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, 'hill', 4),
    hillHeight = 250,
    hillScale = 100

  const hillMix = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, 'hillMix', 2),
    hillMixScale = 1000

  const trench = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, 'trench', 4),
    trenchHeight = 1500,
    trenchScaleX = 2500,
    trenchScaleY = 10000

  const trenchMix = engine.utility.createPerlinWithOctaves(engine.utility.perlin2d, 'trenchMix', 4),
    trenchMixScaleX = 2500,
    trenchMixScaleY = 10000

  function getFloorZ(x, y) {
    let value = content.const.lightZone - floorHeight - hillHeight

    value += floor.value(x / floorScale, y / floorScale) * floorHeight
    value += hill.value(x / hillScale, y / hillScale) * hillMix.value(x / hillMixScale, y / hillMixScale) * hillHeight
    value -= (trench.value(x / trenchScaleX, y / trenchScaleY) ** 0.5) * (trenchMix.value(x / trenchMixScaleX, y / trenchMixScaleY) ** 2) * trenchHeight

    return value
  }

  function isCollision(x, y, z, leeway = engine.const.zero) {
    const floorZ = getFloorZ(x, y)

    if (engine.utility.between(z, floorZ - leeway, floorZ + leeway)) {
      return true
    }

    if (z < floorZ) {
      // TODO: Check caves
    }

    return false
  }

  return {
    getFloorZ,
    isCollision,
    // TODO: Raytracer
  }
})()

// XXX: debug
engine.loop.on('frame', ({frame, paused}) => {
  if (!paused && frame % 60 == 0) {
    const {x, y} = engine.position.get()
    console.log(content.system.terrain.getFloorZ(x, y))
  }
})
