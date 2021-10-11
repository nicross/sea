app.canvas.hud.depth = (() => {
  app.canvas.hud.on('draw', draw)

  function draw({canvas, context}) {
    const z = engine.position.getVector().z

    if (z >= 0) {
      return
    }

    const alpha = engine.utility.clamp(engine.utility.scale(z, 0, content.const.lightZone/2, 0, 1)),
      depth = app.utility.format.number(-z),
      rem = app.utility.css.rem(),
      x = canvas.width - rem,
      y = canvas.height - (3 * rem)

    context.fillStyle = `rgba(0, 0, 0, ${alpha ** 2})`
    context.font = `${2 * rem}px SuperSubmarine`
    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`
    context.textAlign = 'end'

    context.fillText(depth, x, y)
    context.strokeText(depth, x, y)
  }

  return {}
})()
