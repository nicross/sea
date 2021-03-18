app.screen.mainMenu = (() => {
  let root

  engine.ready(() => {
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

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.confirm) {
      const focused = app.utility.focus.get(root)

      if (focused) {
        return focused.click()
      }
    }

    if ('focus' in ui) {
      const toFocus = app.utility.focus.selectFocusable(root)[ui.focus]

      if (toFocus) {
        if (app.utility.focus.is(toFocus)) {
          return toFocus.click()
        }

        return app.utility.focus.set(toFocus)
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

  return {}
})()
