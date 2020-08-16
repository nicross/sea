content.system.movement = (() => {
  const pubsub = engine.utility.pubsub.create()

  let isBoost = false,
    isUnderwater = false

  function handleSurface(controls) {
    if (isUnderwater || controls.boost != isBoost) {
      if (controls.boost) {
        switchToSurfaceBoost()
      } else {
        switchToSurfaceNormal()
      }
    }

    // TODO: No strafing
    // TODO: Gravity pulls to z = 0
  }

  function handleUnderwater(controls) {
    if (!isUnderwater || controls.boost != isBoost) {
      if (controls.boost) {
        switchToUnderwaterBoost()
      } else {
        switchToUnderwaterNormal()
      }
    }

    // TODO: Strafing
    // TODO: Detect collisions and prevent movement
  }

  function handleZ(z) {
    // TODO: Handle positive/negative z inputs
    // TODO: Detect collisions and prevent movement
  }

  function setBoost(state) {
    if (isBoost != state) {
      isBoost = state
      pubsub.emit(isBoost ? 'boost' : 'normal')
    }
  }

  function setUnderwater(state) {
    if (isUnderwater != state) {
      isUnderwater = state
      pubsub.emit(isUnderwater ? 'underwater' : 'surface')
    }
  }

  function switchToSurfaceBoost() {
    setBoost(true)
    setUnderwater(false)

    engine.const.movementAcceleration = content.const.surfaceBoostAcceleration
    engine.const.movementMaxVelocity = content.const.surfaceBoostMaxVelocity
  }

  function switchToSurfaceNormal() {
    setBoost(false)
    setUnderwater(false)

    engine.const.movementAcceleration = content.const.surfaceNormalAcceleration
    engine.const.movementMaxVelocity = content.const.surfaceNormalMaxVelocity
  }

  function switchToUnderwaterBoost() {
    setBoost(true)
    setUnderwater(true)

    engine.const.movementAcceleration = content.const.underwaterBoostAcceleration
    engine.const.movementMaxVelocity = content.const.underwaterBoostMaxVelocity
  }

  function switchToUnderwaterNormal() {
    setBoost(false)
    setUnderwater(true)

    engine.const.movementAcceleration = content.const.underwaterNormalAcceleration
    engine.const.movementMaxVelocity = content.const.underwaterNormalMaxVelocity
  }

  return engine.utility.pubsub.decorate({
    import: function ({z}) {
      isBoost = false
      isUnderwater = z < 0
      return this
    },
    update: function (controls = {}) {
      const z = content.system.z.get()

      if (z < 0) {
        handleUnderwater(controls)
      } else {
        handleSurface(controls)
      }

      handleZ(controls.z)

      return this
    },
  }, pubsub)
})()

engine.state.on('import', (data) => content.system.movement.import(data))
