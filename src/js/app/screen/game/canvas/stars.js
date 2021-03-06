app.screen.game.canvas.stars = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    count = 1000,
    firmament = 5000,
    main = app.screen.game.canvas,
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
    const surface = content.system.surface.currentHeight()

    if (z < surface - 2) {
      return 0
    }

    const cycle = content.system.time.cycle()

    if (cycle >= 0.5) {
      return 0
    }

    const cycleFactor = engine.utility.scale(cycle, 0.5, 0, 0, 1) ** (1/3)

    const surfaceFactor = z >= surface
      ? 1
      : engine.utility.scale(z, surface, surface - 2, 1, 0)

    return cycleFactor * surfaceFactor
  }

  function calculateHorizon() {
    const horizon = main.toScreenFromRelative({
      x: firmament,
      y: 0,
      z: -engine.position.getVector().z,
    })

    return horizon.y
  }

  function calculateTwinkle(phase) {
    const time = content.system.time.time()
    const fmod = Math.sin(Math.PI * 1/20 * time)
    const f = engine.utility.lerp(2, 6, fmod)
    const amod = Math.sin((Math.PI * f * time) + phase) ** 2
    return 0.875 + (amod * 0.125)
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawStars() {
    const globalAlpha = calculateAlpha(),
        height = main.height(),
        hfov = main.hfov(),
        radius = 0.5,
        vfov = main.vfov(),
        width = main.width()

    if (globalAlpha <= 0) {
      return
    }

    const conjugate = engine.position.getQuaternion().conjugate(),
      cycle = 2 * Math.PI * content.system.time.cycle(),
      horizon = calculateHorizon()

    const horizonCutoff = horizon - (Math.max(1, (width / 1920) * 8))

    for (const star of stars) {
      const relative = engine.utility.vector3d.create({
        x: firmament,
      }).rotateEuler({
        pitch: -cycle,
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

      context.fillStyle = `rgba(255, 255, 255, ${alpha})`
      context.fillRect(screen.x - radius, screen.y - radius, radius * 2, radius * 2)
    }
  }

  function generate() {
    const srand = engine.utility.srand('stars')

    for (let i = 0; i < count; i += 1) {
      const delta = srand(-1, 1)

      stars.push({
        alpha: srand(1/8, 1),
        delta: Math.PI / 2 * (delta ** 3),
        phase: 2 * Math.PI * srand(),
        theta: 2 * Math.PI * srand(),
      })
    }
  }

  function shouldDraw() {
    const {z} = engine.position.getVector()
    // calculateAlpha will always return 0 below this depth
    return z > -2
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
