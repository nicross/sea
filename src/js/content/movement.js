content.movement = (() => {
  const pubsub = engine.utility.pubsub.create(),
    reflectionRate = 1/2,
    surfaceLeeway = engine.const.zero + (1 / (engine.const.gravity ** 1.25))

  const medium = engine.utility.machine.create({
    transition: {
      air: {
        land: function () {
          this.change('surface')
        },
      },
      surface: {
        dive: function () {
          this.change('underwater')
        },
        jump: function () {
          this.change('air')
        },
      },
      underwater: {
        surface: function () {
          this.change('surface')
        },
      },
    },
  })

  const mediumHandlers = {
    air: handleAir,
    surface: handleSurface,
    underwater: handleUnderwater,
  }

  let angularThrust = 0,
    isTurbo,
    lateralThrust = engine.utility.vector3d.create()

  let angularAcceleration = 0,
    angularDeceleration = 0,
    angularMaxVelocity = 0,
    lateralAcceleration = 0,
    lateralDeceleration = 0,
    lateralMaxVelocity = 0

  function applyAngularThrust(scale = 1) {
    const {yaw} = engine.position.getAngularVelocityEuler()

    if (!angularThrust) {
      return engine.position.setAngularVelocityEuler({
        yaw: content.utility.accelerate.value(
          yaw,
          0,
          angularDeceleration * scale
        ),
      })
    }

    const target = engine.utility.quaternion.fromEuler({
      yaw: content.utility.accelerate.value(
        yaw,
        angularThrust * angularMaxVelocity,
        angularAcceleration * scale
      ),
    })

    // Prevent large velocities going negative
    if (target.w < 0) {
      return
    }

    engine.position.setAngularVelocity(target)
  }

  function applyDrag(scale = 1) {
    const {yaw} = engine.position.getAngularVelocityEuler()
    const velocity = engine.position.getVelocity()

    engine.position.setAngularVelocityEuler({
      yaw: content.utility.accelerate.value(
        yaw,
        0,
        angularDeceleration * scale
      ),
    })

    engine.position.setVelocity(
      content.utility.accelerate.vector(
        velocity,
        engine.utility.vector3d.create({z: velocity.z}),
        lateralDeceleration * scale
      )
    )
  }

  function applyGravity(scale = 1) {
    const gravity = engine.const.gravity * engine.loop.delta() * scale,
      velocity = engine.position.getVelocity()

    engine.position.setVelocity({
      ...velocity,
      z: velocity.z - gravity,
    })
  }

  function applyLateralThrust(scale = 1, pitch = 0) {
    if (lateralThrust.isZero()) {
      return engine.position.setVelocity(
        content.utility.accelerate.vector(
          engine.position.getVelocity(),
          engine.utility.vector3d.create(),
          lateralDeceleration * scale
        )
      )
    }

    const currentVelocity = engine.position.getVelocity()
    let targetVelocity = lateralThrust.scale(lateralMaxVelocity).rotateQuaternion(engine.position.getQuaternion())

    if (pitch) {
      targetVelocity = targetVelocity.rotateEuler({pitch})
    }

    const rate = currentVelocity.distance() <= targetVelocity.distance()
      ? lateralAcceleration
      : lateralDeceleration

    engine.position.setVelocity(
      content.utility.accelerate.vector(
        currentVelocity,
        targetVelocity,
        rate * scale
      )
    )
  }

  function calculateModel() {
    const isAir = medium.is('air'),
      isUnderwater = medium.is('underwater')

    angularAcceleration = Math.PI

    angularDeceleration = medium.is('air')
      ? content.const.airAngularDeceleration
      : content.const.normalAngularDeceleration

    angularMaxVelocity = Math.PI / 2

    lateralAcceleration = isUnderwater
      ? (isTurbo ? content.const.underwaterTurboAcceleration : content.const.underwaterNormalAcceleration)
      : (isTurbo ? content.const.surfaceTurboAcceleration : content.const.surfaceNormalAcceleration)

    lateralDeceleration = isAir
      ? content.const.airDeceleration
      : content.const.normalDeceleration

    lateralMaxVelocity = isUnderwater
      ? (isTurbo ? content.const.underwaterTurboMaxVelocity : content.const.underwaterNormalMaxVelocity)
      : (isTurbo ? content.const.surfaceTurboMaxVelocity : content.const.surfaceNormalMaxVelocity)
  }

  function checkUnderwaterCollision() {
    const delta = engine.loop.delta(),
      deltaVelocity = engine.position.getVelocity().scale(delta),
      position = engine.position.getVector()

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

      if (content.terrain.isSolid(x, y, z)) {
        return true
      }
    }

    return false
  }

  function enforceSanity() {
    // Prevent quaternion from becoming extreme from too many turns
    engine.position.setQuaternion(
      engine.position.getQuaternion().normalize()
    )

    engine.position.setAngularVelocity(
      engine.position.getAngularVelocity().normalize()
    )
  }

  function getSurfacePitch() {
    const {yaw} = engine.position.getEuler()

    const delta = engine.loop.delta(),
      position = engine.position.getVector(),
      velocity = engine.position.getVelocity()

    const magnitude = velocity.subtract({z: velocity.z})
      .scale(delta)
      .distance()

    const ahead = position.add(
      engine.utility.vector2d.create({
        x: magnitude,
      }).rotate(yaw)
    )

    const surfaceAhead = content.surface.value(ahead.x, ahead.y),
      surfaceCurrent = content.surface.current()

    return Math.atan2(surfaceAhead - surfaceCurrent, magnitude)
  }

  function getSurfaceZ() {
    return content.surface.current()
  }

  function handleAir(controls = {}) {
    applyDrag()
    applyGravity()

    const velocity = engine.position.getVelocity()

    // Remain in air if positive z-velocity
    if (velocity.z > 0) {
      return
    }

    const {z} = engine.position.getVector()
    const surfaceZ = getSurfaceZ()

    // Remain in air while above surface
    if (z > surfaceZ + surfaceLeeway) {
      return
    }

    // Intersection with surface, trigger smack
    smack()

    // Dive if controls are pressed
    if (controls.z < 0) {
      return medium.dispatch('land', {
        diveImmediately: true,
      }).dispatch('dive')
    }

    // Skip if moving laterally with significant z-velocity
    const shouldSkip = (velocity.z < -1) && (velocity.x || velocity.y)

    if (!shouldSkip) {
      return medium.dispatch('land')
    }

    // Reflect z-velocity
    engine.position.setVelocity({
      ...velocity,
      z: velocity.z * -reflectionRate,
    })

    // Glue to surface
    setZ(getSurfaceZ())

    // Apply thrust
    const thrustScale = engine.performance.fps() / 4
    applyAngularThrust(thrustScale)
    applyLateralThrust(thrustScale)
  }

  function handleSurface(controls) {
    applyAngularThrust()
    applyLateralThrust(1, getSurfacePitch())

    const {z} = engine.position.getVector()

    const surfaceZ = getSurfaceZ(),
      velocity = engine.position.getVelocity()

    const isLateralMovement = velocity.x || velocity.y,
      maxSurfaceZ = surfaceZ + surfaceLeeway

    // Jump if moving up or not intersecting surface while moving laterally
    if (velocity.z > 0 || (z > maxSurfaceZ && isLateralMovement)) {
      return medium.dispatch('jump')
    }

    // Dive if controls are pressed
    if (controls.z < 0) {
      return medium.dispatch('dive')
    }

    // Splash if lateral movement and approaching incline
    if (z < maxSurfaceZ && isLateralMovement) {
      splash(surfaceZ)
    }

    // Glue to surface
    setZ(surfaceZ)
  }

  function handleUnderwater() {
    applyAngularThrust()
    applyLateralThrust()

    const velocity = engine.position.getVelocity()
    const {z} = engine.position.getVector()

    // Surface when at or above it, otherwise stick below it
    if (z >= getSurfaceZ()) {
      if (velocity.z > 0) {
        return medium.dispatch('surface')
      }

      setZ(getSurfaceZ() - engine.const.zero)
    }

    // Skip collision checks if none possible
    if (z > content.const.lightZone) {
      return
    }

    if (!checkUnderwaterCollision()) {
      return
    }

    engine.position.setVelocity(
      velocity.scale(-reflectionRate)
    )

    return pubsub.emit('underwater-collision', {
      normalized: velocity.normalize().rotateQuaternion(engine.position.getQuaternion().conjugate()),
      ratio: engine.utility.clamp(velocity.distance() / content.const.underwaterTurboMaxVelocity, 0, 1),
    })
  }

  function setTurbo(state) {
    if (isTurbo == state) {
      return
    }

    isTurbo = state
    calculateModel()
    pubsub.emit('transition-' + (isTurbo ? 'turbo' : 'normal'))
  }

  function setZ(z) {
    engine.position.setVector({
      ...engine.position.getVector(),
      z,
    })
  }

  function smack() {
    const velocity = engine.position.getVelocity()
    const {yaw} = engine.position.getAngularVelocityEuler()

    const lateralVelocity = engine.utility.distance({
      x: velocity.x,
      y: velocity.y,
    })

    // FYI: Max gravitational velocity is fastest player can jump from the water

    pubsub.emit('surface-smack', {
      gravity: engine.utility.clamp(Math.abs(velocity.z) / content.const.underwaterTurboMaxVelocity, 0, 1),
      lateral: engine.utility.clamp(lateralVelocity / lateralMaxVelocity, 0, 1),
      pan: engine.utility.clamp(engine.utility.scale(yaw / angularMaxVelocity, -1, 1, 1, 0), 0, 1),
    })
  }

  function splash(surfaceZ) {
    const velocity = engine.position.getVelocity()
    const {yaw} = engine.position.getAngularVelocityEuler()
    const {z} = engine.position.getVector()

    pubsub.emit('surface-splash', {
      pan: engine.utility.clamp(engine.utility.scale(yaw / angularMaxVelocity, -1, 1, 0, 1), 0, 1),
      size: (surfaceZ - z) / content.surface.max(),
      velocity: engine.utility.clamp(velocity.distance() / content.const.surfaceTurboMaxVelocity, 0, 1),
    })
  }

  function updateThrusters(controls) {
    if (medium.is('surface')) {
      controls.x = 0
      controls.z = 0
    } else if (medium.is('air')) {
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
      // XXX: Rotated 270 degrees
      x: controls.y,
      y: -controls.x,
      z: controls.z,
    })
  }

  medium.on('after', () => {
    calculateModel()
  })

  medium.on('before-dive', () => {
    // Just under the surface
    setZ(getSurfaceZ() - engine.const.zero)
  })

  medium.on('before-jump', () => {
    setZ(getSurfaceZ())
  })

  medium.on('before-land', (e) => {
    if (e.diveImmediately) {
      return
    }

    engine.position.setVelocity({
      ...engine.position.getVelocity(),
      z: 0,
    })

    setZ(getSurfaceZ())
  })

  medium.on('before-surface', () => {
    setZ(getSurfaceZ())
  })

  medium.on('enter-underwater', () => {
    const velocity = Math.abs(engine.position.getVelocity().z) / content.const.underwaterTurboMaxVelocity
    pubsub.emit('transition-underwater', engine.utility.clamp(velocity, 0, 1))
  })

  medium.on('exit-underwater', () => {
    const velocity = Math.abs(engine.position.getVelocity().z) / content.const.underwaterTurboMaxVelocity
    pubsub.emit('transition-surface', engine.utility.clamp(velocity, 0, 1))
  })

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

      medium.state = z >= 0
        ? (z > getSurfaceZ() ? 'air' : 'surface')
        : 'underwater'

      calculateModel()

      return this
    },
    isCatchingAir: () => medium.is('air'),
    isMedium: (state) => medium.is(state),
    isNormal: () => !isTurbo,
    isTurbo: () => isTurbo,
    isSurface: () => medium.is('surface'),
    isUnderwater: () => medium.is('underwater'),
    medium: () => medium.state,
    reset: function () {
      angularThrust = 0
      isTurbo = false

      lateralThrust.set({x: 0, y: 0, z: 0})
      medium.state = 'none'

      return this
    },
    update: function (controls = {}) {
      controls = {
        turbo: false,
        x: 0,
        y: 0,
        z: 0,
        ...controls,
      }

      setTurbo(Boolean(controls.turbo))
      updateThrusters({...controls})

      mediumHandlers[medium.state]({...controls})

      enforceSanity()

      return this
    },
  }, pubsub)
})()

engine.state.on('import', () => content.movement.import())
engine.state.on('reset', () => content.movement.reset())
