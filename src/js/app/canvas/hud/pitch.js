app.canvas.hud.depth = (() => {
  let lastPitch

  app.canvas.hud.on('draw', draw)

  function draw({canvas, context}) {
    if (!app.settings.computed.graphicsHudPitchOn) {
      return
    }

    const pitch = engine.utility.euler.fromQuaternion(
      app.canvas.camera.computedQuaternion()
    ).pitch || lastPitch

    lastPitch = pitch

    const height = Math.max(1, 4 * (canvas.width / 1920)),
      opacity = engine.utility.scale(Math.abs(pitch), 0, Math.PI/2, 1/8, 1),
      rem = app.utility.css.rem(),
      y = engine.utility.scale(pitch, -Math.PI/2, Math.PI/2, (canvas.height / 4) + (height / 2), (canvas.height * 3/4) - (height / 2))

    context.fillStyle = `rgba(255, 255, 255, ${opacity})`
    context.fillRect(canvas.width - rem, canvas.height/4, 1, canvas.height/2)
    context.fillRect(canvas.width - (rem * 1.5), y - (height / 2), rem * 0.5, height)
  }

  return {}
})()
