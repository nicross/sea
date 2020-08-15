app.screen.mainMenu = (() => {
  let root

  function handleControls() {
    const ui = app.controls.ui()

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

  function onEngineLoopFrame(e) {
    handleControls(e)
  }

  function onEnter() {
    root.querySelector('.a-mainMenu--action-continue').hidden = !app.storage.hasGame()
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  app.once('activate', () => {
    root = document.querySelector('.a-mainMenu')

    app.state.screen.on('enter-mainMenu', onEnter)
    app.state.screen.on('exit-mainMenu', onExit)

    Object.entries({
      continue: root.querySelector('.a-mainMenu--continue'),
      misc: root.querySelector('.a-mainMenu--misc'),
      newGame: root.querySelector('.a-mainMenu--newGame'),
      quit: root.querySelector('.a-mainMenu--quit'),
    }).forEach(([event, element]) => {
      element.addEventListener('click', () => app.state.screen.dispatch(event))
    })

    root.querySelector('.a-mainMenu--action-quit').hidden = !app.isElectron()

    app.utility.focus.trap(root)
  })

  return {}
})()
