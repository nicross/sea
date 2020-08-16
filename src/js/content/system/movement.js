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

    const {x, y} = engine.position.get()

    if (content.system.z.get() > content.system.surface.height(x, y)) {
      // Catching air, no friction
      return engine.movement.update({
        rotate: 0,
        translate: {
          radius: 0,
          theta: 0,
        },
      })
    }

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
    if (z >= 0) {
      const {x, y} = engine.position.get()
      const {velocity} = engine.movement.get()
      const height = content.system.surface.height(x, y)

      if (velocity == 0) {
        z = height
      }

      if (z < height) {
        z = height
        // TODO: Emit splash event?
      }

      if (z > height) {
        zVelocity -= delta * engine.const.gravity
        z = Math.max(height, z + (delta * zVelocity))
      }

      if (z == height) {
        if (zVelocity) {
          // TODO: Emit smack event?
        }
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
