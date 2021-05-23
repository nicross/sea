app.canvas.stars = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    count = 1000,
    cycleFadeMax = 2/3,
    cycleFadeMin = 1/3,
    depthCutoff = 1,
    firmament = 5000,
    main = app.canvas,
    stars = []

  main.on('resize', () => {
    const height = main.height(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    clear()
  })

  function calculateAlpha() {
    const {z} = engine.position.getVector()
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

  function calculateRadius() {
    const {z} = engine.position.getVector()
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

  function calculateHorizon() {
    const horizon = main.toScreenFromRelative({
      x: firmament,
      y: 0,
      z: -engine.position.getVector().z,
    })

    return horizon.y
  }

  function calculateTwinkle(phase, depth = 0.125) {
    const time = content.time.time()

    const fmod = Math.sin((Math.PI * 1/20 * time) + phase)
    const f = engine.utility.lerp(2, 6, fmod)

    const amod = Math.sin((Math.PI * f * time) + phase) ** 2
    return (1 - depth) + (amod * depth)
  }

  function calculateTwinkleDepth() {
    const {z} = engine.position.getVector()
    const surface = content.surface.current()

    if (z >= surface) {
      return 1/8
    }

    if (z <= surface - depthCutoff) {
      return 1/2
    }

    return engine.utility.scale(z, surface, surface - depthCutoff, 1/8, 1/2)
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawStars() {
    const globalAlpha = calculateAlpha(),
      globalRadius = calculateRadius(),
      height = main.height(),
      hfov = main.hfov(),
      twinkleDepth = calculateTwinkleDepth(),
      vfov = main.vfov(),
      width = main.width()

    if (globalAlpha <= 0) {
      return
    }

    const conjugate = engine.position.getQuaternion().conjugate(),
      horizon = calculateHorizon(),
      rotation = -2 * Math.PI * content.time.clock()

    const horizonCutoff = horizon - (Math.max(1, (width / 1920) * 8))

    for (const star of stars) {
      const relative = engine.utility.vector3d.create({
        x: firmament,
      }).rotateEuler({
        pitch: rotation,
      }).rotateEuler({
        pitch: star.theta,
        yaw: star.delta,
      }).rotateQuaternion(conjugate)

      const hangle = Math.atan2(relative.y, relative.x)

      if (Math.abs(hangle) > hfov / 2) {
        continue
      }

      const vangle = Math.atan2(relative.z, relative.x)

      if (Math.abs(vangle) > vfov / 2) {
        continue
      }

      let alpha = star.alpha * globalAlpha * calculateTwinkle(star.phase)

      if (alpha <= 0) {
        continue
      }

      const screen = engine.utility.vector2d.create({
        x: (width / 2) - (width * hangle / hfov),
        y: (height / 2) - (height * vangle / vfov),
      })

      const horizon = calculateHorizon()

      if (screen.y > horizon) {
        continue
      }

      if (screen.y > horizon - horizonCutoff) {
        alpha *= engine.utility.scale(screen.y, horizon - horizonCutoff, horizon, 1, 0)
      }

      const radius = star.radius * globalRadius

      context.fillStyle = `rgba(255, 255, 255, ${alpha})`
      context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
    }
  }

  function generate() {
    const srand = engine.utility.srand('stars')

    for (let i = 0; i < count; i += 1) {
      const delta = srand(-1, 1)

      stars.push({
        alpha: srand(1/2, 1),
        delta: Math.PI / 2 * engine.utility.sign(delta) * (delta ** 2),
        phase: 2 * Math.PI * srand(),
        theta: 2 * Math.PI * srand(),
        radius: engine.utility.lerpExp(0.5, 1, srand(), 8),
      })
    }
  }

  function shouldDraw() {
    const {z} = engine.position.getVector()
    return z > -depthCutoff
  }

  engine.state.on('import', () => {
    generate()
  })

  engine.state.on('reset', () => {
    stars.length = 0
  })

  return {
    draw: function () {
      if (!shouldDraw()) {
        return this
      }

      clear()
      drawStars()

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
  }
})()
