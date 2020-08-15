app.screen.settings = (() => {
  let root

  function handleControls() {
    const controls = app.controls.ui()

    if (controls.backspace || controls.cancel || controls.escape || controls.start) {
      return app.state.screen.dispatch('back')
    }

    if (controls.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        return focused.click()
      }
    }

    if (controls.up) {
      return app.utility.focus.setPreviousFocusable(root)
    }

    if (controls.down) {
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
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
    // TODO: Save settings
  }

  app.once('activate', () => {
    root = document.querySelector('.a-settings')

    app.state.screen.on('enter-settings', onEnter)
    app.state.screen.on('exit-settings', onExit)

    root.querySelector('.a-settings--back').addEventListener('click', onBackClick)

    app.utility.focus.trap(root)

    // TODO: Hydrate settings
  })

  return {}
})()
