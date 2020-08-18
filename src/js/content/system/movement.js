// TODO: Handle catching air differently
// when switching, z still obeys gravity, but movement deceleration switches to content.const.airResistanceDeceleration

content.system.movement = (() => {
  const pubsub = engine.utility.pubsub.create()

  let isTurbo = false,
    isCatchingAir = false,
    isUnderwater = false,
    zVelocity = 0

  function checkMovementCollision() {
    const {angle, deltaVelocity} = engine.movement.get()
    const z = content.system.z.get()

    let {x, y} = engine.position.get()

    x += Math.cos(angle) * deltaVelocity
    y += Math.sin(angle) * deltaVelocity

    return content.system.terrain.isCollision(x, y, z, deltaVelocity)
  }

  function checkZCollision(z, leeway) {
    const {x, y} = engine.position.get()
    return content.system.terrain.isCollision(x, y, z, leeway)
  }

  function handleSurface(controls) {
    if (isUnderwater || controls.turbo != isTurbo) {
      if (controls.turbo) {
        switchToSurfaceTurbo()
      } else {
        switchToSurfaceNormal()
      }
    }

    if (isCatchingAir) {
      const movement = engine.movement.get(),
        position = engine.position.get()

      // Maintain momentum, allow spinning
      return engine.movement.update({
        rotate: 0,
        translate: {
          radius: 0,
          theta: movement.angle - position.angle,
        },
      })
    }

    engine.movement.update({
      rotate: controls.rotate,
      translate: {
        radius: Math.abs(controls.y),
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

    // Update to see target vector for this frame, see checkMovementCollision()
    engine.movement.update({
      rotate: controls.rotate,
      translate: {
        radius: engine.utility.clamp(engine.utility.distanceOrigin(controls.x, controls.y), 0, 1),
        theta: Math.atan2(-controls.x, controls.y),
      },
    })

    if (checkMovementCollision()) {
      // Reset vector if collision is detected
      engine.movement.set({})
      return pubsub.emit('collision')
    }
  }

  function handleZ(z, zInput) {
    const delta = engine.loop.delta(),
      shouldSubmerge = zInput < 0 && z >= 0 && !isCatchingAir

    if (z >= 0 && !shouldSubmerge) {
      const {x, y} = engine.position.get()
      const {velocity} = engine.movement.get()
      const surface = content.system.surface.value(x, y)
      const height = surface * content.const.waveHeight

      if (velocity == 0 && zVelocity == 0) {
        // Move with surface height when stationary
        z = height
      }

      if (z < height && zVelocity == 0) {
        // Splash when moving toward higher water
        pubsub.emit('surface-splash', {
          size: (height - z) / content.const.waveHeight,
          velocity: velocity / content.const.surfaceTurboMaxVelocity,
        })

        z = height
      }

      if (z < height && zVelocity > 0) {
        // XXX: Cheat so launching into air from water works
        z = height
      }

      if (z > height) {
        // Decelerate from gravity when in the air
        zVelocity -= delta * engine.const.gravity
      }

      z += zVelocity * delta
      z = Math.max(height, z)

      isCatchingAir = z > height

      if (z == height && zVelocity < 0) {
        if (zInput >= 0) {
          // Max velocity is fastest player can jump from the water
          pubsub.emit('surface-smack', {
            velocity: engine.utility.clamp(-zVelocity / content.const.underwaterTurboMaxVelocity, 0, 1),
          })

          // Brick wall if not intending to dive
          zVelocity = 0
        } else {
          // Allow momentum to persist if intending to dive
          // Trigger the transition sound instead of smack
        }
      }

      return content.system.z.set(z)
    }

    if (z > 0) {
      // XXX: Cheat so submersion is instantaneous
      z = 0
    }

    if (zInput) {
      if (zVelocity > engine.const.movementMaxVelocity) {
        zVelocity -= delta * engine.const.movementDeceleration
      } else if (zVelocity < -engine.const.movementMaxVelocity) {
        zVelocity += delta * engine.const.movementDeceleration
      } else {
        zVelocity = engine.utility.clamp(zVelocity + (delta * zInput * engine.const.movementAcceleration), -engine.const.movementMaxVelocity, engine.const.movementMaxVelocity)
      }
    } else if (zVelocity > 0) {
      zVelocity = Math.max(0, zVelocity - (delta * engine.const.movementDeceleration))
    } else if (zVelocity < 0) {
      zVelocity = Math.min(0, zVelocity + (delta * engine.const.movementDeceleration))
    }

    z = z + (delta * zVelocity)

    if (checkZCollision(z, delta * Math.abs(zVelocity))) {
      zVelocity = 0
      return pubsub.emit('collision')
    }

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
      pubsub.emit('transition-' + (isUnderwater ? 'underwater' : 'surface'), zVelocity)
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
      isCatchingAir = false
      isTurbo = false
      isUnderwater = z < 0
      zVelocity = 0
      return this
    },
    isCatchingAir: () => isCatchingAir,
    isNormal: () => !isTurbo,
    isTurbo: () => isTurbo,
    isSurface: () => !isUnderwater,
    isUnderwater: () => isUnderwater,
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

engine.state.on('import', (state) => content.system.movement.import(state))
