app.canvas.hud.coordinates = (() => {
  app.canvas.hud.on('draw', draw)

  function draw({canvas, context}) {
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
