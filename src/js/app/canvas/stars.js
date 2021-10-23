app.canvas.stars = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    count = 1000,
    cullPlaneHorizon = app.utility.plane.create(),
    cullPlaneNear = app.utility.plane.create(),
    cycleFadeMax = 2/3,
    cycleFadeMin = 1/3,
    depthCutoff = 1,
    firmament = 10000,
    main = app.canvas,
    starTree = engine.utility.octree.create(),
    twinkleField = engine.utility.simplex4d.create('twinkle')

  content.utility.ephemeralNoise.manage(twinkleField)

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    clear()
  })

  function calculateAlpha() {
    const {z} = app.canvas.camera.computedVector()
    const surface = content.surface.current()

    if (z < surface - depthCutoff) {
      return 0
    }

    const cycle = content.time.cycle()

    if (cycle >= cycleFadeMax) {
      return 0
    }

    const cycleFactor = cycle <= cycleFadeMin
      ? 1
      : engine.utility.scale(cycle, cycleFadeMin, cycleFadeMax, 1, 0) ** 0.5

    const surfaceFactor = z >= surface
      ? 1
      : engine.utility.scale(z, surface, surface - depthCutoff, 1, 0) ** 2

    return cycleFactor * surfaceFactor
  }

  function calculateHorizon() {
    const cameraVector = app.canvas.camera.computedVector(),
      positionForward = engine.position.getQuaternion().forward()

    const screen = app.canvas.camera.toScreenFromGlobal({
      ...cameraVector.add(positionForward.scale(firmament)),
      z: 0,
    })

    return screen.y
  }

  function calculateRadius() {
    const {z} = app.canvas.camera.computedVector()
    const surface = content.surface.current()

    if (z >= surface) {
      return 1
    }

    if (z < surface - depthCutoff) {
      return 16
    }

    const scaled = engine.utility.scale(z, surface, surface - depthCutoff, 0, 1)
    return engine.utility.lerpExp(1, 16, scaled, 2)
  }

  function calculateTwinkle(star, depth) {
    const time = content.time.time()

    const amod = Math.sin((2 * Math.PI * star.twinkleFrequency * time) + star.twinklePhase) ** 2
    const value = (1 - depth) + (amod * depth)
    const noise = twinkleField.value(star.x, star.y, star.z, time)

    return value * engine.utility.lerp(0, 1, noise, 1/16)
  }

  function calculateTwinkleDepth() {
    const {z} = app.canvas.camera.computedVector()
    const surface = content.surface.current()

    if (z >= surface) {
      return 1/4
    }

    if (z <= surface - depthCutoff) {
      return 1/2
    }

    return engine.utility.scale(z, surface, surface - depthCutoff, 1/4, 1/2)
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawStars() {
    const globalAlpha = calculateAlpha()

    if (globalAlpha <= 0) {
      return
    }

    const cameraVector = app.canvas.camera.computedVector(),
      globalRadius = calculateRadius(),
      horizon = calculateHorizon(),
      horizonCutoff = horizon - (Math.max(1, (main.width() / 1920) * 8)),
      stars = selectStars(),
      twinkleDepth = calculateTwinkleDepth()

    const globalRotation = engine.utility.quaternion.fromEuler({
      pitch: -2 * Math.PI * content.time.clock(),
    })

    // Cache min/max screen dimensions
    const maxX = main.width() + globalRadius,
      maxY = main.height() + globalRadius,
      minX = -globalRadius,
      minY = -globalRadius

    context.fillStyle = '#FFFFFF'

    for (const star of stars) {
      // Convert to screen space
      const screen = app.canvas.camera.toScreenFromGlobal(
        star.vector.rotateQuaternion(globalRotation).add(cameraVector)
      )

      // Optimization: Skip if offscreen
      if (!engine.utility.between(screen.x, minX, maxX) || !engine.utility.between(screen.y, minY, maxY)) {
        continue
      }

      // Calculate star alpha
      let alpha = star.alpha * globalAlpha

      // Fade when close to horizon
      if (screen.y > horizon - horizonCutoff) {
        alpha *= engine.utility.clamp(engine.utility.scale(screen.y, horizon - horizonCutoff, horizon, 1, 0), 0, 1)
      }

      alpha *= calculateTwinkle(star, twinkleDepth)

      // Draw
      const radius = star.radius * globalRadius

      context.globalAlpha = alpha
      context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
    }
  }

  function generate() {
    const srand = engine.utility.srand('stars')

    for (let i = 0; i < count; i += 1) {
      const delta = srand(-1, 1)

      const star = {
        alpha: srand(1/2, 1),
        delta: Math.PI / 2 * engine.utility.sign(delta) * (delta ** 2),
        theta: 2 * Math.PI * srand(),
        twinkleFrequency: srand(6, 10),
        twinklePhase: 2 * Math.PI * srand(),
        radius: engine.utility.lerpExp(0.5, 1.5, srand(), 8),
      }

      const vector = engine.utility.vector3d.unitX()
        .scale(firmament)
        .rotateEuler({
          pitch: star.theta,
          yaw: star.delta,
        })

      star.vector = vector
      star.x = vector.x
      star.y = vector.y
      star.z = vector.z

      starTree.insert(star)
    }
  }

  function selectStars() {
    return app.utility.octree.reduce(starTree, (center, radius) => {
      if (cullPlaneHorizon.distanceToPoint(center) < -radius) {
        return false
      }

      if (cullPlaneNear.distanceToPoint(center) < -radius) {
        return false
      }

      // TODO: Maybe there will be a cone here someday

      return true
    })
  }

  function updateCullingGeometry() {
    const timeOffset = engine.utility.quaternion.fromEuler({
      pitch: -2 * Math.PI * content.time.clock(),
    }).conjugate()

    // Update plane
    cullPlaneHorizon.normal = engine.utility.vector3d.unitZ().rotateQuaternion(timeOffset)
    cullPlaneNear.normal = app.canvas.camera.computedNormal().rotateQuaternion(timeOffset)

    // TODO: Maybe there will be a cone here someday
  }

  function shouldDraw() {
    const {z} = app.canvas.camera.computedVector()
    return z > -depthCutoff
  }

  engine.state.on('import', () => {
    generate()
  })

  engine.state.on('reset', () => {
    starTree.clear()
  })

  return {
    draw: function () {
      if (!shouldDraw()) {
        return this
      }

      clear()
      updateCullingGeometry()
      drawStars()

      // Draw to main canvas (tracers channel), assume identical dimensions
      main.tracers.touch().context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
