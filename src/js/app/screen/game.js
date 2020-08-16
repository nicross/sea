app.screen.game = (() => {
  let root,
    turboState = false

  function handleControls() {
    const game = app.controls.game(),
      ui = app.controls.ui()

    if (ui.backspace || ui.cancel || ui.escape || ui.start) {
      app.state.screen.dispatch('pause')
    }

    if (ui.turbo) {
      turboState = !turboState
    }

    content.system.movement.update({
      turbo: app.settings.computed.toggleTurbo ? turboState : game.turbo,
      ...game,
    })
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

  return {
    activate: function () {
      root = document.querySelector('.a-game')
      app.utility.focus.trap(root)

      app.state.screen.on('enter-game', onEnter)
      app.state.screen.on('exit-game', onExit)

      engine.state.on('reset', onEngineStateReset)

      return this
    },
  }
})()

app.once('activate', () => app.screen.game.activate())
