app.canvas.hud.treasure = (() => {
  const arrowAngle = Math.PI / 2,
    main = app.canvas

  let arrowLength,
    lineWidth,
    treasureRadius

  main.hud.on('draw', draw)

  main.on('resize', () => {
    const width = main.width()

    arrowLength = (width / 1920) * 24
    lineWidth = Math.max(1, (width / 1920) * 3)
    treasureRadius = (width / 1920) * 96
  })

  function draw({canvas, context}) {
    if (!app.settings.computed.graphicsHudTreasureOn) {
      return
    }

    const drawDistance = engine.streamer.getRadius(),
      margin = app.utility.css.rem(4)

    const treasures = engine.streamer.getStreamedProps().filter((prop) => {
      return content.prop.treasure.isPrototypeOf(prop) && !prop.isCollected
    })

    for (const treasure of treasures) {
      const vector = app.canvas.camera.toScreenFromGlobal(treasure)
      vector.z = treasure.distance

      const distanceRatio = engine.utility.scale(vector.z, 0, drawDistance, 1, 0)
      let alpha = distanceRatio

      if (vector.z < 1/2) {
        alpha *= (vector.z * 2) ** 0.5
      }

      if (isOnscreen(vector)) {
        drawOnscreen({alpha, canvas, context, distanceRatio, vector})
      } else {
        drawOffscreen({alpha, canvas, context, margin, vector})
      }
    }
  }

  function drawOffscreen({
    alpha,
    context,
    margin,
    vector,
  }) {
    const height = main.height(),
      width = main.width(),
      x = engine.utility.clamp(vector.x, margin, width - margin),
      y = engine.utility.clamp(vector.y, margin, height - margin)

    const angle = Math.atan2(y - height/2, x - width/2),
      maxAngle = angle + arrowAngle/2,
      minAngle = angle - arrowAngle/2

    context.lineWidth = lineWidth
    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`

    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x - (arrowLength * Math.cos(maxAngle)), y - (arrowLength * Math.sin(maxAngle)))
    context.moveTo(x, y)
    context.lineTo(x - (arrowLength * Math.cos(minAngle)), y - (arrowLength * Math.sin(minAngle)))
    context.stroke()
  }

  function drawOnscreen({
    alpha,
    context,
    distanceRatio,
    vector,
  }) {
    const radius = engine.utility.lerpExp(treasureRadius / 4, treasureRadius, distanceRatio, 6)

    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`
    context.lineWidth = engine.utility.lerpExp(1, lineWidth, distanceRatio, 2)

    context.beginPath()
    context.arc(vector.x, vector.y, radius, 0, Math.PI * 2)
    context.stroke()
  }

  function isOnscreen(vector) {
    return engine.utility.between(vector.x, 0, main.width())
      && engine.utility.between(vector.y, 0, main.height())
  }

  return {}
})()
