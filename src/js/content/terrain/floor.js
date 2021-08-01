content.terrain.floor = (() => {
  const floor = engine.utility.createNoiseWithOctaves({
    octaves: 8,
    seed: ['content', 'terrain', 'floor'],
    type: engine.utility.simplex2d,
  })

  const hill = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: ['content', 'terrain', 'floor', 'hill'],
    type: engine.utility.simplex2d,
  })

  const hillMix = engine.utility.createNoiseWithOctaves({
    octaves: 2,
    seed: ['content', 'terrain', 'floor', 'hillMix'],
    type: engine.utility.simplex2d,
  })

  const trench = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: ['content', 'terrain', 'floor', 'trench'],
    type: engine.utility.simplex2d,
  })

  const trenchMix = engine.utility.createNoiseWithOctaves({
    octaves: 4,
    seed: ['content', 'terrain', 'floor', 'trenchMix'],
    type: engine.utility.simplex2d,
  })

  const floorHeight = 250 / engine.utility.simplex2d.prototype.skewFactor,
    floorScale = 1000 / engine.utility.simplex2d.prototype.skewFactor,
    hillHeight = 250 / engine.utility.simplex2d.prototype.skewFactor,
    hillScale = 100 / engine.utility.simplex2d.prototype.skewFactor,
    hillMixScale = 1000 / engine.utility.simplex2d.prototype.skewFactor,
    trenchHeight = 1500 / engine.utility.simplex2d.prototype.skewFactor,
    trenchScaleX = 2500 / engine.utility.simplex2d.prototype.skewFactor,
    trenchScaleY = 10000 / engine.utility.simplex2d.prototype.skewFactor,
    trenchMixScaleX = 2500 / engine.utility.simplex2d.prototype.skewFactor,
    trenchMixScaleY = 10000 / engine.utility.simplex2d.prototype.skewFactor

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
      const srand = engine.utility.srand('content', 'terrain', 'floor', 'init')

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

engine.state.on('import', () => content.terrain.floor.import())
engine.state.on('reset', () => content.terrain.floor.reset())
