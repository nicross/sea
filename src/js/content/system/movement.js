content.system.movement = (() => {
  const pubsub = engine.utility.pubsub.create()

  let isBoost = false,
    isUnderwater = false,
    zVelocity = 0

  function handleSurface(controls) {
    if (isUnderwater || controls.boost != isBoost) {
      if (controls.boost) {
        switchToSurfaceBoost()
      } else {
        switchToSurfaceNormal()
      }
    }

    // TODO: Check if catching air and set radius / rotation to zero

    engine.movement.update({
      rotate: controls.rotate,
      translate: {
        radius: controls.y,
        theta: controls.y >= 0 ? 0 : Math.PI,
      },
    })
  }

  function handleUnderwater(controls) {
    if (!isUnderwater || controls.boost != isBoost) {
      if (controls.boost) {
        switchToUnderwaterBoost()
      } else {
        switchToUnderwaterNormal()
      }
    }

    // TODO: Detect collisions
    // emit event, halt movement, and return early if movement is invalid

    engine.movement.update({
      rotate: controls.rotate,
      translate: {
        radius: engine.utility.clamp(engine.utility.distanceOrigin(controls.x, controls.y), 0, 1),
        theta: Math.atan2(-controls.x, controls.y),
      },
    })
  }

  function handleZ(z, zInput) {
    const delta = engine.loop.delta()

    if (z >= 0 && zInput > 0) {
      zInput = 0
    }

    // Surface gravity
    if (z > 0) {
      // TODO: Sample surface at position, pull z to height at surface

      zVelocity -= delta * engine.const.gravity
      z = Math.max(0, z + (delta * zVelocity))

      if (z == 0) {
        zVelocity = 0
      }

      return content.system.z.set(z)
    }

    if (zInput) {
      zVelocity = engine.utility.clamp(zVelocity + (delta * zInput * engine.const.movementAcceleration), -engine.const.movementMaxVelocity, engine.const.movementMaxVelocity)
    } else if (zVelocity > 0) {
      zVelocity = Math.max(0, zVelocity - (delta * engine.const.movementDeceleration))
    } else if (zVelocity < 0) {
      zVelocity = Math.min(0, zVelocity + (delta * engine.const.movementDeceleration))
    }

    z = Math.min(0, z + (delta * zVelocity))

    // TODO: Check collisions
    // emit event, halt velocity, and return early if next z is invalid

    content.system.z.set(z)
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

      handleZ(z, controls.z)

      return this
    },
  }, pubsub)
})()

engine.state.on('import', (data) => content.system.movement.import(data))
