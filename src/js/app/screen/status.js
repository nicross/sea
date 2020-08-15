app.screen.status = (() => {
  let root

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.backspace || ui.cancel || ui.escape) {
      return onBackClick()
    }

    if (ui.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        return focused.click()
      }
    }

    if (ui.up) {
      return app.utility.focus.setPreviousFocusable(root)
    }

    if (ui.down) {
      return app.utility.focus.setNextFocusable(root)
    }
  }

  function onBackClick() {
    app.state.screen.dispatch('back')
  }

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    updateStatus()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  function updateStatus() {
    // TODO: Update status
  }

  app.once('activate', () => {
    root = document.querySelector('.a-status')

    app.state.screen.on('enter-status', onEnter)
    app.state.screen.on('exit-status', onExit)

    root.querySelector('.a-status--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)
  })

  return {}
})()
