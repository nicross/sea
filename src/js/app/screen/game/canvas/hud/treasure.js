app.screen.game.canvas.hud.treasure = (() => {
  const main = app.screen.game.canvas

  let lineWidth,
    treasureRadius

  main.hud.on('draw', draw)

  main.on('resize', () => {
    const width = main.width()

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
      vector.z = treasure.relative.distance()

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
  }) {}

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
