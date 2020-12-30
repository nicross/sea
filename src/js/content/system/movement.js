content.system.movement = (() => {
  const pubsub = engine.utility.pubsub.create(),
    reflectionRate = 1/2

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

  function applyAngularThrust() {
    const {yaw} = engine.position.getAngularVelocityEuler()

    if (!angularThrust) {
      return engine.position.setAngularVelocityEuler({
        yaw: content.utility.accelerate.value(
          yaw,
          0,
          angularDeceleration
        ),
      })
    }

    engine.position.setAngularVelocityEuler({
      yaw: content.utility.accelerate.value(
        yaw,
        angularThrust * angularMaxVelocity,
        angularAcceleration
      ),
    })
  }

  function applyDrag() {
    const {yaw} = engine.position.getAngularVelocityEuler()
    const velocity = engine.position.getVelocity()

    engine.position.setAngularVelocityEuler({
      yaw: content.utility.accelerate.value(
        yaw,
        0,
        angularDeceleration
      ),
    })

    engine.position.setVelocity(
      content.utility.accelerate.vector(
        velocity,
        engine.utility.vector3d.create({z: velocity.z}),
        lateralDeceleration
      )
    )
  }

  function applyGravity() {
    const gravity = engine.const.gravity * engine.loop.delta(),
      velocity = engine.position.getVelocity()

    engine.position.setVelocity({
      ...velocity,
      z: velocity.z - gravity,
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
    const isAir = medium.is('air'),
      isUnderwater = medium.is('underwater')

    angularAcceleration = Math.PI

    angularDeceleration = medium.is('air')
      ? content.const.airAngularDeceleration
      : content.const.normalAngularDeceleration

    angularMaxVelocity = Math.PI / 2

    lateralAcceleration = isUnderwater
      ? (isTurbo ? content.const.underwaterTurboAcceleration : content.const.underwaterNormalAcceleration)
      : (isAir ? 0 : (isTurbo ? content.const.surfaceTurboAcceleration : content.const.surfaceNormalAcceleration))

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

      if (content.system.terrain.isSolid(x, y, z)) {
        return true
      }
    }

    return false
  }

  function getSurfaceZ() {
    const {x, y} = engine.position.getVector()
    return content.system.surface.height(x, y)
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
    if (z > surfaceZ) {
      return
    }

    // Intersection with surface, trigger smack
    smack()

    // Dive if controls are pressed
    if (controls.z < 0) {
      return medium.dispatch('land').dispatch('dive')
    }

    // Skip if moving laterally with significant z-velocity
    const shouldSkip = (velocity.z < -1) && (velocity.x || velocity.y)

    if (!shouldSkip) {
      return medium.dispatch('land')
    }

    // Reflect z-velocity while maintaining lateral velocities
    engine.position.setVelocity({
      ...velocity,
      z: velocity.z * -reflectionRate,
    })
  }

  function handleSurface(controls) {
    applyAngularThrust()
    applyLateralThrust()

    const {z} = engine.position.getVector()

    const surfaceZ = getSurfaceZ(),
      velocity = engine.position.getVelocity()

    const isLateralMovement = velocity.x || velocity.y

    // Jump if moving up or not intersecting surface while moving laterally
    if (velocity.z > 0 || (z > surfaceZ && isLateralMovement)) {
      return medium.dispatch('jump')
    }

    // Dive if controls are pressed
    if (controls.z < 0) {
      return medium.dispatch('dive')
    }

    // Glue to surface if not on it, splash if lateral movement
    if (z < surfaceZ) {
      setZ(surfaceZ)

      if (isLateralMovement) {
        splash(surfaceZ)
      }
    }
  }

  function handleUnderwater() {
    applyAngularThrust()
    applyLateralThrust()

    const {z} = engine.position.getVector()

    // Surface when at or above it
    if (z >= 0) {
      return medium.dispatch('surface')
    }

    // Skip collision checks if none possible
    if (z > content.const.lightZone) {
      return
    }

    if (!checkUnderwaterCollision()) {
      return
    }

    const velocity = engine.position.getVelocity()

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
      size: (surfaceZ - z) / content.const.waveHeight,
      velocity: engine.utility.clamp(velocity.distance() / content.const.surfaceTurboMaxVelocity, 0, 1),
    })
  }

  function updateThrusters(controls) {
    controls = {...controls}

    if (!medium.is('underwater')) {
      controls.x = 0
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
    setZ(-engine.const.zero)
  })

  medium.on('before-jump', () => {
    setZ(getSurfaceZ())
  })

  medium.on('before-land', () => {
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
    pubsub.emit('transition-underwater', engine.position.getVelocity().z)
  })

  medium.on('exit-underwater', () => {
    pubsub.emit('transition-surface', engine.position.getVelocity().z)
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
    reset: function () {
      angularThrust = 0
      isTurbo = false

      lateralThrust.set({x: 0, y: 0, z: 0})
      medium.state = 'none'

      return this
    },
    update: function (controls = {}) {
      setTurbo(Boolean(controls.turbo))
      updateThrusters(controls)

      mediumHandlers[medium.state](controls)

      return this
    },
  }, pubsub)
})()

engine.state.on('import', () => content.system.movement.import())
engine.state.on('reset', () => content.system.movement.reset())
