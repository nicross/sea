app.screen.gameMenu = (() => {
  let root

  app.ready(() => {
    root = document.querySelector('.a-gameMenu')

    app.state.screen.on('enter-gameMenu', onEnter)
    app.state.screen.on('exit-gameMenu', onExit)

    Object.entries({
      fastTravel: root.querySelector('.a-gameMenu--fastTravel'),
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

  function handleControls() {
    const ui = app.controls.ui()

    if (ui.backspace || ui.cancel || ui.escape || ui.start) {
      return app.state.screen.dispatch('resume')
    }

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
    engine.loop.on('frame', onEngineLoopFrame)
    app.utility.focus.setWithin(root)

    root.querySelector('.a-gameMenu--action-fastTravel').hidden = !app.screen.fastTravel.hasOptions()
  }

  function onExit() {
    engine.loop.off('frame', onEngineLoopFrame)
  }

  return {}
})()
