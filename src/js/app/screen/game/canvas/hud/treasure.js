app.screen.game.canvas.hud.treasure = (() => {
  const main = app.screen.game.canvas

  let treasureRadius

  main.hud.on('draw', draw)

  main.on('resize', () => {
    treasureRadius = (main.width() / 1920) * 96
  })

  function draw({canvas, context}) {
    const drawDistance = engine.streamer.getRadius()

    const treasures = engine.streamer.getStreamedProps().filter((prop) => {
      return content.prop.treasure.isPrototypeOf(prop)
    })

    for (const treasure of treasures) {
      const relative = treasure.relative,
        screen = main.toScreenFromRelative(relative)

      if (isOnscreen(screen)) {
        drawOnscreen({canvas, context, drawDistance, relative, screen})
      } else {
        drawOffscreen({canvas, context, drawDistance, relative, screen})
      }
    }
  }

  function drawOffscreen({canvas, context, drawDistance, relative, screen}) {
    // TODO: Draw arrow
  }

  function drawOnscreen({context, drawDistance, relative, screen}) {
    const distanceRatio = engine.utility.scale(relative.distance(), 0, drawDistance, 1, 0)

    const alpha = distanceRatio ** 2,
      radius = engine.utility.lerpExp(treasureRadius / 4, treasureRadius, distanceRatio, 6)

    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`

    context.beginPath()
    context.arc(screen.x, screen.y, radius, 0, Math.PI * 2)
    context.stroke()
  }

  function isOnscreen(vector) {
    return engine.utility.between(vector.x, 0, main.width())
      && engine.utility.between(vector.y, 0, main.height())
  }

  return {}
})()
