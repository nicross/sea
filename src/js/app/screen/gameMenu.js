app.screen.gameMenu = (() => {
  let root

  function handleControls() {
    const controls = app.controls.ui()

    if (controls.backspace || controls.cancel || controls.escape || controls.start) {
      return app.state.screen.dispatch('resume')
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

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  app.once('activate', () => {
    root = document.querySelector('.a-gameMenu')

    app.state.screen.on('enter-gameMenu', onEnter)
    app.state.screen.on('exit-gameMenu', onExit)

    Object.entries({
      mainMenu: root.querySelector('.a-gameMenu--mainMenu'),
      misc: root.querySelector('.a-gameMenu--misc'),
      quit: root.querySelector('.a-gameMenu--quit'),
      resume: root.querySelector('.a-gameMenu--resume'),
      status: root.querySelector('.a-gameMenu--status'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.state.screen.dispatch(event))
    })

    root.querySelector('.a-gameMenu--action-quit').hidden = !app.isElectron()

    app.utility.focus.trap(root)
  })

  return {}
})()
