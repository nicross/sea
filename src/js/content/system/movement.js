// TODO: Switch to a Vector3D model for controls, movement, and thrust
// This would simplify calculations and make then more sensible

content.system.movement = (() => {
  const pubsub = engine.utility.pubsub.create(),
    reflectionRate = 1/2

  const gravity = engine.utility.vector3d.create({
    z: engine.const.gravity,
  })

  let angularThrust = 0,
    isTurbo,
    isCatchingAir,
    isUnderwater,
    lateralThrust = engine.utility.vector3d.create()

  let angularAcceleration = 0,
    angularDeceleration = 0,
    angularMaxVelocity = 0,
    lateralAcceleration = 0,
    lateralDeceleration = 0,
    lateralMaxVelocity = 0

  function applyAngularThrust() {
    if (!angularThrust) {
      return engine.position.setAngularVelocityEuler({
        yaw: content.utility.accelerate.value(
          engine.position.getAngularVelocityEuler().yaw,
          0,
          angularDeceleration
        ),
      })
    }

    engine.position.setAngularVelocityEuler({
      yaw: content.utility.accelerate.value(
        engine.position.getAngularVelocityEuler().yaw,
        angularThrust * angularMaxVelocity,
        angularAcceleration
      ),
    })
  }

  function applyLateralThrust() {
    if (lateralThrust.isZero()) {
      return engine.position.setVelocity(
        content.utility.accelerate.vector(
          engine.position.getVelocity(),
          engine.utility.vector3d.create(),
          lateralDeceleration
        )
      )
    }

    const currentVelocity = engine.position.getVelocity(),
      targetVelocity = lateralThrust.scale(lateralMaxVelocity).rotateQuaternion(engine.position.getQuaternion())

    const rate = currentVelocity.distance() <= targetVelocity.distance()
      ? lateralAcceleration
      : lateralDeceleration

    engine.position.setVelocity(
      content.utility.accelerate.vector(
        currentVelocity,
        targetVelocity,
        rate
      )
    )
  }

  function calculateModel() {
    angularAcceleration = Math.PI

    angularDeceleration = isCatchingAir
      ? content.const.airAngularDeceleration
      : content.const.normalAngularDeceleration

    angularMaxVelocity = Math.PI / 2

    lateralAcceleration = isUnderwater
      ? (isTurbo ? content.const.underwaterTurboAcceleration : content.const.underwaterNormalAcceleration)
      : (isTurbo ? content.const.surfaceTurboAcceleration : content.const.surfaceNormalAcceleration)

    lateralDeceleration = isCatchingAir
      ? content.const.airDeceleration
      : content.const.normalDeceleration

    lateralMaxVelocity = isUnderwater
      ? (isTurbo ? content.const.underwaterTurboMaxVelocity : content.const.underwaterNormalMaxVelocity)
      : (isTurbo ? content.const.surfaceTurboMaxVelocity : content.const.surfaceNormalMaxVelocity)
  }

  function checkCollision() {
    const position = engine.position.getVector()
    const delta = engine.loop.delta()

    if (position.z > content.const.lightZone) {
      return false
    }

    const deltaVelocity = engine.position.getVelocity().scale(delta)

    if (deltaVelocity.isZero()) {
      return false
    }

    const radius = engine.const.positionRadius

    const vertices = [
      position.add({x: radius, y: radius, z: radius}),
      position.add({x: radius, y: -radius, z: radius}),
      position.add({x: radius, y: radius, z: -radius}),
      position.add({x: radius, y: -radius, z: -radius}),
      position.add({x: -radius, y: radius, z: radius}),
      position.add({x: -radius, y: -radius, z: radius}),
      position.add({x: -radius, y: radius, z: -radius}),
      position.add({x: -radius, y: -radius, z: -radius}),
    ]

    for (const vertex of vertices) {
      const {x, y, z} = vertex.add(deltaVelocity)

      if (content.system.terrain.isSolid(x, y, z)) {
        return true
      }
    }

    return false
  }

  function handleSurface() {
    // TODO: Rework
    /*
    if (isCatchingAir) {
      // Maintain momentum
      return updateMovement({
        rotate: 0,
        translate: {
          radius: engine.const.zero,
          theta: previousMovement.translate.theta,
        },
      })
    }

    let radius = Math.abs(controls.y),
      theta = controls.y >= 0 ? 0 : Math.PI

    const shouldLerp = previousMovement && (previousMovement.translate.radius != radius) && (previousMovement.translate.theta != theta)

    if (shouldLerp) {
      // Retain momentum, e.g. apply thrust to current movement, i.e. maintain bouncing sideways
      const delta = (engine.const.gravity * engine.loop.delta()) ** 0.5

      const points = [
        {
          x: Math.cos(previousMovement.translate.theta) * previousMovement.translate.radius,
          y: Math.sin(previousMovement.translate.theta) * previousMovement.translate.radius,
        },
        {
          x: controls.y,
          y: 0,
        },
      ]

      const point = {
        x: engine.utility.lerp(points[0].x, points[1].x, delta),
        y: engine.utility.lerp(points[0].y, points[1].y, delta),
      }

      radius = engine.utility.distance(point)
      theta = Math.atan2(point.y, point.x)
    }

    updateMovement({
      rotate: controls.rotate,
      translate: {
        radius,
        theta,
      },
    })

    if (shouldLerp) {
      // XXX: Prevent endless hops
      // TODO: Investigate why velocity becomes negative with lerping
      const movement = content.system.engineMovement.get()

      if (movement.velocity < 0) {
        content.system.engineMovement.set({
          ...movement,
          deltaVelocity: 0,
          velocity: 0,
        })
      }
    }
    */
  }

  function handleUnderwater() {
    applyAngularThrust()
    applyLateralThrust()

    if (checkCollision()) {
      const velocity = engine.position.getVelocity()

      engine.position.setVelocity(
        velocity.scale(-reflectionRate)
      )

      return pubsub.emit('underwater-collision', {
        normalized: velocity.normalize(),
        ratio: engine.utility.clamp(velocity.distance() / content.const.underwaterTurboMaxVelocity, 0, 1),
      })
    }
  }

  // TODO: Rework
  /*
  function handleZ(z, zInput) {
    const delta = engine.loop.delta(),
      shouldSubmerge = zInput < 0 && z >= 0 && !isCatchingAir

    if (z >= 0 && !shouldSubmerge) {
      const {x, y} = engine.position.getVector()
      const {velocity} = content.system.engineMovement.get()
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
          velocity: engine.utility.clamp(velocity / content.const.surfaceTurboMaxVelocity, 0, 1),
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
      if (zVelocity > content.const.movementMaxVelocity) {
        zVelocity -= delta * content.const.movementDeceleration
      } else if (zVelocity < -content.const.movementMaxVelocity) {
        zVelocity += delta * content.const.movementDeceleration
      } else {
        zVelocity = engine.utility.clamp(zVelocity + (delta * zInput * content.const.movementAcceleration), -content.const.movementMaxVelocity, content.const.movementMaxVelocity)
      }
    } else if (zVelocity > 0) {
      zVelocity = Math.max(0, zVelocity - (delta * content.const.movementDeceleration))
    } else if (zVelocity < 0) {
      zVelocity = Math.min(0, zVelocity + (delta * content.const.movementDeceleration))
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
  */

  function setTurbo(state) {
    if (isTurbo !== state) {
      isTurbo = state
      pubsub.emit('transition-' + (isTurbo ? 'turbo' : 'normal'))
    }
  }

  function setUnderwater(state) {
    if (isUnderwater !== state) {
      isUnderwater = state
      pubsub.emit('transition-' + (isUnderwater ? 'underwater' : 'surface'), engine.position.getVelocity().z)
    }
  }

  function updateThrusters(controls) {
    controls = {...controls}

    if (!isUnderwater) {
      controls.y = 0
      controls.z = 0
    }

    const distance = engine.utility.distance(controls)

    if (distance > 1) {
      controls.x /= distance
      controls.y /= distance
      controls.z /= distance
    }

    angularThrust = controls.rotate

    lateralThrust.set({
      x: controls.y,
      y: controls.x,
      z: controls.z,
    })
  }

  return engine.utility.pubsub.decorate({
    getAngularAcceleration: () => angularAcceleration,
    getAngularDeceleration: () => angularDeceleration,
    getAngularMaxVelocity: () => angularMaxVelocity,
    getAngularThrust: () => angularThrust,
    getLateralAcceleration: () => lateralAcceleration,
    getLateralDeceleration: () => lateralDeceleration,
    getLateralMaxVelocity: () => lateralMaxVelocity,
    getLateralThrust: () => lateralThrust.clone(),
    import: function () {
      const {z} = engine.position.getVector()

      isUnderwater = z < 0
      calculateModel()

      return this
    },
    isCatchingAir: () => isCatchingAir,
    isNormal: () => !isTurbo,
    isTurbo: () => isTurbo,
    isSurface: () => !isUnderwater,
    isUnderwater: () => isUnderwater,
    reset: function () {
      angularThrust = 0
      isCatchingAir = false
      isTurbo = false

      lateralThrust.set({x: 0, y: 0, z: 0})

      return this
    },
    update: function (controls = {}) {
      const {z} = engine.position.getVector()

      setUnderwater(z < 0)
      setTurbo(Boolean(controls.turbo))
      updateThrusters(controls)
      calculateModel()

      if (isUnderwater) {
        handleUnderwater()
      } else {
        handleSurface()
      }

      return this
    },
    zVelocity: () => engine.position.getVelocity().z, // TODO: Remove
  }, pubsub)
})()

engine.state.on('import', () => content.system.movement.import())
engine.state.on('reset', () => content.system.movement.reset())
