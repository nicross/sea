app.canvas.hud.coordinates = (() => {
  app.canvas.hud.on('draw', draw)

  function draw(e) {
    drawDepth(e)
    drawRelative(e)
  }

  function drawDepth({canvas, context}) {
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

  function drawRelative({canvas, context}) {
    const {x, y} = engine.position.getVector()

    const rem = app.utility.css.rem()
    const canvasX = canvas.width - rem

    context.fillStyle = '#FFFFFF'
    context.font = `${rem}px/${rem}px SuperSubmarine`
    context.strokeStyle = '#000000'
    context.textAlign = 'end'

    const nsLabel = y >= 0
      ? `${app.utility.format.number(y)} N`
      : `${app.utility.format.number(-y)} S`

    context.fillText(nsLabel, canvasX, canvas.height - (2 * rem))
    context.strokeText(nsLabel, canvasX, canvas.height - (2 * rem))

    const ewLabel = x >= 0
      ? `${app.utility.format.number(x)} E`
      : `${app.utility.format.number(-x)} W`

    context.fillText(ewLabel, canvasX, canvas.height - rem)
    context.strokeText(ewLabel, canvasX, canvas.height - rem)
  }

  return {}
})()
