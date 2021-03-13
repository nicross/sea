app.canvas.celestials = (() => {
  const canvas = document.createElement('canvas'),
    context = canvas.getContext('2d'),
    horizonDistance = 5000,
    main = app.canvas

  let maxRadius,
    minRadius,
    moonColor,
    sunColor

  main.on('resize', () => {
    const height = main.height(),
      hfov = main.hfov(),
      width = main.width()

    canvas.height = height
    canvas.width = width

    minRadius = 0.125 * width / hfov / Math.PI
    maxRadius = minRadius * 4

    clear()
  })

  function calculateAlpha() {
    const surface = content.system.surface.currentHeight()
    const {z} = engine.position.getVector()

    if (z >= surface) {
      return 1
    }

    const depth = z - surface

    if (depth < -100) {
      return 0
    }

    return engine.utility.scale(depth, 0, -100, 1, 0) ** 4
  }

  function calculateColorMoon(pitch, alpha = 1) {
    const value = Math.abs(Math.sin(pitch))

    // Cache it
    moonColor = {
      h: engine.utility.lerpExp(25, 60, value, 0.25) / 360,
      s: engine.utility.lerpExp(100, 25, value, 0.75) / 100,
      l: engine.utility.lerpExp(75, 100, value, 0.875) / 100,
      a: alpha,
    }

    return toHsla(moonColor)
  }

  function calculateColorSun(pitch, alpha = 1) {
    const value = Math.abs(Math.sin(pitch))

    // Cache it
    sunColor = {
      h: engine.utility.lerpExp(25, 60, value, 2/3) / 360,
      s: engine.utility.lerpExp(100, 50, value, 0.75) / 100,
      l: engine.utility.lerp(
        engine.utility.lerpExp(50, 100, value, 0.75),
        100,
        (1 - (alpha ** 2))
      ) / 100,
      a: alpha,
    }

    return toHsla(sunColor)
  }

  function calculateHorizon() {
    const horizon = main.toScreenFromRelative({
      x: horizonDistance,
      y: 0,
      z: -engine.position.getVector().z,
    })

    return horizon.y
  }

  function calculatePitch(offset) {
    const clock = content.system.time.clock(),
      value = (2 * Math.PI * -clock) + offset

    return engine.utility.wrap(value, 0, Math.PI * 2)
  }

  function calculatePosition(pitch) {
    const {z} = engine.position.getVector()

    const relative = engine.utility.vector3d.create({
      x: horizonDistance,
      y: 0,
      z: -z,
    }).rotateEuler({
      pitch,
    }).rotateQuaternion(
      engine.position.getQuaternion().conjugate()
    )

    return main.toScreenFromRelative(relative)
  }

  function calculateRadius(pitch) {
    const value = Math.abs(Math.sin(pitch))
    return engine.utility.lerpExp(minRadius, maxRadius, 1 - value, 16)
  }

  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height)
  }

  function drawMoon() {
    drawObject({
      calculateColor: calculateColorMoon,
      offset: -Math.PI / 2,
    })
  }

  function drawObject({
    calculateColor,
    offset,
  } = {}) {
    const alpha = calculateAlpha()

    if (!alpha) {
      return
    }

    const pitch = calculatePitch(offset)

    const color = calculateColor(pitch, alpha),
      radius = calculateRadius(pitch),
      sun = calculatePosition(pitch)

    if (!engine.utility.between(sun.y, -radius, main.height() + radius)) {
      return
    }

    const horizon = calculateHorizon()

    if (sun.y > horizon) {
      return
    }

    let height = 2 * radius

    if (sun.y > horizon - radius) {
      height = 2 * Math.abs(sun.y - horizon)
    }

    if (!height) {
      return
    }

    const top = sun.y - (height / 2)

    context.shadowBlur = height
    context.shadowColor = color

    context.fillStyle = color
    context.fillRect(sun.x - radius, top, radius * 2, height)
  }

  function drawSun() {
    drawObject({
      calculateColor: calculateColorSun,
      offset: Math.PI / 2,
    })
  }

  function shouldDraw() {
    const {z} = engine.position.getVector()
    // calculateAlpha will always return 0 below this depth
    return z > -150
  }

  function toHsla({
    h = 0,
    s = 0,
    l = 0,
    a = 0,
  }) {
    return `hsla(${h * 360}, ${s * 100}%, ${l * 100}%, ${a})`
  }

  return {
    draw: function () {
      if (!shouldDraw()) {
        return this
      }

      clear()
      drawMoon()
      drawSun()

      // Draw to main canvas, assume identical dimensions
      main.context().drawImage(canvas, 0, 0)

      return this
    },
    moonColor: () => ({...moonColor}),
    sunColor: () => ({...sunColor}),
  }
})()
