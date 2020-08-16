content.system.movement = (() => {
  const pubsub = engine.utility.pubsub.create()

  let isTurbo = false,
    isCatchingAir = false,
    isUnderwater = false,
    zVelocity = 0

  function handleSurface(controls) {
    if (isUnderwater || controls.turbo != isTurbo) {
      if (controls.turbo) {
        switchToSurfaceTurbo()
      } else {
        switchToSurfaceNormal()
      }
    }

    if (isCatchingAir) {
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
    if (!isUnderwater || controls.turbo != isTurbo) {
      if (controls.turbo) {
        switchToUnderwaterTurbo()
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
    const delta = engine.loop.delta(),
      shouldSubmerge = zInput < 0 && z >= 0 && !isCatchingAir

    if (z >= 0 && !shouldSubmerge) {
      const {x, y} = engine.position.get()
      const {velocity} = engine.movement.get()
      const surface = content.system.surface.value(x, y)
      const height = surface * content.const.waveHeight

      if (velocity == 0) {
        z = height
      }

      if (z < height) {
        pubsub.emit('surface-splash', (height - z) / content.const.waveHeight)
        z = height
      }

      if (z > height) {
        zVelocity -= delta * engine.const.gravity
        z = Math.max(height, z + (delta * zVelocity))
      }

      isCatchingAir = z > height

      if (z == height) {
        if (zVelocity) {
          // TODO: Look into scaling to a value [0,1]
          pubsub.emit('surface-smack', -zVelocity)
        }
        zVelocity = 0
      }

      return content.system.z.set(z)
    }

    if (z > 0) {
      // Cheat so submersion is instantaneous
      z = 0
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

  function setTurbo(state) {
    if (isTurbo != state) {
      isTurbo = state
      pubsub.emit('transition-' + (isTurbo ? 'turbo' : 'normal'))
    }
  }

  function setUnderwater(state) {
    if (isUnderwater != state) {
      isUnderwater = state
      pubsub.emit('transition-' + (isUnderwater ? 'underwater' : 'surface'))
    }
  }

  function switchToSurfaceTurbo() {
    setTurbo(true)
    setUnderwater(false)

    engine.const.movementAcceleration = content.const.surfaceTurboAcceleration
    engine.const.movementMaxVelocity = content.const.surfaceTurboMaxVelocity
  }

  function switchToSurfaceNormal() {
    setTurbo(false)
    setUnderwater(false)

    engine.const.movementAcceleration = content.const.surfaceNormalAcceleration
    engine.const.movementMaxVelocity = content.const.surfaceNormalMaxVelocity
  }

  function switchToUnderwaterTurbo() {
    setTurbo(true)
    setUnderwater(true)

    engine.const.movementAcceleration = content.const.underwaterTurboAcceleration
    engine.const.movementMaxVelocity = content.const.underwaterTurboMaxVelocity
  }

  function switchToUnderwaterNormal() {
    setTurbo(false)
    setUnderwater(true)

    engine.const.movementAcceleration = content.const.underwaterNormalAcceleration
    engine.const.movementMaxVelocity = content.const.underwaterNormalMaxVelocity
  }

  return engine.utility.pubsub.decorate({
    import: function ({z}) {
      isTurbo = false
      isUnderwater = z < 0
      return this
    },
    isCatchingAir: () => isCatchingAir,
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
    zVelocity: () => zVelocity,
  }, pubsub)
})()

engine.state.on('import', (data) => content.system.movement.import(data))
