app.canvas.celestials = (() => {
  const canvasMain = document.createElement('canvas'),
    canvasTracers = document.createElement('canvas'),
    contextMain = canvasMain.getContext('2d'),
    contextTracers = canvasTracers.getContext('2d'),
    horizonDistance = 10000,
    main = app.canvas

  let maxRadius,
    minRadius,
    moonColor,
    sunColor

  main.on('resize', () => {
    const height = main.height(),
      hfov = main.hfov(),
      width = main.width()

    canvasMain.height = height
    canvasMain.width = width

    canvasTracers.height = height
    canvasTracers.width = width

    minRadius = 0.125 * width / hfov / Math.PI
    maxRadius = minRadius * 4

    clear()
  })

  function calculateAlpha() {
    const surface = content.surface.current()
    const {z} = app.canvas.camera.computedVector()

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

    return app.utility.color.toHslaString(moonColor)
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

    return app.utility.color.toHslaString(sunColor)
  }

  function calculateHorizon() {
    const cameraVector = app.canvas.camera.computedVector(),
      positionForward = engine.position.getQuaternion().forward()

    const screen = app.canvas.camera.toScreenFromGlobal({
      ...cameraVector.add(positionForward.scale(horizonDistance)),
      z: 0,
    })

    return screen.y
  }

  function calculatePitch(offset) {
    const clock = content.time.clock(),
      value = (2 * Math.PI * -clock) + offset

    return engine.utility.wrap(value, 0, Math.PI * 2)
  }

  function calculatePosition(pitch) {
    const {z} = app.canvas.camera.computedVector()

    const relative = engine.utility.vector3d.create({
      x: horizonDistance,
      y: 0,
      z: -z,
    }).rotateEuler({
      pitch,
    }).rotateQuaternion(
      app.canvas.camera.computedQuaternionConjugate()
    )

    return app.canvas.camera.toScreenFromRelative(relative)
  }

  function calculateRadius(pitch) {
    const value = Math.abs(Math.sin(pitch))
    return engine.utility.lerpExp(minRadius, maxRadius, 1 - value, 16)
  }

  function clear() {
    contextMain.clearRect(0, 0, canvasMain.width, canvasMain.height)
    contextTracers.clearRect(0, 0, canvasTracers.width, canvasTracers.height)
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

    const horizon = calculateHorizon(),
      pitch = calculatePitch(offset)

    const color = calculateColor(pitch, alpha),
      radius = calculateRadius(pitch),
      sun = calculatePosition(pitch)

    if (!engine.utility.between(sun.y, -3 * radius, horizon)) {
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

    // Draw rectangle on tracers context
    contextTracers.fillStyle = color
    contextTracers.fillRect(sun.x - radius, top, radius * 2, height)

    // Prevent artefacts by drawing glow on main context rather than on tracers
    contextMain.fillStyle = color
    contextMain.shadowBlur = height
    contextMain.shadowColor = color
    contextMain.fillRect(sun.x - radius, top, radius * 2, height)
    contextMain.clearRect(sun.x - radius, top, radius * 2, height)
  }

  function drawSun() {
    drawObject({
      calculateColor: calculateColorSun,
      offset: Math.PI / 2,
    })
  }

  function shouldDraw() {
    const {z} = app.canvas.camera.computedVector()
    // calculateAlpha will always return 0 below this depth
    return z > -150
  }

  return {
    draw: function () {
      if (!shouldDraw()) {
        return this
      }

      clear()
      drawMoon()
      drawSun()

      // Draw to main canvas (both channels), assume identical dimensions
      main.context().drawImage(canvasMain, 0, 0)
      main.tracers.touch().context().drawImage(canvasTracers, 0, 0)

      return this
    },
    moonColor: () => ({...moonColor}),
    sunColor: () => ({...sunColor}),
  }
})()
