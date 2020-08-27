content.system.movement = (() => {
  const pubsub = engine.utility.pubsub.create(),
    reflectionRate = 1/2

  let isTurbo = false,
    isCatchingAir = false,
    isUnderwater = false,
    zVelocity = 0

  function checkMovementCollision() {
    const movement = engine.movement.get()

    if (!movement.velocity) {
      return false
    }

    const position = engine.position.get(),
      radius = engine.const.positionRadius,
      z = content.system.z.get()

    const cos = Math.cos(movement.angle + position.angle),
      sin = Math.sin(movement.angle + position.angle)

    const deltaCos = cos * movement.deltaVelocity,
      deltaSin = sin * movement.deltaVelocity

    const points = [
      {
        x: position.x + deltaCos + radius,
        y: position.y + deltaSin + radius,
        z: z + radius,
      },
      {
        x: position.x + deltaCos - radius,
        y: position.y + deltaSin + radius,
        z: z + radius,
      },
      {
        x: position.x + deltaCos + radius,
        y: position.y + deltaSin - radius,
        z: z - radius,
      },
      {
        x: position.x + deltaCos - radius,
        y: position.y + deltaSin - radius,
        z: z - radius,
      },
    ]

    for (const {x, y, z} of points) {
      if (content.system.terrain.isSolid(x, y, z)) {
        return true
      }
    }

    return false
  }

  function checkZCollision(z) {
    const position = engine.position.get(),
      radius = engine.const.positionRadius

    const points = [
      {
        x: position.x + radius,
        y: position.y + radius,
      },
      {
        x: position.x - radius,
        y: position.y + radius,
      },
      {
        x: position.x + radius,
        y: position.y - radius,
      },
      {
        x: position.x - radius,
        y: position.y - radius,
      },
    ]

    z += engine.utility.sign(zVelocity) * engine.const.positionRadius

    for (const {x, y} of points) {
      if (content.system.terrain.isSolid(x, y, z)) {
        return true
      }
    }

    return false
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

      // Maintain momentum
      return engine.movement.update({
        rotate: 0,
        translate: {
          radius: engine.const.zero,
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

    if (isCatchingAir) {
      setCatchingAir(false)
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
      // Bounce off and prevent movement
      const movement = engine.movement.get()

      engine.movement.set({
        angle: engine.utility.normalizeAngle(movement.angle + Math.PI),
        rotation: movement.rotation,
        velocity: movement.velocity * reflectionRate,
      })

      return pubsub.emit('underwater-collision', {
        angle: movement.angle,
        velocity: movement.velocity / content.const.underwaterTurboMaxVelocity,
      })
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

      setCatchingAir(z > height)

      if (z == height && zVelocity < 0) {
        // Max velocity is fastest player can jump from the water
        pubsub.emit('surface-smack', {
          velocity: engine.utility.clamp(-zVelocity / content.const.underwaterTurboMaxVelocity, 0, 1),
        })

        if (zInput < 0) {
          // Intending to dive
          // Allow momentum to persist
        } else {
          if (zVelocity < -1 && velocity) {
            // Skip like a stone
            zVelocity *= -reflectionRate
          } else {
            // Eventually rest
            zVelocity = 0
          }
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

    if (!zVelocity) {
      return
    }

    z = z + (delta * zVelocity)

    if (checkZCollision(z)) {
      // Bounce off and prevent movement
      pubsub.emit('underwater-collision', {
        angle: 0,
        velocity: Math.abs(zVelocity) / content.const.underwaterTurboMaxVelocity,
      })

      zVelocity *= -reflectionRate
      return
    }

    content.system.z.set(z)
  }

  function setCatchingAir(state) {
    if (isCatchingAir != state) {
      isCatchingAir = state

      engine.const.movementDeceleration = isCatchingAir
        ? content.const.dragDeceleration
        : content.const.normalDeceleration

      engine.const.movementRotationalDeceleration = isCatchingAir
        ? content.const.dragRotationalDeceleration
        : content.const.normalRotationalDeceleration
    }
  }

  function setTurbo(state) {
    if (isTurbo != state) {
      isTurbo = state
      pubsub.emit('transition-' + (isTurbo ? 'turbo' : 'normal'))
    }
  }

  function setUnderwater(state) {
    if (isUnderwater != state) {
      if (state) {
        setCatchingAir(false)
      }

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
      setCatchingAir(false)
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

      handleZ(z, controls.z)

      if (z < 0) {
        handleUnderwater(controls)
      } else {
        handleSurface(controls)
      }

      return this
    },
    zVelocity: () => zVelocity,
  }, pubsub)
})()

engine.state.on('import', (state) => content.system.movement.import(state))
