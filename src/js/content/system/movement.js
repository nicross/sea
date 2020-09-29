content.system.movement = (() => {
  const pubsub = engine.utility.pubsub.create(),
    reflectionRate = 1/2

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
        engine.utility.vector3d.create(),
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
    angularAcceleration = Math.PI

    angularDeceleration = isCatchingAir
      ? content.const.airAngularDeceleration
      : content.const.normalAngularDeceleration

    angularMaxVelocity = Math.PI / 2

    lateralAcceleration = isUnderwater
      ? (isTurbo ? content.const.underwaterTurboAcceleration : content.const.underwaterNormalAcceleration)
      : (isCatchingAir ? 0 : (isTurbo ? content.const.surfaceTurboAcceleration : content.const.surfaceNormalAcceleration))

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

  function dive() {
    isCatchingAir = false
    setUnderwater(true)
    calculateModel()

    engine.position.setVector({
      ...engine.position.getVector(),
      z: 0,
    })

    applyAngularThrust()
    applyLateralThrust()
  }

  function handleAir(controls = {}) {
    const {x, y, z} = engine.position.getVector()
    const surfaceZ = content.system.surface.height(x, y)
    const isCollision = z <= surfaceZ

    applyDrag()
    applyGravity()

    if (!isCollision) {
      return
    }

    smack()

    const shouldDive = controls.z < 0

    if (shouldDive) {
      return dive()
    }

    const velocity = engine.position.getVelocity()
    const shouldSkip = (velocity.z < -1) && (velocity.x || velocity.y)

    if (!shouldSkip) {
      return land(surfaceZ)
    }

    engine.position.setVelocity({
      ...velocity,
      z: velocity.z * reflectionRate,
    })
  }

  function handleSurface() {
    const {x, y, z} = engine.position.getVector()

    const delta = engine.loop.delta(),
      surfaceZ = content.system.surface.height(x, y),
      velocity = engine.position.getVelocity()

    const nextZ = z + (delta * velocity.z) - ((delta ** 2) * engine.const.gravity),
      shouldGlue = (nextZ <= surfaceZ) || (!velocity.x && !velocity.y),
      shouldJump = !shouldGlue || (velocity.z > 0)

    if (shouldJump) {
      return jump()
    }

    const shouldDive = lateralThrust.z < 0

    if (shouldDive) {
      return dive()
    }

    if (shouldGlue) {
      engine.position.setVector({
        x,
        y,
        z: surfaceZ,
      })
    }

    const shouldSplash = (z < surfaceZ) && (velocity.x || velocity.y)

    if (shouldSplash) {
      splash(surfaceZ)
    }

    applyAngularThrust()
    applyLateralThrust()
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

  function jump() {
    isCatchingAir = true
    calculateModel()

    applyDrag()
    applyGravity()
  }

  function land(surfaceZ = 0) {
    isCatchingAir = false
    calculateModel()

    engine.position.setVelocity({
      ...engine.position.getVelocity(),
      z: 0,
    })

    engine.position.setVector({
      ...engine.position.getVector(),
      z: surfaceZ,
    })
  }

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

  function smack() {
    const velocity = engine.position.getVelocity()
    const {yaw} = engine.position.getAngularVelocityEuler()

    const lateralVelocity = engine.utility.distance({
      x: velocity.x,
      y: velocity.y,
    })

    // Max gravitational velocity is fastest player can jump from the water

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

    if (!isUnderwater) {
      controls.x = 0

      // XXX: Required for dive() to work
      controls.z = isCatchingAir ? 0 : Math.min(0, controls.z)
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
      } else if (isCatchingAir) {
        handleAir(controls)
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
