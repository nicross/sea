app.screen.game.canvas.hud.treasure = (() => {
  const arrowAngle = Math.PI / 2,
    main = app.screen.game.canvas

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
    const drawDistance = engine.streamer.getRadius()

    const treasures = engine.streamer.getStreamedProps().filter((prop) => {
      return content.prop.treasure.isPrototypeOf(prop)
    })

    for (const treasure of treasures) {
      const vector = main.toScreenFromRelative(treasure.relative)
      vector.z = treasure.distance

      if (isOnscreen(vector)) {
        drawOnscreen({canvas, context, drawDistance, vector})
      } else {
        drawOffscreen({canvas, context, drawDistance, vector})
      }
    }
  }

  function drawOffscreen({
    context,
    drawDistance,
    vector,
  }) {
    const distanceRatio = engine.utility.scale(vector.z, 0, drawDistance, 1, 0),
      height = main.height(),
      width = main.width(),
      x = engine.utility.clamp(vector.x, 0, width),
      y = engine.utility.clamp(vector.y, 0, height)

    const alpha = distanceRatio ** 2,
      angle = Math.atan2(y - height/2, x - width/2),
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
    context,
    drawDistance,
    vector,
  }) {
    const distanceRatio = engine.utility.scale(vector.z, 0, drawDistance, 1, 0)

    const alpha = distanceRatio ** 2,
      radius = engine.utility.lerpExp(treasureRadius / 4, treasureRadius, distanceRatio, 6)

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
