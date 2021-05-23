content.movement = (() => {
  const pubsub = engine.utility.pubsub.create(),
    reflectionRate = 1/2,
    surfaceLeeway = 1/8

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
    const delta = engine.loop.delta(),
      position = engine.position.getVector(),
      velocity = engine.position.getVelocity().scale(delta)

    const magnitude = velocity.distance()

    if (!magnitude) {
      return 0
    }

    const ahead = position.add(velocity)

    const surfaceAhead = content.surface.value(ahead.x, ahead.y),
      surfaceCurrent = content.surface.current()

    return Math.atan2(surfaceAhead - surfaceCurrent, magnitude)
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
    const surface = content.surface.current()

    // Remain in air while above surface
    if (z > surface + surfaceLeeway) {
      return
    }

    // Intersection with surface, trigger sounds
    splash()
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
    setZ(content.surface.current())

    // Apply thrust
    const thrustScale = engine.performance.fps() / 4
    applyAngularThrust(thrustScale)
    applyLateralThrust(thrustScale)
  }

  function handleSurface(controls) {
    const pitch = getSurfacePitch()

    applyAngularThrust()
    applyLateralThrust(1, pitch)

    const {z} = engine.position.getVector()

    const surface = content.surface.current(),
      velocity = engine.position.getVelocity()

    const isLateralMovement = velocity.x || velocity.y,
      maxSurface = surface + surfaceLeeway

    // Jump if moving up
    if (z > maxSurface) {
      return medium.dispatch('jump')
    }

    // Dive if controls are pressed
    if (controls.z < 0) {
      return medium.dispatch('dive')
    }

    // Jumps feel better if this isn't applied before jumping
    rotateSurfaceVelocity(pitch)

    // Splash if lateral movement and approaching incline
    if (isLateralMovement) {
      splash(surface)
    }

    // Glue to surface
    setZ(surface)
  }

  function handleUnderwater(controls) {
    applyAngularThrust()
    applyLateralThrust()

    const velocity = engine.position.getVelocity()
    const {z} = engine.position.getVector()

    // Surface when at or above it, otherwise stick below it
    if (z >= content.surface.current()) {
      if (controls.z > 0 || velocity.z > 0) {
        return medium.dispatch('surface')
      }

      setZ(content.surface.current() - engine.const.zero)
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

  function rotateSurfaceVelocity(pitch) {
    const velocity = engine.position.getVelocity()

    if (velocity.subtract({z: velocity.z}).distance() < 2) {
      return
    }

    const target = velocity.subtract({z: velocity.z})
      .rotateEuler({pitch})
      .add({z: velocity.z})

    const next = content.utility.accelerate.vector(
      velocity,
      target,
      1
    )

    const normal = engine.utility.vector3d.unitX().rotateEuler({pitch})
    next.z = Math.max(normal.z, next.z)

    engine.position.setVelocity(next)
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

  function splash() {
    const surface = content.surface.current(),
      velocity = engine.position.getVelocity()

    const yaw = velocity.normalize().rotateQuaternion(
      engine.position.getQuaternion().conjugate()
    ).euler().yaw

    const {z} = engine.position.getVector()

    pubsub.emit('surface-splash', {
      pan: engine.utility.clamp(engine.utility.scale(yaw, -Math.PI/2, Math.PI/2, 1, 0), 0, 1),
      size: engine.utility.clamp((surface - z) / content.surface.max(), 0, 1),
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
    // Glue under surface
    setZ(content.surface.current() - engine.const.zero)

    // Prevent positive z-velocity
    const velocity = engine.position.getVelocity()

    if (velocity.z > 0) {
      engine.position.setVelocity(
        velocity.subtract({z: velocity.z})
      )
    }
  })

  medium.on('before-jump', () => {
    setZ(content.surface.current() + surfaceLeeway)
  })

  medium.on('before-land', (e) => {
    if (e.diveImmediately) {
      return
    }

    // Glue to surface
    setZ(content.surface.current())

    // Prevent z-velocity
    engine.position.setVelocity({
      ...engine.position.getVelocity(),
      z: 0,
    })
  })

  medium.on('before-surface', () => {
    // Glue to surface
    setZ(content.surface.current())

    // Prevent negative z-velocity
    const velocity = engine.position.getVelocity()

    if (velocity.z < 0) {
      engine.position.setVelocity(
        velocity.subtract({z: velocity.z})
      )
    }
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
        ? (z > content.surface.current() + surfaceLeeway ? 'air' : 'surface')
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
