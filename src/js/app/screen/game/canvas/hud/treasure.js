app.screen.game.canvas.hud.treasure = (() => {
  const main = app.screen.game.canvas

  main.hud.on('draw', draw)

  function draw({canvas, context}) {
    const treasures = engine.streamer.getStreamedProps().filter((prop) => {
      return content.prop.treasure.isPrototypeOf(prop)
    })

    for (const treasure of treasures) {
      const vector = main.toScreenFromRelative(treasure.relative)

      if (isOnscreen({canvas, context, vector})) {
        drawOnscreen(vector)
      } else {
        drawOffscreen({canvas, context, vector})
      }
    }
  }

  function drawOffscreen({canvas, context, vector}) {
    // TODO: Draw arrow
  }

  function drawOnscreen({canvas, context, vector}) {
    // TODO: Draw arc
  }

  function isOnscreen(vector) {
    return engine.utility.between(vector.x, 0, main.width())
      && engine.utility.between(vector.y, 0, main.height())
  }

  return {}
})()
