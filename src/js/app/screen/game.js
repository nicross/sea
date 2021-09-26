app.screen.game = (() => {
  let root,
    turboState = false

  engine.ready(() => {
    root = document.querySelector('.a-game')
    app.utility.focus.trap(root)

    app.state.screen.on('enter-game', onEnter)
    app.state.screen.on('exit-game', onExit)

    engine.state.on('reset', onEngineStateReset)

    return this
  })

  function handleControls({paused}) {
    const access = app.controls.access(),
      game = app.controls.game(),
      ui = app.controls.ui()

    if (ui.backspace || ui.escape || ui.select || ui.start) {
      app.state.screen.dispatch('pause')
    }

    if (access) {
      if (!paused) {
        content.movement.update()
      }
      return app.access.handle(access)
    }

    if (ui.turbo) {
      turboState = !turboState
    }

    if (paused) {
      return
    }

    const controls = {
      turbo: app.settings.computed.toggleTurbo ? turboState : game.turbo,
      ...game,
    }

    content.movement.update(controls)
    app.canvas.camera.applyLookY(controls.lookY || 0)

    if (ui.scanForward) {
      content.scan.triggerForward()
    } else if (ui.scanReverse) {
      content.scan.triggerReverse()
    }
  }

  function onEngineStateReset() {
    turboState = false
  }

  function onEnter() {
    app.utility.focus.set(root)
    engine.loop.on('frame', onFrame)
  }

  function onExit() {
    engine.loop.off('frame', onFrame)
  }

  function onFrame(e) {
    handleControls(e)
  }

  return {}
})()
