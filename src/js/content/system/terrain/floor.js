content.system.terrain.floor = (() => {
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

  let floorOffsetX = 0,
    floorOffsetY = 0,
    hillOffsetX = 0,
    hillOffsetY = 0,
    hillMixOffsetX = 0,
    hillMixOffsetY = 0,
    trenchOffsetX = 0,
    trenchOffsetY = 0,
    trenchMixOffsetX = 0,
    trenchMixOffsetY = 0

  function getFloor(x, y) {
    return floor.value((x / floorScale) + floorOffsetX, (y / floorScale) + floorOffsetY)
  }

  function getHill(x, y) {
    return hill.value((x / hillScale) + hillOffsetX, (y / hillScale) + hillOffsetY)
  }

  function getHillMix(x, y) {
    return hillMix.value((x / hillMixScale) + hillMixOffsetX, (y / hillMixScale) + hillMixOffsetY)
  }

  function getTrench(x, y) {
    return trench.value((x / trenchScaleX) + trenchOffsetX, (y / trenchScaleY) + trenchOffsetY)
  }

  function getTrenchMix(x, y) {
    return trenchMix.value((x / trenchMixScaleX) + trenchMixOffsetX, (y / trenchMixScaleY) + trenchMixOffsetY)
  }

  return {
    currentValue: function() {
      const {x, y} = engine.position.getVector()
      return this.value(x, y)
    },
    import: function () {
      const srand = engine.utility.srand('terrain', 'floor', 'init')

      floorOffsetX = srand(-1, 1)
      floorOffsetY = srand(-1, 1)
      hillOffsetX = srand(-1, 1)
      hillOffsetY = srand(-1, 1)
      hillMixOffsetX = srand(-1, 1)
      hillMixOffsetY = srand(-1, 1)
      trenchOffsetX = srand(-1, 1)
      trenchOffsetY = srand(-1, 1)
      trenchMixOffsetX = srand(-1, 1)
      trenchMixOffsetY = srand(-1, 1)

      return this
    },
    reset: function () {
      floor.reset()
      hill.reset()
      hillMix.reset()
      trench.reset()
      trenchMix.reset()
      return this
    },
    value: (x, y) => {
      let value = content.const.lightZone - floorHeight - hillHeight

      value += getFloor(x, y) * floorHeight
      value += getHill(x, y) * getHillMix(x, y) * hillHeight
      value -= (getTrench(x, y) ** 0.5) * (getTrenchMix(x, y) ** 2) * trenchHeight

      return value
    }
  }
})()

engine.state.on('import', () => content.system.terrain.floor.import())
engine.state.on('reset', () => content.system.terrain.floor.reset())
